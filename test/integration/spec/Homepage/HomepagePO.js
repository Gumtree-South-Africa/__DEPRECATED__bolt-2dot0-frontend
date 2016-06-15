'use strict';

let specHelper = require('../../helpers/commonSpecHelper');
const homepageUrl = specHelper.getBaseUrl() + '';

class HomepagePO {
	constructor() {
		this.subTitle = element(by.className('subTitle'));
		this.blogLink = element(by.css('.blog a'))
	}

	getUrl() {
		return homepageUrl;
	}

	visitPage() {
		browser.get(homepageUrl);
	}
};

module.exports = HomepagePO;
