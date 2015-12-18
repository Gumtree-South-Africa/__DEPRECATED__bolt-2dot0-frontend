"use strict";

var async = require("async");
var http = require("http");
var Q = require("q");

var config = require('config');

/** 
 * @description A service class that talks to Category BAPI
 * @constructor
 */
var CategoryService = function() {};

//Gets a list of categories for the homepage
CategoryService.prototype.getCategoriesData = function(depth) {
	console.log("Inside CategoryService");
	console.log(config.get('BAPI.server.host'));
	
	var data = {
			a : { "id" : "1204", name : "cat 1" },
			b : { "id" : "1510", name : "cat 2" },
			c : { "id" : "1846", name : "cat 3" }
		};
	return data;
	
	/**
	 * Use async and http to make BAPI call
	 */
}

module.exports = new CategoryService();