'use strict';


var glob = require('glob');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var Q = require('q');
var _ = require('underscore');
var cuid = require('cuid');


// middleware
var expressbuilder = require('./server/middlewares/express-builder');
var siteconfig = require('./server/middlewares/site-config');
var responseMetrics = require('./server/middlewares/response-metrics');
var eventLoopMonitor = require('./server/utils/monitor-event-loop');
var error = require('./modules/error');

var cacheBapiData = require('./server/services/cache/cache-server-startup');

// app
var controllers = glob.sync(process.cwd() + '/app/controllers/**/*Controller.js');
var config = require('./server/config/sites.json');

// Default list of all locales, if new locales are added, add it in this list
var allLocales = 'es_MX,es_AR,es_US,en_ZA,en_IE,pl_PL,en_SG';
// If SITES param is passed as input param, load only those countries
var siteLocales = process.env.SITES || allLocales;


/*
 * Create Main App
 */
var app = new expressbuilder().getApp();
var requestId = cuid();
var siteCount = 0;

/*
 * Create Site Apps
 */
let createSiteApps = () => {
	let configPromises = [];
	let siteApps = [];
	Object.keys(config.sites).forEach(function(siteKey) {
	var siteObj = config.sites[siteKey];

    if (siteLocales.indexOf(siteObj.locale) > -1) {
	      (function(siteObj) {
			  	  var builderObj = new expressbuilder(siteObj);
		        var siteApp = builderObj.getApp();
		      siteApps.push(siteApp);

		        // Service Util to get Location and Category Data
		        // Wait to spin up the node app in server.js until all config promises resolve.
		        configPromises.push(cacheBapiData(siteApp, requestId));

		        // Setup Vhost per supported site
		        app.use(vhost(new RegExp(siteApp.locals.config.hostnameRegex), siteApp));
	      })(siteObj);

	      siteCount = siteCount + 1;
    }
 });
	return Q.all(configPromises).then(() => {
		//We need to configure the middleware stack in the correct order.
		siteApps.forEach((siteApp) => {
			// register bolt middleware
			siteApp.use(siteconfig(siteApp));
			siteApp.use(responseMetrics());
		});
		
		// Setup controllers
		controllers.forEach(function (controller) {
			require(controller)(app);
		});

		// Warning: do not reorder this middleware.
		// Order of this should always appear after controller middlewares are setup.
		app.use(error.four_o_four(app));

		// Overwriting the express's default error handler should always appear after 404 middleware
		app.use(error(app));
	});
};

// Event Loop Monitoring
eventLoopMonitor();

module.exports = app;
module.exports.createSiteApps = createSiteApps;

