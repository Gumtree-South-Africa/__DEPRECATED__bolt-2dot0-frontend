"use strict";

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to User BAPI
 * @constructor
 */
var UserService = function() {
};

/**
 * Gets User Info given a token from the cookie
 */
UserService.prototype.getUserFromCookie = function(bapiHeaderValues) {
	// console.info("Inside UserService");

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.userFromCookie')
	}), bapiHeaderValues, "user");
}

UserService.prototype.buildProfile = function(data) {
	if (data.username) {
		data.profileName = data.username;
	}

	if (data.socialMedia) {
		if (data.socialMedia.profileName && data.socialMedia.profileName.length > 0) {
			data.profileName = data.socialMedia.profileName;
		}
		if (data.socialMedia.type === 'FACEBOOK') {
			data.smallFbProfileImageUrl = 'https://graph.facebook.com/' + data.socialMedia.id + '/picture?width=36&height=36';
			data.publishPostUrl = 'https://graph.facebook.com/' + data.socialMedia.id + '/feed?access_token=' + data.socialMedia.accessToken;
		}
	}

	if (data.userProfileImageUrl) {
		data.profilePictureCropUrl = 'https://img.classistatic.com/crop/50x50/' + data.userProfileImageUrl.replace('http://www', '').replace('http://', '').replace('www', '');
	}
	return data;
};

module.exports = new UserService();
