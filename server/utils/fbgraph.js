'use strict';

var Q = require('q');
var fbgraph = require('fbgraph');

/**
 * @description A FB Graph-API service class
 * @constructor
 */
var FbGraphService = function() {
};

/**
 * Gets User Info given a token from the cookie
 */
FbGraphService.prototype.publishPost = function(url, msgData, links) {
	var fbDeferred = Q.defer();

	var post = {};
	post.message = msgData;

	if (typeof links !== 'undefined') {
		url = url + '&links=' + links;
	}

	Q(fbgraph.post(url, post, function(err, data){
		if (err) {
			fbDeferred.reject(err);
		} else {
			fbDeferred.resolve(data);
		}
	}));

	return fbDeferred.promise;
}

module.exports = new FbGraphService();
