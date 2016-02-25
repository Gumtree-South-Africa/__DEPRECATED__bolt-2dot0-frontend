'use strict';


var exphbs  = require('express-handlebars');
var glob = require('glob');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var Q = require("q");
var _ = require("underscore");


// middleware
var expressbuilder = require('./server/middlewares/express-builder');
var checksite = require('./server/middlewares/check-site');
var error = require('./modules/error');

// app
var controllers = glob.sync(process.cwd() + '/app/controllers/**/*.js');
var config = require('./server/config/sites.json');

// services
var configService = require(process.cwd() + "/server/services/configservice");

// Default list of all locales, if new locales are added, add it in this list
var allLocales = "es_MX,es_AR,es_US,en_ZA,en_IE,pl_PL,en_SG";
// If SITES param is passed as input param, load only those countries
var siteLocales = process.env.SITES || allLocales;


/*
 * Create Main App
 */
var app = new expressbuilder().getApp();
var siteCount = 0;

/*
 * Create Site Apps
 */
var siteApps = [];
Object.keys(config.sites).forEach(function(siteKey) {
    var siteObj = config.sites[siteKey];

    if (siteLocales.indexOf(siteObj.locale) > -1) {
	      (function(siteObj) {
		        var builderObj = new expressbuilder(siteObj.locale);
		        var siteApp = builderObj.getApp();
		
		        // send site information along
		        siteApp.locals.config = {};
		        siteApp.locals.config.name = siteObj.name;
		        siteApp.locals.config.locale = siteObj.locale;
		        siteApp.locals.config.country = siteObj.country;
		        siteApp.locals.config.hostname = siteObj.hostname;
		        siteApp.locals.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w-]*';
		
		        // Set BAPI Config Data
		        Q(configService.getConfigData(siteApp.locals.config.locale))
		      	.then(function (dataReturned) {
		      		siteApp.locals.config.bapiConfigData = dataReturned;
		  		}).fail(function (err) {
		  			console.warn("Error in ConfigService, reverting to local files:- ", err);
		  			siteApp.config.bapiConfigData = require('./server/config/bapi/config_' + siteApp.locals.config.locale + '.json');
		  		});
		
		        
		        // Template hbs caching.
		        // See: https://github.com/ericf/express-handlebars#template-caching
		        // Enables view template compilation caching and is enabled in production by default.
		        if (process.env.NODE_ENV) {
		          siteApp.enable('view cache');
		        }
		
		        // register bolt middleware
		        siteApp.use(checksite(siteApp));

		        // Setup Vhost per supported site
		        app.use(vhost(new RegExp(siteApp.locals.config.hostnameRegex), siteApp));
	      })(siteObj);
      
	      siteCount = siteCount + 1;
    }
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

module.exports = app;


function clearRequireCache(mod) {
	//console.log(mod);
  	Object.keys(require.cache).forEach(function(key) {
  		if (key.indexOf(mod) > -1) {
  			delete require.cache[key];
		}
  	});
}

function requireUncached(module){
	delete require.cache[require.resolve(module)];
    return require(module);
}
