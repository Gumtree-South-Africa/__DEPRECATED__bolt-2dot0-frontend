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
// legacy device redirection
var legacyDeviceRedirection = require(process.cwd() + '/modules/legacy-mobile-redirection');


var config = {
    root: process.cwd()
};


function BuildApp(locale) {
    var app = express();

    // uncomment after placing your favicon in /public
    // app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(compress());
    app.use(methodOverride());
    app.use('/', express.static(config.root + '/public'));
    app.use("/views", express.static(config.root + '/app/views'));

    app.use(legacyDeviceRedirection());
    app.use(expressUncapitalize());

    // Use custom middlewares
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
