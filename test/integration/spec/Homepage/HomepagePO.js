'use strict';

let specHelper = require('../../helpers/commonSpecHelper');
const homepageUrl = specHelper.getBaseUrl() + '';

class HomepagePO {
	constructor() {
		this.blogLink = element(by.css('.blog a'));
		this.trendingItemLink = element(by.css('.trending-card'));
		this.trendingAdImgs = element.all(by.css('.trending-card img.lazy.ad-image'));
		this.trendingProfileImgs = element.all(by.css('.trending-card img.lazy.profile-image'));
	}

	getUrl() {
		return homepageUrl;
	}

	visitPage() {
		browser.get(homepageUrl);
	}
}

module.exports = HomepagePO;
