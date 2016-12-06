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
PageControllerUtil.prototype.is2dot0Version = function(res, abtestpage) {
	let is2dot0 = false;
	let is2dot0Page = this.is2dot0Page(res, abtestpage);
	let is1dot0Page = this.is1dot0Page(res, abtestpage);
	if (is2dot0Page && !is1dot0Page) {
		is2dot0 = true;
	} else if (is1dot0Page && !is2dot0Page) {
		is2dot0 = false;
	} else if (res.locals.b2dot0Version) {
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
 * @method is1dot0Page
 * @description Checks if it is 1dot0 page based on b2dot0Pages
 * @param {Object} response
 * @return {JSON}
 */
PageControllerUtil.prototype.is1dot0Page = function(res, abtestpage) {
	let is1dot0 = false;
	if (res.locals.b1dot0Pages) {
		let pages = res.locals.b1dot0Pages;
		for (let i=0; i<pages.length; i++) {
			if (pages[i] === abtestpage) {
				res.locals.b2dot0PageVersion = false;
				is1dot0 = true;
				break;
			}
		}
	}

	return is1dot0;
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
