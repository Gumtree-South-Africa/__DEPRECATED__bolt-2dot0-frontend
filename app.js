'use strict';


let vhost = require('vhost');
let Q = require('q');
let _ = require('underscore');
let cuid = require('cuid');

// Apps
let appConfigJson = require('./app/config/appConfig.json');

// middleware
let expressbuilder = require('./server/middlewares/express-builder');
let siteconfig = require('./server/middlewares/site-config');
let responseMetrics = require('./server/middlewares/response-metrics');
let eventLoopMonitor = require('./server/utils/monitor-event-loop');
let monitorAgent = require('./server/utils/monitor/monitor-agent');
let error = require('./modules/error');

let cacheBapiData = require('./server/services/cache/cache-server-startup');

// config
let config = require('./server/config/sites.json');

// Default list of all locales, if new locales are added, add it in this list
let allLocales = 'es_MX,es_AR,es_US,en_ZA,en_IE,pl_PL,en_SG';
// If SITES param is passed as input param, load only those countries
let siteLocales = process.env.SITES || allLocales;


/*
 * Create Main App
 */
let app = new expressbuilder().getApp();
let requestId = cuid();
let siteCount = 0;

/*
 * Create Site Apps
 */
let createSiteApps = () => {
	let configPromises = [];
	let siteApps = [];

	_.each(config.sites, (site) => {
		if (siteLocales.indexOf(site.locale) > -1) {
			(function(siteObj) {
				let builderObj = new expressbuilder(siteObj);
				let siteApp = builderObj.getApp();
				siteApp.locals.siteObj = siteObj;
				siteApps.push(siteApp);

				// Update ZK with local config file provided in devMode
				if (siteApp.locals.devMode === true) {
					cacheBapiData.updateConfig(site.locale, requestId);
				}

				// Service Util to get Location and Category Data
				// Wait to spin up the node app in server.js until all config promises resolve.
				configPromises.push(cacheBapiData(siteApp, requestId));
			})(site);

			siteCount = siteCount + 1;
		}
	});

	return Q.all(configPromises).then(() => {
		// ***** App HealthCheck *****
		let BootApp = require('./app/appBoot/app');
		let bootAppObj = new BootApp().getApp();
		app.use('/boot', bootAppObj);

		// ***** App Sites *****
		//We need to configure the middleware stack in the correct order.
		siteApps.forEach((siteApp) => {
			// register bolt middleware
			siteApp.use(siteconfig(siteApp));

			_.each(appConfigJson, (appConfig) => {
				let App = require(appConfig.path);
				let appObj = new App(siteApp, appConfig.routePath, appConfig.viewPath).getApp();

				appObj.use(responseMetrics());
				siteApp.use(appConfig.mainRoute, appObj);
			});

			// Setup Vhost per supported site
			app.use(vhost(new RegExp(siteApp.locals.config.hostnameRegex), siteApp));
		});

		// ***** App 404 Error *****
		// Warning: do not reorder this middleware.
		// Order of this should always appear after controller middlewares are setup.
		app.use(error.four_o_four(app));

		// ***** App Error *****
		// Overwriting the express's default error handler should always appear after 404 middleware
		app.use(error(app));
	});
};

// Event Loop Monitoring
eventLoopMonitor();
monitorAgent.startMonitoring();


module.exports = app;
module.exports.createSiteApps = createSiteApps;
