'use strict';

var boltConfig  = require("./BoltConfig");
var express = require("express");
var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var expressUncapitalize = require('express-uncapitalize');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var path = require('path');

var hbshelpers = require("../../app/hbshelpers");
var writeHeader = require("./write-header");


var deviceDetection = require("./DeviceDetection");

var exphbs  = require('express-handlebars');

var config = {
    root: process.cwd()
};


var hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: config.root + "/app/views/templates/layouts/hbs/",
    extname: "hbs",
    helpers: hbshelpers,
    precompiled: [ config.root + "/app/views/components/", config.root + '/app/views/templates/pages'],
    partialsDir: [ config.root + "/app/views/components/", config.root + '/app/views/templates/pages']

});

hbshelpers.init(hbs) ;

function BuildApp(locale) {
    var app = express();
    var exphbs = null;


    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(boltConfig());

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(compress());
    app.use(methodOverride());
    app.use('/', express.static(config.root + '/public'));
    // app.use("/app/views", express.static(config.root + '/app/views'));

    // @TODO: Remove these 2 lines when minification/aggregation is in place.
   // app.use('/views/components/', express.static(config.root + '/app/views/components/'));
   // app.use('/views/templates/', express.static(config.root + '/app/views/templates/'));
    app.use(expressUncapitalize());

    // Use custom middlewares
    app.use(writeHeader('X-Powered-By', 'Bolt'));
    app.use(deviceDetection());




    this.locale = locale;

    //Setup Views
    if (locale) {
        //exphbs = require('express-handlebars');

        app.engine('hbs', hbs.engine);
        app.set('view engine', 'hbs');
        app.set('views', config.root + '/app/views/templates/pages');
        //app.set('views', config.root + '/app/views/components/');
       // app.set('views', config.root + '/app/views/partials/');



        // Add BOLT 2.0 Handlebars helpers for view engine
        // hbshelp(app, locale, exphbs);
        //hbshelp(app, locale, exphbs);
    }

    /*
     * TODO: Enable when NodeJS error handling available: 404, 500, etc
     */
    // catch 404 and forward to error handler
    // app.use(function(req, res, next) {
    //   var err = new Error('Not Found');
    //   err.status = 404;
    //   next(err);
    // });

    // error handlers

    // development error handler
    // will print stacktrace
    // if (app.get('env') === 'development') {
    //   app.use(function(err, req, res, next) {
    //     res.status(err.status || 500);
    //     res.render('error', {
    //       message: err.message,
    //       error: err
    //     });
    //   });
    // }

    // production error handler
    // no stacktraces leaked to user
    // app.use(function(err, req, res, next) {
    //   res.status(err.status || 500);
    //   res.render('error', {
    //     message: err.message,
    //     error: {}
    //   });
    // });

    this.getApp = function() {
        return app;
    };
}

BuildApp.prototype.setI18nObj = function (i18nObj) {
    this.i18nObj = i18nObj;

    var app = this.getApp();

    //Setup Views
    if (this.locale) {
        exphbs = require('express-handlebars');
        app.set('views', config.root + '/app/views/templates/pages/');
        app.set('view engine', 'hbs');

        // Add BOLT 2.0 Handlebars helpers for view engine
        // hbshelp(app, locale, exphbs);
        hbshelp(app, this.locale, exphbs, this.i18nObj);
    }


};

module.exports = BuildApp;
;
