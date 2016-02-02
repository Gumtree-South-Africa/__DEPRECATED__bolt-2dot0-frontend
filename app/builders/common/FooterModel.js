"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");

var pageurlJson = require(process.cwd() + "/app/config/pageurl.json");

/** 
 * @description A class that Handles the Footer Model
 * @constructor
 */
var FooterModel = function (locale) {
	this.locale = locale;
    return new ModelBuilder(this.getFooterData());
};


// Function getFooterData
FooterModel.prototype.getFooterData = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var footerDeferred,
				data = {
				};
			
			// merge pageurl data
    		_.extend(data, pageurlJson.footer);
    		
    		if (typeof callback !== "function") {
				return;
			}
			
    		footerDeferred = Q.defer();
    		footerDeferred.resolve(data);
    		callback(null, data);
    		return footerDeferred.promise;
		}
	];
	
	return arrFunctions;
};

module.exports = FooterModel;

