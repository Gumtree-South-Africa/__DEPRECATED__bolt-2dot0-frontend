'use strict';

var glob = require('glob');
var http = require('http');
var i18n = require("i18next");
var path = require('path');
var vhost = require('vhost');

var expressbuilder = require('./server/middlewares/express-builder');
var checksite = require('./server/middlewares/check-site');

var controllers = glob.sync(process.cwd() + '/app/controllers/**/*.js');
var config = require('./server/config/sites.json');


/*
 * Create Main App
 */
var app = new expressbuilder().getApp();


/*
 * Create Site Apps
 */
var siteApp = null;
(function(siteApp) {
  Object.keys(config.sites).forEach(function(siteKey) {
      var siteObj = config.sites[siteKey];
      siteApp = new expressbuilder().getApp();

      // send site information along
      siteApp.config = {};
      siteApp.config.name = siteObj.name;
      siteApp.config.locale = siteObj.locale;
      siteApp.config.hostname = siteObj.hostname;
      siteApp.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w]*';

      // register i18n
      i18n.init({
          debug: true,
          // detect locale from cookies
          useCookie: false,
          // detect locale from querystring
          detectLngQS: false,
          // detect locale from headers
          detectLngFromHeaders: false,
          
          // define locale loading path
          resGetPath: path.join(process.cwd(), 'app', 'locales', 'json', siteApp.config.locale, '/translation.json'),
      });
      i18n.registerAppHelper(siteApp);

      // register bolt site checking middleware
      siteApp.use(checksite(siteApp));

      //Setup controllers
      controllers.forEach(function (controller) {
          require(controller)(siteApp);
      });

      // Setup Vhost per supported site
      app.use(vhost(new RegExp(siteApp.config.hostnameRegex), siteApp));
  });
})(siteApp);

//Setup controllers
controllers.forEach(function (controller) {
    require(controller)(app);
});

module.exports = app;
