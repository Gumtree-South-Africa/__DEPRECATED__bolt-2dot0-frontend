"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");

var userService = require(process.cwd() + "/server/services/user");
var pageurlJson = require(process.cwd() + "/app/config/pageurl.json");

/** 
 * @description A class that Handles the Header Model
 * @constructor
 */
var HeaderModel = function (cookie, locale) {
	this.cookie = cookie;
	this.locale = locale;
    return new ModelBuilder(this.getHeaderData());
};


// Function getHeaderData
HeaderModel.prototype.getHeaderData = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var headerDeferred,
				data = {};
			
			// merge pageurl data
    		data = _.extend(pageurlJson.header, data);
    		
			if (typeof callback !== "function") {
				return;
			}
			
		    if (typeof scope.cookie !== "undefined") {
		    	headerDeferred = Q.defer();
				console.log("Calling Service to get HeaderData");
			    
				 Q(userService.getUserFromCookie(scope.cookie, scope.locale))
			    	.then(function (dataReturned) {
			    		data = dataReturned;
			    		
			    		// merge pageurl data
			    		data = _.extend(pageurlJson.header, data);
			    					    		
			    		headerDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
						headerDeferred.reject(new Error(err));
					    callback(null, data);
					});

				return headerDeferred.promise;
			} else {
			    callback(null, data);
			}
		}
	];
	
	return arrFunctions;
};

module.exports = HeaderModel;

