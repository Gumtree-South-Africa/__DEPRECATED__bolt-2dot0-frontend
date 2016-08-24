'use strict';

let HomepagePO = require('./HomepagePO');
let homepagePO = new HomepagePO();

let protractor = require('protractor');
let specHelper = require('../../helpers/commonSpecHelper');

describe('Homepage Spec', () => {
	let mockData;

	beforeEach(() => {
		mockData = specHelper.getMockData("/test/serverUnit/mockData/api/v1/", "TrendingCard");

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
		it('should navigate to the ad page when clicking trending item', () => {
			homepagePO.trendingItemLink.click().then(() => {
				expect(browser.getCurrentUrl()).toContain(mockData.ads[0].viewSeoUrl, 'Navigated to the incorrect ad url');
			});
		});

		it('should filter w/ isotope so that only the first 16 elements display', () => {
			// there are 48 items
			expect(element.all(by.css('.trending-card .tile-item')).count()).toEqual(48);

			// 16 showing
			let i;
			for (i = 0; i < 16; i++) {
				expect(element.all(by.css('.trending-card .tile-item')).get(i).getAttribute('style')).not.toContain('display: none');
			}

			// 32 are hidden
			for (i = 16; i < 48; i++) {
				expect(element.all(by.css('.trending-card .tile-item')).get(i).getAttribute('style')).toContain('display: none');
			}
		});

		it('should show 32 tiles after clicking View More button', () => {
			// scroll down to 'View More' button
			browser.executeScript('window.scrollTo(0, 2000)')
				.then(
					homepagePO.viewMoreButton.click()
				)
				.then(() => {
					// 32 showing
					let i;
					for (i = 0; i < 32; i++) {
						expect(element.all(by.css('.trending-card .tile-item')).get(i).getAttribute('style')).not.toContain('display: none');
					}

					// 16 are hidden
					for (i = 32; i < 48; i++) {
						expect(element.all(by.css('.trending-card .tile-item')).get(i).getAttribute('style')).toContain('display: none');
					}
				});
		});

		it('should navigate to the search page after all 48 items have been shown', () => {
			// scroll to 'View More' each time new tiles are added, then click it
			browser.executeScript('window.scrollTo(0, 2000)')
				.then(
					homepagePO.viewMoreButton.click()
				)
				.then(browser.executeScript('window.scrollTo(0, 4600)'))
				.then(
					homepagePO.viewMoreButton.click()
				)
				.then(() => {
					// 48 showing
					for (let i = 0; i < 48; i++) {
						expect(element.all(by.css('.trending-card .tile-item')).get(i).getAttribute('style')).not.toContain('display: none');
					}
					browser.executeScript('window.scrollTo(0, 5000)');
				})
				.then(homepagePO.viewMoreButton.click())
				.then(() => {
					expect(browser.getCurrentUrl()).toContain('search.html', 'Final "View More" click should navigate to the search page');
				});
		});

		describe('lazy load', () => {
			beforeEach(() => {
				// set window size so that images dont lazy load immediately
				browser.driver.manage().window().setSize(375, 200);
			});

			it('should lazy load the trending item image when it scrolls into view', () => {
				expect(element.all(by.css('.trending-card img.lazy.ad-image')).count()).toEqual(mockData.ads.length, 'Only trending items specified in mocked data should display');

				// check trending item for src attr, lazy loaded images should not have loaded
				let mockAdImgs = [];
				let mockProfileImgs = [];
				for (let i = 0; i < 48; i++) {
					mockAdImgs.push(mockData.ads[i].seller.profileImage);
					mockProfileImgs.push(mockData.ads[i].pictures[0].url);
				}

				expect(homepagePO.trendingAdImgs.getAttribute('src')).not.toEqual(mockAdImgs, 'Tile is not in view and ad image should not be loaded yet');
				expect(homepagePO.trendingProfileImgs.getAttribute('src')).not.toEqual(mockProfileImgs, 'Tile is not in view and profile image should not be loaded yet');

				// resize window to show all trending items
				browser.driver.manage().window().setSize(375, 667);

				// check trending items for src attr, lazy load should be finished loading
				setTimeout(() => {
					expect(homepagePO.trendingAdImgs.getAttribute('src')).toEqual(mockAdImgs, 'Ad image should be lazy loaded by now');
					expect(homepagePO.trendingProfileImgs.getAttribute('src')).toEqual(mockProfileImgs, 'Profile image should be lazy loaded by now');
				}, 500);
			});
		});
	});
});
