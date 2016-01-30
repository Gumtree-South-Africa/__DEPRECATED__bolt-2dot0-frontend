'use strict';

var glob = require('glob');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var _ = require("underscore");

// i18n, its middleware and its backend modules.
var i18next = require("i18next");
var middleware = require('i18next-express-middleware');
var Backend = require('i18next-node-fs-backend');

var expressbuilder = require('./server/middlewares/express-builder');
var checksite = require('./server/middlewares/check-site');

var controllers = glob.sync(process.cwd() + '/app/controllers/**/*.js');
var config = require('./server/config/sites.json');

/*
 * Create Main App
 */
var app = new expressbuilder().getApp();
var siteCount = 0;

/*
 * Create the Main i18n object
 */
i18next
  .use(Backend)
  .init({
    //lng : 'es_MX_VNS',
    ns : 'translation',
    // use correct configuration options...look up docs!
    backend: {

      loadPath: __dirname + '/app/locales/json/{{lng}}/{{ns}}.json'
    }
  });


/*
 * Create Site Apps
 */
 Object.keys(config.sites).forEach(function(siteKey) {
    var siteObj = config.sites[siteKey];
    
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

      // use the middleware to do the magic
      // create a fixed t function for req.lng
      // no clones needed as they just would do the same (sharing all but lng)

      // set req.lng to defined lng in vhost
      siteApp.use(function(req, res, next) {
        //var i18nObj = req.t;
        // builderObj.setI18nObj(i18nObj);
        req.lng = siteApp.config.locale;
        i18next.changeLanguage(siteApp.config.locale);
        // req.i18n.changeLanguage(siteApp.config.locale);
        next();
      });

      // use the middleware to do the magic
      // create a fixed t function for req.lng
      // no clones needed as they just would do the same (sharing all but lng)
      siteApp.use(middleware.handle(i18next));

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
 });
 
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