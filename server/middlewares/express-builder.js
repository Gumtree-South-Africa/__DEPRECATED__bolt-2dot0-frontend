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
var legacyDeviceRedirection = require(config.root + '/modules/legacy-mobile-redirection'),
    guardians = require(config.root + '/modules/guardians'),
    deviceDetection = require(config.root + '/modules/device-detection'),
    checkAuthentication = require(config.root + '/server/middlewares/check-authentication'),
    checkMobileOnly = require(config.root + '/server/middlewares/check-mobileDevice'),
    boltExpressHbs = require(config.root + '/modules/handlebars'),
    assets = require(config.root + '/modules/assets'),
    checkIp = require(config.root + '/server/middlewares/check-ip'),
    checkMachineId = require(config.root + '/server/middlewares/check-machineid'),
    checkUserAgent = require(config.root + '/server/middlewares/check-useragent'),
    requestId = require(config.root + '/server/middlewares/request-id'),
    writeHeader = require(config.root + '/server/middlewares/write-header');

var middlewareloader = require(config.root + '/modules/environment-middleware-loader');

// create a write stream (in append mode)
var accessLog = (process.env.LOG_DIR || config.root) + '/access.log';
var accessLogStream = fs.createWriteStream(accessLog, {flags: 'a'});

var instance = require('instance');
var i18nOrg = instance(require('i18n'));
var i18nClone = require('i18n-2');

function BuildApp(siteObj) {
    var app = new express();

    this.getApp = function() {
        return app;
    };


    // Only for Site Specific App
    if (typeof siteObj !== 'undefined') {

        /*
         * Bolt 2.0 Redirect
         */
        // Check if we need to redirect to mweb - for legacy devices
        app.use(legacyDeviceRedirection());

        /*
         * Bolt 2.0 Security
         */
        app.use(guardians(app));

        /*
         * Setting up locals object for app
         */
        app.locals.config = {};
        app.locals.config.name = siteObj.name;
        app.locals.config.locale = siteObj.locale;
        app.locals.config.country = siteObj.country;
        app.locals.config.hostname = siteObj.hostname;
        app.locals.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w-]*';

        /*
         * Development based middlewares
         */
        middlewareloader()(['dev', 'mock', 'vm', 'vmdeploy'], function () {
            app.use(logger('dev'));

            // assets for local developments and populates  app.locals.jsAssets
            app.use(assets(app, typeof siteObj !== 'undefined' ? siteObj.locale : ''));
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
            app.use(logger('short'));

            if (app.locals.config) {
                app.locals.config.basePort = '';
            }
        });

        /*
         * Bolt 2.0 Express middlewares
         */
        app.use('/', compress());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(cookieParser());
        app.use(methodOverride());
        app.use(expressUncapitalize());
        app.use(logger('combined', {stream: accessLogStream}));

        /*
         * Bolt 2.0 Rendering middlewares
         */
	    //app.use(i18n.initMW(app, typeof siteObj !== 'undefined' ? siteObj.locale : ''));
        var i18n = require(config.root + '/modules/i18n');
        var i18n2 = instance(i18n);
        app.use(i18n2.initMW(app, siteObj.locale, instance(i18nOrg)));
        //i18nClone.expressBind(app, i18n.init(locale));
        i18n2 = '';

        app.use(boltExpressHbs.create(app));

        /*
         * Bolt 2.0 Authentication
         */
        app.use(checkAuthentication());

        /*
         * Bolt 2.0 Device Detection
         */
        app.use(deviceDetection.init());

        /*
         * Bolt 2.0 Mobile Only
         */
        app.use(checkMobileOnly());

        /*
         * Bolt 2.0 Custom middlewares to add to request
         */
        app.use(checkIp());
        app.use(checkMachineId());
        app.use(checkUserAgent());
        app.use(requestId());
        app.use(writeHeader('X-Powered-By', 'Bolt 2.0'));

        // Template hbs caching.
        if (process.env.NODE_ENV) {
            app.enable('view cache');
        }
    }
}

module.exports = BuildApp;
