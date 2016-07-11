'use strict';

class FooterV2Model {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	isDistractionFree() {
		let data = {};
		let bapiConfigData = this.res.locals.config.bapiConfigData;
		let distractionFree = bapiConfigData.content.homepageV2.distractionFree; //boolean

		data.distractionFree = distractionFree || false;

		return data;
	}
}

module.exports = FooterV2Model;
