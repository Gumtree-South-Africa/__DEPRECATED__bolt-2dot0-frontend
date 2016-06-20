'use strict';

class SafetyTipsModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}
	
	getSafetyTips() {
		let i18n = this.req.i18n;
		let data = {};

		let safetyTips = i18n.__('homepage.safetyTips.tip').slice();
		let i = Math.floor(Math.random() * safetyTips.length);
		let j = Math.floor(Math.random() * safetyTips.length - 1);
		//Splice to remove duplication
		data.one = safetyTips.splice(i, 1)[0];
		data.two = safetyTips.splice(j, 1)[0];
		return data;
	}
}

module.exports = SafetyTipsModel;
