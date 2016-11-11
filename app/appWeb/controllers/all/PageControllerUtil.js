'use strict';


let express = require('express'), _ = require('underscore'), util = require('util');



/**
 * @description
 * @constructor
 */
let PageControllerUtil = function(req, res) {
};


/**
 * @method preController
 * @description Prepares a base modelData that can be used in each page controller
 * @param {Object} request
 * @param {Object} response
 * @return {JSON}
 */
PageControllerUtil.prototype.preController = function(req, res) {
	return modelData;
};


/**
 * @method is2dot0Version
 * @description Checks if it is 2dot0 Version based on b2dot0Version
 * @param {Object} response
 * @return {JSON}
 */
PageControllerUtil.prototype.is2dot0Version = function(res) {
	let is2dot0 = false;
	if (res.locals.b2dot0Version) {
		is2dot0 = true;
	}

	return is2dot0;
};

/**
 * @method is2dot0Page
 * @description Checks if it is 2dot0 page based on b2dot0Pages
 * @param {Object} response
 * @return {JSON}
 */
PageControllerUtil.prototype.is2dot0Page = function(res, abtestpage) {
	let is2dot0 = false;
	if (res.locals.b2dot0Pages) {
		let pages = res.locals.b2dot0Pages;
		for (let i=0; i<pages.length; i++) {
			if (pages[i] === abtestpage) {
				res.locals.b2dot0PageVersion = true;
				is2dot0 = true;
				break;
			}
		}
	}

	return is2dot0;
};



/**
 * @method postController
 * @description Invoked at the end of every page controller
 * @param {Object} request
 * @param {Object} response
 * @param {String} pageTemplateName
 * @param {JSON} modelData
 */
PageControllerUtil.prototype.postController = function(req, res, next, pageTemplateName, modelData) {
	// Render
	res.render(pageTemplateName + res.locals.config.locale, modelData, function(err, html) {
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
