'use strict';

let cwd = process.cwd();
let config = require('config');

let bapiOptionsModel = require(cwd + "/server/services/bapi/bapiOptionsModel");
let bapiService      = require(cwd + "/server/services/bapi/bapiService");


class AuthService {

	login(bapiHeaderValues, loginJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.authLogin')
		}), bapiHeaderValues, JSON.stringify(loginJson), 'authLogin');
	}

	register(bapiHeaderValues, registerJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.authRegister')
		}), bapiHeaderValues, JSON.stringify(registerJson), 'authRegister');
	}

}

module.exports = new AuthService();
