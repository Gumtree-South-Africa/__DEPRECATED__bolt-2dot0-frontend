'use strict';

class RecentActivityModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	getRecentActivities() {
		let data = require(process.cwd() + '/test/serverUnit/mockData/components/recentActivityMock');

		data.one = data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)];
		data.two = data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)];
		data.three = data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)];

		return data;
	}
}

module.exports = RecentActivityModel;


// TODO: Refactor with Service for BAPI integration
// 'use strict';
//
// let Q = require('q');
//
// let feedTileService = require(process.cwd() + '/server/services/feedtile');
//
//
// /**
//  * @description A class that Handles the Category Model
//  * @constructor
//  */
// let FeedTileModel = function(bapiHeaders, depth, locationId) {
// 	this.bapiHeaders = bapiHeaders;
// 	this.depth = depth;
// 	this.locationId = locationId;
// };
//
// //Function getCategories
// FeedTileModel.prototype.getFeedTile = function() {
// 	let _this = this;
// 	let feedDeferred = Q.defer();
// 	let data = {};
//
// 	if (typeof _this.bapiHeaders.locale !== 'undefined') {
// 		Q(feedTileService.getCategoriesData(_this.bapiHeaders, _this.depth))
// 			.then(function(dataReturned) {
// 				data = dataReturned;
// 				feedDeferred.resolve(data);
// 			}).fail(function(err) {
// 			feedDeferred.reject(new Error(err));
// 		});
// 	}
//
// 	return feedDeferred.promise;
// };
//
// module.exports = FeedTileModel;
