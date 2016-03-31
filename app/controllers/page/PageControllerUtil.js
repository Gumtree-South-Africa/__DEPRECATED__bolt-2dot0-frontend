'use strict';


var express = require('express'),
    _ = require('underscore'),
    util = require('util'),
    i18n = require('i18n');

var cwd = process.cwd();
var graphiteService = require(cwd + '/server/utils/graphite');
var minify = require('html-minifier').minify;


/** 
 * @description
 * @constructor
 */
var PageControllerUtil = function (req, res) {
};


/**
 * @method getInitialModelData
 * @description Prepares a base modelData that can be used in each page controller
 * @param {Object} request
 * @param {Object} response
 * @return {JSON}
 */
PageControllerUtil.prototype.preController = function (req, res) {
    var modelData =
    {
        env: 'public',
        locale: res.locals.config.locale,
        country: res.locals.config.country,
        site: res.locals.config.name,
        pagename: req.app.locals.pagetype,
        device: req.app.locals.deviceInfo
    };

	// Cached Location Data from BAPI
    modelData.location = res.locals.config.locationData;
    modelData.locationdropdown = res.locals.config.locationdropdown;
    
	// Cached Category Data from BAPI
    modelData.category = res.locals.config.categoryData;
    modelData.categorydropdown = res.locals.config.categorydropdown;
	
	return modelData;
};


/**
 * @method finalizeController
 * @description Invoked at the end of every page controller
 * @param {Object} request
 * @param {Object} response
 * @param {String} pageTemplateName
 * @param {JSON} modelData
 */
PageControllerUtil.prototype.finalizeController = function (req, res, next, pageTemplateName, modelData) {
	// Render
   /* res.render(pageTemplateName + res.locals.config.locale, modelData, function(err, html) {
		  if (err) {
			  err.status = 500;
			  return next(err);
		  } else {
			  res.send(html);
		  }
	  });*/

    res.locals.hbs.renderView( process.cwd() + '/app/views/templates/pages/homepage/views/hbs/homepage_' + res.locals.config.locale + '.hbs', modelData, function(err, html) {
        // console.log("xxxxx" + html);
        //res.writeHead(200, {'Content-Type': 'text/html'});

        var result = minify(html, {
            removeAttributeQuotes: true,
            removeEmptyElements: true,
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            minifyJS:true
        });
        res.end(result, 'utf8');

        // res.end();

    });

    // Kafka Logging
    // var log = res.locals.config.country + ' homepage visited with requestId = ' + req.requestId;
    // kafkaService.logInfo(res.locals.config.locale, log);

    // Redis Logging - to get data to ELK


    // Graphite Metrics
    console.info('Going to Graphite for HomePage with Test data for now');
    graphiteService.postForHPUsingTCP('local.random.hpmetric','999');
};

module.exports = new PageControllerUtil();
