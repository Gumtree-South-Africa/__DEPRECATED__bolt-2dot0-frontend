'use strict';

let cwd = process.cwd();
let authService = require(cwd + '/server/services/authService');


class AuthModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	loginViaBolt(loginRequest) {
		return authService.mockLogin(this.bapiHeaders, loginRequest).then( (results) => {
			return results;
		});
	}

	loginViaFb(loginRequest) {
		return authService.mockLogin(this.bapiHeaders, loginRequest).then( (results) => {
			return results;
		});
	}

	register(registerRequest) {
		return authService.mockRegister(this.bapiHeaders, registerRequest).then( (results) => {
			return results;
		});
	}

	activate(email, activateRequest) {
		return authService.mockActivate(this.bapiHeaders, email, activateRequest).then( (results) => {
			return results;
		});
	}

	checkEmailExists(email) {
		return authService.mockCheck(this.bapiHeaders, email).then( (results) => {
			return results;
		});
	}

	checkPhoneExists(phone) {
		return authService.mockCheck(this.bapiHeaders, phone).then( (results) => {
			return results;
		});
	}
}

module.exports = AuthModel;
