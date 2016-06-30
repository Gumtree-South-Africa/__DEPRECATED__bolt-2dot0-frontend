'use strict';

let ModelBuilder = require('./ModelBuilder');

let hpAdService = require(process.cwd() + '/server/services/homepage-ads');


/**
 * @description A class that Handles the Ad Statistics Model
 * @constructor
 */
class AdStatisticsModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}
	getModelBuilder() {
		return new ModelBuilder(this.getHomePageStatistics());
	}

// Function getHomePageStatistics
	getHomePageStatistics() {
		return [
			() => {
				if (typeof this.bapiHeaders.locale !== 'undefined') {
					return hpAdService.getAdStatistics(this.bapiHeaders);
				} else {
					return {};
				}
			}
		];
	}
}

module.exports = AdStatisticsModel;

