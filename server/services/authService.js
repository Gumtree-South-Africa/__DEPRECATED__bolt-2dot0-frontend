'use strict';

let cwd = process.cwd();
let config = require('config');

let bapiOptionsModel = require(cwd + "/server/services/bapi/bapiOptionsModel");
let bapiService      = require(cwd + "/server/services/bapi/bapiService");


class AuthService {

	loginBolt(bapiHeaderValues, loginJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.authBoltLogin')
		}), bapiHeaderValues, JSON.stringify(loginJson), 'authBoltLogin');
	}

	loginFb(bapiHeaderValues, loginJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.authFbLogin')
		}), bapiHeaderValues, JSON.stringify(loginJson), 'authFbLogin');
	}

	register(bapiHeaderValues, registerJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.authRegister')
		}), bapiHeaderValues, JSON.stringify(registerJson), 'authRegister');
	}

	activate(bapiHeaderValues, email, activateJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.authActivate').replace('{email}', email)
		}), bapiHeaderValues, JSON.stringify(activateJson), 'authActivate');
	}

	checkEmailExists(bapiHeaderValues, email) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'HEAD',
			path: config.get('BAPI.endpoints.authEmailExists').replace('{email}', email)
		}), bapiHeaderValues, 'authEmailExists');
	}

	checkPhoneExists(bapiHeaderValues, phone) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'HEAD',
			path: config.get('BAPI.endpoints.authPhoneExists').replace('{phone}', phone)
		}), bapiHeaderValues, 'authPhoneExists');
	}
}

module.exports = new AuthService();
