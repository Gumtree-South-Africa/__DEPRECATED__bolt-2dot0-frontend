'use strict';

class adDetailsService {
	getAdDetails() {
		return require(process.cwd() + '/server/services/mockData/adDetailsMock');
	}
}

module.exports = new adDetailsService();
