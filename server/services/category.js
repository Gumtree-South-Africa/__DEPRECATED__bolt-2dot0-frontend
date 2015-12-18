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
CategoryService.prototype.getHomePageCategories = function() {
	console.log("Inside CategoryService");
	console.log(config.get('BAPI.server.host'));
	
	var data = {
			x : { "id" : "1204", name : "Videep 1" },
			y : { "id" : "1510", name : "Videep 2" },
			z : { "id" : "1846", name : "Videep 3" }
		};
	return data;
	
	/**
	 * Use async and http to make BAPI call
	 */
}

module.exports = new CategoryService();