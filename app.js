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
let versionconfig = require('./server/middlewares/version-config');
let eventLoopMonitor = require('./server/utils/monitor-event-loop');
let monitorAgent = require('./server/utils/monitor/monitor-agent');
let error = require('./modules/error');

let cacheBapiData = require('./server/services/cache/cache-server-startup');

// config
let config = require('./server/config/site/sites.json');

// Default list of all locales, if new locales are added, add it in this list
let allLocales = 'es_MX,es_AR,en_ZA,en_IE,pl_PL,en_SG';
// If SITES param is passed as input param, load only those countries
let siteLocales = process.env.SITES || allLocales;

// For dev usage
let environmentConfig = require('config');
let proxy = require('http-proxy-middleware');


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
	let siteApps = [];
	let configPromises = [];

	_.each(config.sites, (site) => {
		if (siteLocales.indexOf(site.locale) > -1) {
			(function(siteObj) {
				let builderObj = new expressbuilder(siteObj, false);
				let siteApp = builderObj.getApp();
				siteApp.locals.siteObj = siteObj;
				siteApps.push(siteApp);

				// Update ZK with local config file provided in devMode
				if (siteApp.locals.devMode === true) {
					//need to ensure that puts finish before gets.
					configPromises.push(
						cacheBapiData.updateConfig(site.locale, requestId).then(() => {
							return cacheBapiData(siteApp, requestId);
						})
					);
				} else {
					// Service Util to get Location and Category Data
					// Wait to spin up the node app in server.js until all config promises resolve.
					configPromises.push(cacheBapiData(siteApp, requestId));
				}})(site);

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
			// Site Configuration for each Site App
			siteApp.use(siteconfig(siteApp));

			// Version Configuration for each Site App
			siteApp.use(versionconfig(siteApp.locals.config.locale));

			_.each(appConfigJson, (appConfig) => {
				let App = require(appConfig.path);
				let appObj = new App(siteApp, appConfig.routePath, appConfig.viewPath).getApp();

				siteApp.use(appConfig.mainRoute, appObj);
			});

			// In develop mode, add proxy so that Node can proxy to RUI server.
			// This should be registered after all routing.

			// To use that, you should add config in your xxx.json in server/config
			// A sample is:
			// "devFeatures": {
			//     "ruiProxy": {
			//         "domainBase": "sharon-fp003-4464.slc01.dev.ebayc3.com",
			//         "port": 443
			//     }
			// }

			if (siteApp.locals.devMode) {
				let ruiProxyConfig = null;
				try {
					ruiProxyConfig = environmentConfig.get('devFeatures.ruiProxy');
				} catch(e) {
					// It's OK to not having this config
				}
				if (ruiProxyConfig && ruiProxyConfig.domainBase) {
					// By default, we will use HTTPS no matter what protocol for current site
					let ruiPort = ruiProxyConfig.port || 443;
					let defaultTarget = `https://${ruiProxyConfig.domainBase}:${ruiPort}`;
					let proxyMiddlewareConfig = {
						target: defaultTarget,
						changeOrigin: true,
						xfwd: true,
						autoRewrite: true,
						// Don't verify SSL as it's develop mode
						secure: false,
						router: (req) => {
							let hostname = req.vhost && req.vhost.hostname;
							if (!hostname) {
								return defaultTarget;
							}
							let hostnameIndex = hostname.indexOf(siteApp.locals.config.hostname);
							if (hostnameIndex < 0) {
								return defaultTarget;
							}
							let ruiDomain = hostname.substring(
								0, hostnameIndex + siteApp.locals.config.hostname.length);
							return `https://${ruiDomain}.${ruiProxyConfig.domainBase}:${ruiPort}`;
						}
					};
					if (ruiProxyConfig.basePath) {
						proxyMiddlewareConfig.pathRewrite = {
							'^/': ruiProxyConfig.basePath
						};
					}
					siteApp.use(proxy(proxyMiddlewareConfig));
				}
			}

			// Setup Vhost per supported site
			app.use(vhost(new RegExp(siteApp.locals.config.hostnameRegex), siteApp));
		});

		// ***** App 404 Error *****
		// Warning: do not reorder this middleware.
		// Order of this should always appear after controller middlewares are setup.
		app.use(error.four_o_four());

		// ***** App Error *****
		// Overwriting the express's default error handler should always appear after 404 middleware
		app.use(error());
	});
};

// Event Loop Monitoring
eventLoopMonitor();
monitorAgent.startMonitoring();

module.exports = app;
module.exports.createSiteApps = createSiteApps;
