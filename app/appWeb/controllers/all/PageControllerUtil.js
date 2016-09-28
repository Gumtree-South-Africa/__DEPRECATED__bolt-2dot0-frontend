'use strict';


let express = require('express'), _ = require('underscore'), util = require('util');



/**
 * @description
 * @constructor
 */
let PageControllerUtil = function(req, res) {
};


/**
 * @method getInitialModelData
 * @description Prepares a base modelData that can be used in each page controller
 * @param {Object} request
 * @param {Object} response
 * @return {JSON}
 */
PageControllerUtil.prototype.preController = function(req, res) {


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
	// Render
	res.renderMin(pageTemplateName + res.locals.config.locale, modelData, function(err, html) {
		if (err) {
			err.status = 500;
			return next(err);
		} else {
			res.send(html);
		}

		// Kafka Logging
		// let log = res.locals.config.country + ' homepage visited with requestId = ' + req.app.locals.requestId;
		// kafkaService.logInfo(res.locals.config.locale, log);

		// Redis Logging - to get data to ELK
	});
};

module.exports = new PageControllerUtil();
