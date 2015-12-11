'use strict';

var express = require("express");
var exphbs = require('express-handlebars');

var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var path = require('path');

// var hbshelp = require("../../modules/bolt-handlebars-helpers");

function BuildApp() {
    var app = express();

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(compress());
    app.use(methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));

    // view engine setup
    app.set('views', path.join(__dirname, '../../app/views'));
    app.engine('.hbs', exphbs({defaultLayout: '../../app/views/templates/layouts/hbs/main', extname: '.hbs'}));
    app.set('view engine', '.hbs');

    // Add BOLT 2.0 Handlebars helpers for view engine
    // hbshelp(app);

    // Set Routes
    require('../../app/routes')(app);

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

module.exports = BuildApp;
