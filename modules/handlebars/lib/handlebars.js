/**
 * @module hbs-helpers
 * @description Handlebar template inhertiance and helpers
 * @author aganeshalingam@ebay.com
 */

'use strict';


module.exports.create =  function(app) {

    return function(req, res, next) {

        var util = require('util'),
            exphbs  = require('express-handlebars'),
            hbshelpers = require(process.cwd() + '/modules/hbs-helpers');

        var hbs = exphbs.create({
            defaultLayout: 'main',
            layoutsDir: process.cwd() + "/app/views/templates/layouts/hbs/",
            extname: "hbs",
            helpers: hbshelpers,
            precompiled: [ process.cwd() + "/app/views/components/", process.cwd() + '/app/views/templates/pages'],
            partialsDir: [ process.cwd() + "/app/views/components/", process.cwd() + '/app/views/templates/pages']

        });

        hbshelpers.init({hbs:hbs, app:app, req:req});

        app.engine('hbs', hbs.engine);
        app.set('view engine', 'hbs');
        app.set('views', process.cwd() + '/app/views/templates/pages');

        // call next middleware
        next();
    };
};







