'use strict';


var express = require('express'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    cookieParser = require('cookie-parser'),
    expressUncapitalize = require('express-uncapitalize'),
    logger = require('morgan'),
    methodOverride = require('method-override'),
    path = require('path'),
    fs = require('fs');

var config = {
    root: process.cwd()
};
var writeHeader = require('./write-header'),
    requestId = require('./request-id'),
    deviceDetection = require(config.root + '/modules/device-detection'),
    boltExpressHbs = require(config.root + '/modules/handlebars'),
    legacyDeviceRedirection = require(config.root + '/modules/legacy-mobile-redirection'),
    assets = require(config.root + '/modules/assets'),
    guardians = require(config.root + '/modules/guardians');

var middlewareloader = require(config.root + '/modules/environment-middleware-loader');

// create a write stream (in append mode)
var accessLog = (process.env.LOG_DIR || config.root) + '/access.log';
var accessLogStream = fs.createWriteStream(accessLog, {flags: 'a'});

var instance = require('instance');

function BuildApp(siteObj) {
    var app = new express();

    this.getApp = function() {
        return app;
    };


    // Only for Site Specific App
    if (typeof siteObj !== 'undefined') {

        // Bolt 2.0 Security
        app.use(guardians(app));

        // Check if we need to redirect to mweb - for legacy devices
        app.use(legacyDeviceRedirection());

        var locale = siteObj.locale;

        app.use(function(req, res, next){
          res.locals.i18n = instance(require('i18n'));
          res.locals.i18n.configure({
              updateFiles: false,
              objectNotation: true,
              directory: process.cwd() + '/app/locales/json/' + locale,
              prefix: 'translation_',
              defaultLocale: locale
          });
          next();
        })

        // Setting up locals object for app
        app.locals.config = {};
        app.locals.config.name = siteObj.name;
        app.locals.config.locale = siteObj.locale;
        app.locals.config.country = siteObj.country;
        app.locals.config.hostname = siteObj.hostname;
        app.locals.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w-]*';
        app.locals.i18n = instance(require('i18n'));

        //console.log('siteLocale: ',app.locals.i18n);

        app.locals.i18n.configure({
            updateFiles: false,
            objectNotation: true,
            directory: process.cwd() + '/app/locales/json/' + locale,
            fallback: 'en_ZA',
            updateFiles: true,
            syncFiles: true,
            register: global,
            prefix: 'translation_',
            defaultLocale: locale
        });


        app.use(function(req, res, next){
          console.log('res: ',req.host);
          if (req.host.indexOf('http://www.gumtree.pl') > -1){
            locale = 'pl_PL';
          }
          else if(req.host.indexOf('http://www.gumtree.sg') > -1){
            locale = 'en_SG';
          }
          else if(req.host.indexOf('http://www.gumtree.co.za') > -1){
            locale = 'en_ZA';
          }
          else if(req.host.indexOf('http://www.vivanuncios.com.mx') > -1){
            locale = 'es_MX';
          }
          else{
            locale = 'es_AR';
          }
          //res.locals.i18n = app.locals.i18n;
          res.locals.i18n.configure({
              updateFiles: false,
              objectNotation: true,
              directory: process.cwd() + '/app/locales/json/' + locale,
              prefix: 'translation_',
              defaultLocale: locale
          });
          next();
        })

        //app.locals.i18n.setLocale('pl_PL');
        //console.log('app.locals: ',app.locals.i18n);

        /*
         * Development based middlewares
         */
        middlewareloader()(['dev', 'mock', 'vm', 'vmdeploy'], function () {
            // assets for local developments and populates  app.locals.jsAssets
            app.use('/', compress());
            app.use(assets(app, typeof siteObj !== 'undefined' ? siteObj.locale : ''));
            app.use(logger('dev'));
            // for dev purpose lets make all static none cacheable
            // http://evanhahn.com/express-dot-static-deep-dive/
            app.use('/public', express.static(config.root + '/public', {
                root: '/public',
                etag: false,
                maxage: 0,
                index: false
            }));
            app.use('/views', express.static(config.root + '/app/views', {
                root: '/views',
                etag: false,
                maxage: 0,
                index: false
            }));

            if (app.locals.config) {
                app.locals.config.basePort = typeof process.env.PORT !== 'undefined' ? ':' + process.env.PORT : '';
            }
        });

        /*
         * Production based middlewares
         */
        middlewareloader()(['prod_ix5_deploy', 'prod_phx_deploy', 'pp_phx_deploy', 'lnp_phx_deploy'], function () {
            app.use('/', compress());
            app.use(logger('short'));

            if (app.locals.config) {
                app.locals.config.basePort = '';
            }
        });

        /*
         * Bolt 2.0 Must needed middlewares
         */
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use(methodOverride());
        app.use(expressUncapitalize());
        app.use(logger('combined', {stream: accessLogStream}));

        /*
         * Bolt 2.0 Custom middlewares
         */
        app.use(writeHeader('X-Powered-By', 'Bolt 2.0'));
        app.use(requestId());
        app.use(boltExpressHbs.create(app));
        app.use(deviceDetection.init());

        // Template hbs caching.
        if (process.env.NODE_ENV) {
            app.enable('view cache');
        }
    }
}

module.exports = BuildApp;
