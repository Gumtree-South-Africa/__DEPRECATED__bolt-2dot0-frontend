'use strict';


var express = require("express");
var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var expressUncapitalize = require('express-uncapitalize');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var path = require('path');

var writeHeader = require("./write-header");
var requestId = require('./request-id');
var i18n = require(process.cwd() + '/modules/i18n');
var deviceDetection = require(process.cwd() + '/modules/device-detection');
var boltExpressHbs = require(process.cwd() + '/modules/handlebars');
var legacyDeviceRedirection = require(process.cwd() + '/modules/legacy-mobile-redirection');
var assets = require(process.cwd() + '/modules/assets');
var ignoreAssetReq = require(process.cwd() + '/modules/ignore-assets');

var midlewareloader = require(process.cwd() + '/modules/environment-middleware-loader');


var config = {
    root: process.cwd()
};


function BuildApp(locale) {
    var app = express();

    // Check if we need to redirect to mweb - for legacy devices
    app.use(legacyDeviceRedirection());

    // uncomment after placing your favicon in /public
    // app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));

    // Development based middleware stuff here
    midlewareloader()(['dev', 'mock', 'vm', 'vmdeploy'], function() {
        // assets for local developments and populates  app.locals.jsAssets
        app.use(assets(app, locale));
        app.use(logger('dev'));
        // for dev purpose lets make all static none cacheable
        // http://evanhahn.com/express-dot-static-deep-dive/
        app.use("/public", express.static(config.root + '/public', {
            root: "/public",
            etag:false,
            maxage:0,
            index:false
        }));
        app.use("/views", express.static(config.root + '/app/views',{
            root: "/views",
            etag:false,
            maxage:0,
            index:false
        }));

    });

    // Production based middleware
    midlewareloader()(['production', 'pp', 'lnp'], function() {
        // https://www.npmjs.com/package/morgan#common
        // apche style loggin
        app.use(logger('common'));

    });

    app.use(compress());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(methodOverride());
    app.use(expressUncapitalize());

    // Bolt Custom middlewares
    app.use(writeHeader('X-Powered-By', 'Bolt 2.0'));
    app.use(requestId());    
    app.use(i18n.initMW(app, locale));
    app.use(boltExpressHbs.create(app));
    app.use(deviceDetection.init());
    
    this.getApp = function() {
        return app;
    };
}

module.exports = BuildApp;
