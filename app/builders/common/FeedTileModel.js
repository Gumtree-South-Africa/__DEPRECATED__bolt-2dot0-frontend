'use strict';

class FeedTileModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	getFeedTiles() {
		let data = require(process.cwd() + '/test/serverUnit/mockData/components/feedTileMock');

		data.one = data.feedTiles[Math.floor(Math.random()*data.feedTiles.length)];
		data.two = data.feedTiles[Math.floor(Math.random()*data.feedTiles.length)];
		data.three = data.feedTiles[Math.floor(Math.random()*data.feedTiles.length)];

		return data;
	}
}

module.exports = FeedTileModel;


// TODO: Refactor with service for BAPI integration
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
