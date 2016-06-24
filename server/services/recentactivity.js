'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptions')(config);

/**
 * @description A service class that talks to recentAds BAPI
 * @constructor
 */
var RecentActivityService = function() {
	this.bapiOptions = bapiOptions;
};

/**
 * Gets a list of recentActivities
 */
RecentActivityService.prototype.getRecentActivities = function(bapiHeaders, depth) {
	// console.info('Inside CategoryService');

	// Prepare BAPI call
	// this.bapiOptions.method = 'GET';
	// this.bapiOptions.path = config.get('BAPI.endpoints.categoryHomePage') + '?depth=' + depth;

	// Invoke BAPI
	// return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'feedtile');
	return require(process.cwd() + 'test/serverUnit/mockData/components/recentActivityMock');
};
module.exports = new RecentActivityService();
