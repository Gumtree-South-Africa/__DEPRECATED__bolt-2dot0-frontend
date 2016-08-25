'use strict';

let HomepagePO = require('./HomepagePO');
let homepagePO = new HomepagePO();

let mockData = require("../../../serverUnit/mockData/api/v1/TrendingCard.json");

describe('Homepage Spec', () => {

	beforeAll(() => {
		homepagePO.visitPage();	// 'prime' the page visit (this will not have a cookie, so will render the 1.0 home page)

		// since we're adding a cookie after the page is visited (this is apparently the way protractor wants us to do it)
		// we need to then visit the page again (in beforeEach) to have the cookie go to the server

		// set cookies
		browser.manage().addCookie('alreadyVisited', 'true', '/', homepagePO.getDomain());
		browser.manage().addCookie('b2dot0Version', '2.0', '/', homepagePO.getDomain());
	});

	beforeEach(() => {
		homepagePO.visitPage();
	});

	it('should visit with the 2.0 cookie value', () => {
		browser.manage().getCookie('b2dot0Version').then(function(cookie) {
			expect(cookie.value).toEqual('2.0');
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
			expect(homepagePO.trendingTiles.count()).toEqual(48);

			// 16 showing
			let i;
			for (i = 0; i < 16; i++) {
				expect(homepagePO.getTileStyle(i)).not.toContain('display: none');
			}

			// 32 are hidden
			for (i = 16; i < 48; i++) {
				expect(homepagePO.getTileStyle(i)).toContain('display: none');
			}

			// thought this might speed up the test instead of the above looping, but it doesnt seem to
			// expect(homepagePO.getTileStyle(15)).not.toContain('display: none');
			// expect(homepagePO.getTileStyle(16)).toContain('display: none');
		});

		it('should show 32 tiles after clicking View More button', () => {
			// scroll down to 'View More' button
			homepagePO.scrollTo(2000)
				.then(homepagePO.viewMoreButton.click)
				.then(() => {
					// 32 showing
					let i;
					for (i = 0; i < 32; i++) {
						expect(homepagePO.getTileStyle(i)).not.toContain('display: none');
					}

					// 16 are hidden
					for (i = 32; i < 48; i++) {
						expect(homepagePO.getTileStyle(i)).toContain('display: none');
					}

					// thought this might speed up the test instead of the above looping, but it doesnt seem to
					// expect(homepagePO.getTileStyle(31)).not.toContain('display: none');
					// expect(homepagePO.getTileStyle(32)).toContain('display: none');
				});
		});

		it('should navigate to the search page after all 48 items have been shown', () => {
			// scroll to 'View More' each time new tiles are added, then click it
			homepagePO.scrollTo(2000)
				.then(homepagePO.viewMoreButton.click)
				.then(() => {
					return homepagePO.scrollTo(4600);
				})
				.then(homepagePO.viewMoreButton.click)
				.then(() => {
					// 48 showing
					for (let i = 0; i < 48; i++) {
						expect(homepagePO.trendingTiles.get(i).getAttribute('style')).not.toContain('display: none');
					}
					//expect(homepagePO.getTileStyle(47)).not.toContain('display: none');
					return homepagePO.scrollTo(5000);
				})
				.then(homepagePO.viewMoreButton.click)
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
				expect(homepagePO.trendingAdImgs.count()).toEqual(mockData.ads.length, 'Only trending items specified in mocked data should display');

				// check trending item for src attr, lazy loaded images should not have loaded
				let mockAdImgs = [];
				let mockProfileImgs = [];
				for (let i = 0; i < 48; i++) {
					mockAdImgs.push(mockData.ads[i].seller.profileImage);
					mockProfileImgs.push(mockData.ads[i].pictures[0].url);
				}

				expect(homepagePO.getTileAdImages()).not.toEqual(mockAdImgs, 'Tile is not in view and ad image should not be loaded yet');
				expect(homepagePO.getTileProfileImages()).not.toEqual(mockProfileImgs, 'Tile is not in view and profile image should not be loaded yet');

				// resize window to show all trending items
				browser.driver.manage().window().setSize(375, 667);

				// check trending items for src attr, lazy load should be finished loading
				setTimeout(() => {
					expect(homepagePO.getTileAdImages()).toEqual(mockAdImgs, 'Ad image should be lazy loaded by now');
					expect(homepagePO.getTileProfileImages()).toEqual(mockProfileImgs, 'Profile image should be lazy loaded by now');
				}, 3000);
			});
		});
	});
});
