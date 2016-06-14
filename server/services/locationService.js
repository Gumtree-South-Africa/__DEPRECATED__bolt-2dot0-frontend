"use strict";

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Location BAPI
 * @constructor
 */
var LocationService = function() {
};

/**
 * Gets a list of locations
 */
LocationService.prototype.getLocationsData = function(bapiHeaderValues, depth) {

	return bapiService.bapiPromiseGet(
        bapiOptionsModel.initFromConfig(config, {
            method: 'GET',
            path: config.get('BAPI.endpoints.locationHomePage') + "?depth=" + depth }),
        bapiHeaderValues,
        "location");
};

/**
 * Gets a list of top L2 locations
 */
LocationService.prototype.getTopL2LocationsData = function(bapiHeaderValues) {

	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
            method: 'GET',
            path: config.get('BAPI.endpoints.topLocationsL2')
        }),
        bapiHeaderValues,
        "topL2Locations");
};

module.exports = new LocationService();
