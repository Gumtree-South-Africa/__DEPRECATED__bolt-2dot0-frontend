"use strict";

var http = require("http");

var ModelBuilder = require("../../common/ModelBuilder");

/** 
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var CarouselGalleryModel = function () {
    return new ModelBuilder(CarouselGalleryModel.getCalls());
};

CarouselGalleryModel.getCalls = function () {
	var arrFunctions = [
		function firstSet(callback) {
			var data = {};
			if (typeof callback !== "function") {
				return;
			}

    		data = {
    			a : "ad-12000",
    			b : "ad-12001",
    			c : "ad-12002",
    			d : "ad-12003",
    			e : "ad-12004",
    			f : "ad-12005",
    			g : "ad-12006",
    			h : "ad-12007",
    			i : "ad-12008"
    		};
    		callback(null, data);
		},  

		function secondSet(callback) {
			var data = {};
			if (typeof callback !== "function") {
				return;
			}

    		data = {
    			a : "ad-14000",
    			b : "ad-14001",
    			c : "ad-14002",
    			d : "ad-14003",
    			e : "ad-14004",
    			f : "ad-14005",
    			g : "ad-14006",
    			h : "ad-14007",
    			i : "ad-14008"
    		};
    		callback(null, data);
		} 
	];

	return arrFunctions;
};

module.exports = CarouselGalleryModel;

