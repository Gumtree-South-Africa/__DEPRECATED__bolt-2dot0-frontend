'use strict';

var http = require('http');
var Q = require('q');

var ModelBuilder = require('./ModelBuilder');

var hpAdService = require(process.cwd() + '/server/services/homepage-ads');


/** 
 * @description A class that Handles the Ad Statistics Model
 * @constructor
 */
var AdStatisticsModel = function (bapiHeaders) {
	this.bapiHeaders = bapiHeaders;
};

AdStatisticsModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getHomePageStatistics());
};

// Function getHomePageStatistics
AdStatisticsModel.prototype.getHomePageStatistics = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var adstatisticsDeferred,
				data = {};
			if (typeof callback !== 'function') {
				return;
			}
			
		    if (typeof scope.bapiHeaders.locale !== 'undefined') {
		    	adstatisticsDeferred = Q.defer();
			    
				 Q(hpAdService.getAdStatistics(scope.bapiHeaders))
			    	.then(function (dataReturned) {
			    		data = dataReturned;
			    		adstatisticsDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
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

