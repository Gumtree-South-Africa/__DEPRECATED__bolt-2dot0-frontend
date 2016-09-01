'use strict';

let userService = require(process.cwd() + '/server/services/user');


class UserModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	getUserFromCookie() {
		return userService.getUserFromCookie(this.bapiHeaderValues);
	}
}

module.exports = UserModel;
