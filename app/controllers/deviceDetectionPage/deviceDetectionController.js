'use strict';

var express = require('express'),
    router = express.Router(),

    kafkaService = require(process.cwd() + '/server/utils/kafka');

module.exports = function (app) {


    app.get('/deviceDetection', function (req, res) {

        res.render('deviceDetection/views/hbs/deviceDetection', {
            title: 'Device Dectection Page',
            locale: res.config.locale
        });

       // res.render('deviceDetection/views/hbs/deviceDetection' , { });
    });
};


