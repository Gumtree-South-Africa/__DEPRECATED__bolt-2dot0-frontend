'use strict';

var express = require('express'),
    router = express.Router(),

    kafkaService = require(process.cwd() + '/server/utils/kafka');

module.exports = function (app) {
   // app.get(''/deviceDetection, router);

    app.get('/deviceDetection', function (req, res) {
        //var articles = [new Article(), new Article()];
        res.render('deviceDetection', {
            title: 'Device Dectection Page',
            locale: res.config.locale
        });
    });
};


