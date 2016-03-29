'use strict';


var express = require('express'),
    _ = require('underscore'),
    util = require('util'),
    i18n = require('i18n');

var cwd = process.cwd();
var graphiteService = require(cwd + '/server/utils/graphite');


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
PageControllerUtil.prototype.postController = function (req, res, next, pageTemplateName, modelData) {

    process.nextTick(function() {
        // Render
        res.render(pageTemplateName + res.locals.config.locale, modelData, function(err, html) {
            if (err) {
                err.status = 500;
                return next(err);
            } else {
                res.send(html);
            }

            // Graphite Metrics for Page
            graphiteService.sendMetricsForPage(modelData.country, modelData.pagename, 'request.useragent', req.headers['user-agent']);
            graphiteService.sendMetricsForPage(modelData.country, modelData.pagename, 'response.statusCode', res.statusCode);

            // Kafka Logging
            // var log = res.locals.config.country + ' homepage visited with requestId = ' + req.requestId;
            // kafkaService.logInfo(res.locals.config.locale, log);

            // Redis Logging - to get data to ELK
        });
    });
    
};

module.exports = new PageControllerUtil();
