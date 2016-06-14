'use strict';


var express = require('express'), _ = require('underscore'), util = require('util');


/**
 * @description
 * @constructor
 */
var PageControllerUtil = function(req, res) {
};


/**
 * @method getInitialModelData
 * @description Prepares a base modelData that can be used in each page controller
 * @param {Object} request
 * @param {Object} response
 * @return {JSON}
 */
PageControllerUtil.prototype.preController = function(req, res) {
	var modelData = {
		env: 'public',
		locale: res.locals.config.locale,
		country: res.locals.config.country,
		site: res.locals.config.name,
		pagename: req.app.locals.pagetype,
		device: req.app.locals.deviceInfo,
		ip: req.app.locals.ip,
		machineid: req.app.locals.machineid,
		useragent: req.app.locals.useragent
	};

	// Cached Location Data from BAPI
	modelData.location = res.locals.config.locationData;
	modelData.locationdropdown = res.locals.config.locationdropdown;
	modelData.locationIdNameMap = res.locals.config.locationIdNameMap;

	// Cached Category Data from BAPI
	modelData.category = res.locals.config.categoryData;
	modelData.categorydropdown = res.locals.config.categorydropdown;

	modelData.categoryIdNameMap = res.locals.config.categoryIdNameMap;
	modelData.categoryData = res.locals.config.categoryflattened;

	// Bapi Header Data
	modelData.bapiHeaders = {};
	modelData.bapiHeaders.requestId = req.app.locals.requestId;
	modelData.bapiHeaders.ip = req.app.locals.ip;
	modelData.bapiHeaders.machineid = req.app.locals.machineid;
	modelData.bapiHeaders.useragent = req.app.locals.useragent;
	modelData.bapiHeaders.locale = res.locals.config.locale;
	modelData.bapiHeaders.authTokenValue = req.cookies.bt_auth;

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
PageControllerUtil.prototype.postController = function(req, res, next, pageTemplateName, modelData) {

	process.nextTick(function() {
		// Render
		res.render(pageTemplateName + res.locals.config.locale, modelData, function(err, html) {
			if (err) {
				err.status = 500;
				return next(err);
			} else {
				res.send(html);
			}

			// Kafka Logging
			// var log = res.locals.config.country + ' homepage visited with requestId = ' + req.app.locals.requestId;
			// kafkaService.logInfo(res.locals.config.locale, log);

			// Redis Logging - to get data to ELK
		});
	});

};

module.exports = new PageControllerUtil();
