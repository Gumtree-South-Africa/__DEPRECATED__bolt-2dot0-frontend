'use strict';

let cwd = process.cwd();
let config = require('config');

let Q = require('q');

let bapiOptionsModel = require(cwd + "/server/services/bapi/bapiOptionsModel");
let bapiService      = require(cwd + "/server/services/bapi/bapiService");


class AuthService {

	/**
	 * Mock Services till BAPI is built out
	 */
	// mockLogin() {
	// 	return Q(require(process.cwd() + '/server/services/mockData/UserLoginResponse.json'));
	// }
	//
	// mockActivate() {
	// 	return Q(require(process.cwd() + '/server/services/mockData/UserLoginResponse.json'));
	// }
	//
	// mockRegister() {
	// 	return Q(require(process.cwd() + '/server/services/mockData/UserRegistrationResponse.json'));
	// }

	mockCheck() {
		return Q({});
	}

	/**
	 * Real BAPI invocation
	 */
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

	activate(bapiHeaderValues, activateJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.authActivate').replace('{email}', activateJson.emailAddress) + '?activationCode=' + activateJson.activationCode
		}), bapiHeaderValues, {}, 'authActivate');
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
