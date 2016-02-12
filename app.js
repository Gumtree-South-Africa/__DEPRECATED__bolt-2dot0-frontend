'use strict';

var glob = require('glob');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var Q = require("q");
var _ = require("underscore");



// middleware
var expressbuilder = require('./server/middlewares/express-builder');
var checksite = require('./server/middlewares/check-site');

// app
var controllers = glob.sync(process.cwd() + '/app/controllers/**/*.js');
var config = require('./server/config/sites.json');

// services
var configService = require(process.cwd() + "/server/services/configservice");

//default list of all locales, if new locales are added, add it in this list
var allLocales = "es_MX,es_AR,es_US,en_ZA,en_IE,pl_PL,en_SG";
// if SITES param is passed as input param, load only those countries
var siteLocales = process.env.SITES || allLocales;


/*
 * Create Main App
 */
var app = new expressbuilder().getApp();
var siteCount = 0;



/*
 * Create Site Apps
 */
Object.keys(config.sites).forEach(function(siteKey) {
    var siteObj = config.sites[siteKey];
    
    if (siteLocales.indexOf(siteObj.locale) > -1) {
	      (function(siteObj) {
		        var builderObj = new expressbuilder(siteObj.locale);
		        // var siteApp = new expressbuilder(siteObj.locale).getApp();
		        var siteApp = builderObj.getApp();
		
		        // send site information along
		        siteApp.config = {};
		        siteApp.config.name = siteObj.name;
		        siteApp.config.locale = siteObj.locale;
		        siteApp.config.country = siteObj.country;
		        siteApp.config.hostname = siteObj.hostname;
		        siteApp.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w-]*';
		
		        // Set BAPI Config Data
		        // siteApp.config.bapiConfigData = require('./server/config/bapi/config_' + siteApp.config.locale + '.json');
		        console.log("Calling ConfigService to get ConfigData");
		        Q(configService.getConfigData(siteApp.config.locale))
		      	.then(function (dataReturned) {
		      		siteApp.config.bapiConfigData = dataReturned;
		  		}).fail(function (err) {
		  			console.log(new Error(err));
		  		});
		
		        // set req.lng to defined lng in vhost
		        siteApp.use(function(req, res, next) {
		          //var i18nObj = req.t;
		          // builderObj.setI18nObj(i18nObj);
		          req.lng = siteApp.config.locale;

		          // req.i18n.changeLanguage(siteApp.config.locale);
		          next();
		        });
		

		        // Template hbs caching.
		        // See: https://github.com/ericf/express-handlebars#template-caching
		        // Enables view template compilation caching and is enabled in production by default.
		        if (process.env.NODE_ENV) {
		          siteApp.enable('view cache');
		        }
		
		        // register bolt site checking middleware
		        siteApp.use(checksite(siteApp));
		
		        // Setup Vhost per supported site
		        app.use(vhost(new RegExp(siteApp.config.hostnameRegex), siteApp));
	      })(siteObj);
      
	      siteCount = siteCount + 1;
    }
 });

//Setup controllers
controllers.forEach(function (controller) {
    require(controller)(app);
});

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
