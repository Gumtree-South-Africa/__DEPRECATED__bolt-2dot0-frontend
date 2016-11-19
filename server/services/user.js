'use strict';

let config = require('config');
let bapiOptionsModel = require('./bapi/bapiOptionsModel');
let bapiService      = require('./bapi/bapiService');

/**
 * @description A service class that talks to User BAPI
 * @constructor
 */
class UserService {

	/**
	 * Gets User Info given a token from the cookie
	 */
	getUserFromCookie(bapiHeaderValues) {
		let queryEndpoint = config.get('BAPI.endpoints.userFromCookie');
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'userService$getUserFromCookie');
	};
}

module.exports = new UserService();
