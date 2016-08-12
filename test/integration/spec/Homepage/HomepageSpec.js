'use strict';

let HomepagePO = require('./HomepagePO');
let homepagePO = new HomepagePO();

let protractor = require('protractor');
let specHelper = require('../../helpers/commonSpecHelper');

describe('Homepage Spec', () => {
	let mockData;

	beforeEach(() => {
		mockData = specHelper.getMockData("/test/serverUnit/mockData/api/v1/", "Ads");

		homepagePO.visitPage();
		// set cookies
		let jsScript = "document.cookie = 'b2dot0Version=2.0'; document.cookie = 'alreadyVisited=true';";
		protractor.promise.controlFlow().execute(() => {
			browser.executeScript(jsScript);
		});
	});

	it('should navigate to the blog page when clicking the blog link.', () => {
		homepagePO.blogLink.click().then(() => {
			expect(browser.getCurrentUrl()).toEqual('http://blog.vivanuncios.com.mx/');
		});
	});

	describe('Trending Card', () => {
		beforeEach(() => {
			// set window size so that images dont lazy load immediately
			browser.driver.manage().window().setSize(375, 200);
		});

		it('should navigate to the ad page when clicking trending item', () => {
			homepagePO.trendingItemLink.click().then(() => {
				expect(browser.getCurrentUrl()).toContain(mockData.ads[0].viewSeoUrl, 'Navigated to the incorrect ad url');
			});
		});

		it('should lazy load the trending item image when it scrolls into view', () => {
			expect(element.all(by.css('.trending-card img.lazy.ad-image')).count()).toEqual(1, 'Only trending items specified in Ad.json should display');

			// check trending item for src attr, lazy loaded images should not have loaded
			let mockAdImgs = [mockData.ads[0].pictures[0].url];
			let mockProfileImgs = [mockData.ads[0].seller.profileImage];
			expect(homepagePO.trendingAdImgs.getAttribute('src')).not.toEqual(mockAdImgs, 'Tile is not in view and ad image should not be loaded yet');
			expect(homepagePO.trendingProfileImgs.getAttribute('src')).not.toEqual(mockProfileImgs, 'Tile is not in view and profile image should not be loaded yet');

			// resize window to show all trending items
			browser.driver.manage().window().setSize(375, 667);

			// check trending items for src attr, lazy load should be finished loading
			setTimeout(() => {
				expect(homepagePO.trendingAdImgs.getAttribute('src')).toEqual(mockAdImgs, 'Ad image should be lazy loaded by now');
				expect(homepagePO.trendingProfileImgs.getAttribute('src')).toEqual(mockProfileImgs, 'Profile image should be lazy loaded by now');
			}, 1000);
		});
	});
});
