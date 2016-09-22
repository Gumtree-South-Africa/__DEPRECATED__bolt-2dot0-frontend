'use strict';

let cwd = process.cwd();
let authService = require(cwd + '/server/services/authService');


class AuthModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	login(loginRequest) {
		return authService.login(this.bapiHeaders, loginRequest).then( (results) => {
			return results;
		});
	}

	register(registerRequest) {
		return authService.register(this.bapiHeaders, registerRequest).then( (results) => {
			return results;
		});
	}
}

module.exports = AuthModel;
