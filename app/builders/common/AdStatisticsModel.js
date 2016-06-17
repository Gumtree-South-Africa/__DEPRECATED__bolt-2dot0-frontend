'use strict';

let Q = require('q');

let ModelBuilder = require('./ModelBuilder');

let hpAdService = require(process.cwd() + '/server/services/homepage-ads');


/**
 * @description A class that Handles the Ad Statistics Model
 * @constructor
 */
let AdStatisticsModel = function(bapiHeaders) {
	this.bapiHeaders = bapiHeaders;
};

AdStatisticsModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getHomePageStatistics());
};

// Function getHomePageStatistics
AdStatisticsModel.prototype.getHomePageStatistics = function() {
	let _this = this;
	let arrFunctions = [
		function(callback) {
			let adstatisticsDeferred, data = {};
			if (typeof callback !== 'function') {
				return;
			}

			if (typeof _this.bapiHeaders.locale !== 'undefined') {
				adstatisticsDeferred = Q.defer();

				Q(hpAdService.getAdStatistics(_this.bapiHeaders))
					.then(function(dataReturned) {
						data = dataReturned;
						adstatisticsDeferred.resolve(data);
						callback(null, data);
					}).fail(function(err) {
					adstatisticsDeferred.reject(new Error(err));
					callback(null, data);
				});

				return adstatisticsDeferred.promise;
			} else {
				callback(null, data);
			}
		}
	];

	return arrFunctions;
};

module.exports = AdStatisticsModel;

