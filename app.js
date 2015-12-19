'use strict';

var glob = require('glob');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var _ = require("underscore");

var expressbuilder = require('./server/middlewares/express-builder');
var checksite = require('./server/middlewares/check-site');

var controllers = glob.sync(process.cwd() + '/app/controllers/**/*.js');
var config = require('./server/config/sites.json');


/*
 * Create Main App
 */
var app = new expressbuilder().getApp();
var i18nclone = [];
var siteCount = 0;

/*
 * Create Site Apps
 */
 Object.keys(config.sites).forEach(function(siteKey) {
    var siteObj = config.sites[siteKey];
    
    (function(siteObj) {
      var siteApp = new expressbuilder(siteObj.locale).getApp();

      // send site information along
      siteApp.config = {};
      siteApp.config.name = siteObj.name;
      siteApp.config.locale = siteObj.locale;
      siteApp.config.hostname = siteObj.hostname;
      siteApp.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w]*';
      
      // register i18n
      var i18n = requireUncached("i18next/index.js");
      i18nclone[siteCount] = _.extend({}, i18n);
      i18nclone[siteCount].init({
          debug: true,
          // detect locale from cookies
          useCookie: false,
          // detect locale from querystring
          detectLngQS: false,
          // detect locale from headers
          detectLngFromHeaders: false,
          
          lng: siteApp.config.locale,
          fallbackLng: false, 

          // define locale loading path
          resGetPath: path.join(process.cwd(), 'app', 'locales', 'json', siteApp.config.locale, '/translation.json')
      });
      i18nclone[siteCount].registerAppHelper(siteApp);
      siteApp.use(i18nclone[siteCount].handle);
      
      // register bolt site checking middleware
      siteApp.use(checksite(siteApp));

      // Setup Vhost per supported site
      app.use(vhost(new RegExp(siteApp.config.hostnameRegex), siteApp));
    })(siteObj);

    siteCount = siteCount + 1;
 });
 
 console.dir(siteCount);
 console.dir(i18nclone);

//Setup controllers
controllers.forEach(function (controller) {
    require(controller)(app);
});

module.exports = app;


function clearRequireCache(mod) {
	console.log(mod);
  	Object.keys(require.cache).forEach(function(key) {
  		if (key.indexOf(mod) > -1) {
//  			console.log("found");  
//  			console.log(key);
  			delete require.cache[key];
		}
  	});  
}

function requireUncached(module){
	delete require.cache[require.resolve(module)];
    return require(module); 
}