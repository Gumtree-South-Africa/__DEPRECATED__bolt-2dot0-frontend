'use strict';

let adDetailsService = require(process.cwd() + '/server/services/adDetailsService');

class AdDetailsModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	getAdDetails() {
		let data = adDetailsService.getAdDetails();
		return data;
	}
}

module.exports = AdDetailsModel;
