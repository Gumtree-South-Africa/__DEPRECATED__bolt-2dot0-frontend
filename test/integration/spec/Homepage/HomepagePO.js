'use strict';

let specHelper = require('../../helpers/commonSpecHelper');
const homepageUrl = specHelper.getBaseUrl() + '';

class HomepagePO {
	constructor() {
		this.blogLink = element(by.css('.blog a'));
		this.trendingItemLink = element.all(by.css('.card-trendingCard .tile-link')).first();
		this.trendingTiles = element.all(by.css('.card-trendingCard .tile-item'));
		this.trendingAdImgs = element.all(by.css('.card-trendingCard img.lazy.ad-image'));
		this.trendingProfileImgs = element.all(by.css('.card-trendingCard img.lazy.profile-image'));
		this.viewMoreButton = element(by.css('.card-view-more .link'));
	}

	scrollTo(positionPx) {
		return browser.executeScript(`window.scrollTo(0, ${positionPx})`);
	}
	getTileAdImages() {
		return this.trendingAdImgs.getAttribute('src');
	}

	getTileAdImage(index) {
		return this.trendingAdImgs.get(index).getAttribute('src');
	}

	getTileProfileImages() {
		return this.trendingProfileImgs.getAttribute('src');
	}

	getTileProfileImage(index) {
		return this.trendingProfileImgs.get(index).getAttribute('src');
	}

	getTileStyle(index) {
		return this.trendingTiles.get(index).getAttribute('style');
	}

	getUrl() {
		return homepageUrl;
	}

	getDomain() {
		let parts = homepageUrl.split(/\/\/|:/);	// split on // or :
		// ex:
		// 0 = "http"
		// 1 = ""
		// 2 = "www.vivanuncios.com.mx.localhost"
		// 3 = "8000/"
		return parts[2];
	}

	visitPage() {
		browser.get(homepageUrl);
	}
}

module.exports = HomepagePO;
