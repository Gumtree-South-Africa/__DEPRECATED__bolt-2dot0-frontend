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


	describe('Trending Card', () => {

		beforeEach(() => {
			homepagePO.visitPage();
		});

		it('should visit with the 2.0 cookie value', () => {
			browser.manage().getCookie('b2dot0Version').then(function(cookie) {
				expect(cookie.value).toEqual('2.0');
			});
		});

		// it('should navigate to the ad page when clicking trending item', () => {
		// 	/* fail in CI:
		// 	 ElementNotVisibleError: element not visible
		// 	 */
		//
		// 	homepagePO.scrollTo(400);
		// 	homepagePO.trendingItemLink.click();
		//
		// 	expect(browser.getCurrentUrl()).toContain(mockData.ads[0].viewSeoUrl, 'Navigated to the incorrect ad url');
		// });

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

		// it('should show 32 tiles after clicking View More button', () => {
		// 	/* fail in CI:
		// 	 Element is not clickable at point (33, 433). Other element would receive the click: <img class="lazy ad-image" data-original="http://img.classistatic.com/crop/200x150/i.ebayimg.com/00/s/NDgwWDY0MA==/z/MIcAAOSw65FXsiB~/$_19.JPG?set_id=8800005007" src="http://img.classistatic.com/crop/200x150/i.ebayimg.com/00/s/NDgwWDY0MA==/z/MIcAAOSw65FXsiB~/$_19.JPG?set_id=8800005007" style="display: inline;">
		// 	 */
		// 	// scroll down to 'View More' button
		// 	homepagePO.scrollTo(2000)
		// 		.then(homepagePO.viewMoreButton.click)
		// 		.then(() => {
		// 			// 32 showing
		// 			let i;
		// 			for (i = 0; i < 32; i++) {
		// 				expect(homepagePO.getTileStyle(i)).not.toContain('display: none');
		// 			}
		//
		// 			// 16 are hidden
		// 			for (i = 32; i < 48; i++) {
		// 				expect(homepagePO.getTileStyle(i)).toContain('display: none');
		// 			}
		//
		// 			// thought this might speed up the test instead of the above looping, but it doesnt seem to
		// 			// expect(homepagePO.getTileStyle(31)).not.toContain('display: none');
		// 			// expect(homepagePO.getTileStyle(32)).toContain('display: none');
		// 		});
		// });

		// it('should navigate to the search page after all 48 items have been shown', () => {
		// 	/* fail in CI:
		// 	 Failed: unknown error: Element is not clickable at point (33, 433). Other element would receive the click: <img class="lazy ad-image" data-original="http://img.classistatic.com/crop/200x150/i.ebayimg.com/00/s/NjAwWDgwMA==/z/Wa0AAOSw65FXsiGy/$_19.JPG?set_id=8800005007" src="http://img.classistatic.com/crop/200x150/i.ebayimg.com/00/s/NjAwWDgwMA==/z/Wa0AAOSw65FXsiGy/$_19.JPG?set_id=8800005007" style="display: inline;">			 */
		// 	// scroll to 'View More' each time new tiles are added, then click it
		// 	homepagePO.scrollTo(2000)
		// 		.then(homepagePO.viewMoreButton.click)
		// 		.then(() => {
		// 			return homepagePO.scrollTo(4600);
		// 		})
		// 		.then(homepagePO.viewMoreButton.click)
		// 		.then(() => {
		// 			// 48 showing
		// 			for (let i = 0; i < 48; i++) {
		// 				expect(homepagePO.getTileStyle(i)).not.toContain('display: none');
		// 			}
		// 			//expect(homepagePO.getTileStyle(47)).not.toContain('display: none');
		// 			return homepagePO.scrollTo(5000);
		// 		})
		// 		.then(homepagePO.viewMoreButton.click)
		// 		.then(() => {
		// 			expect(browser.getCurrentUrl()).toContain('search.html', 'Final "View More" click should navigate to the search page');
		// 		});
		// });
	});

	describe('lazy load', () => {
		beforeEach(() => {
			// set window size so that images dont lazy load immediately
			browser.driver.manage().window().setSize(375, 200);
			homepagePO.visitPage();
		});

		it('should lazy load the trending item image when it scrolls into view', () => {
			// console.log(jasmine.DEFAULT_TIMEOUT_INTERVAL);

			expect(homepagePO.trendingAdImgs.count()).toEqual(mockData.ads.length, 'should have an item for all 48 ads');

			// load the actual source image urls
			let mockAdImgs = [];
			let mockProfileImgs = [];

			// these numbers may need to change if header changes height
			// this size assumes there is an ad banner above the tiles (ad banner appears only desktop)
			let browserHeight = 705;	// this height browser will expose a certain number of image tiles
			let imagesToCheck = 3;		// this number of images are exposed for the specified height

			for (let i = 0; i < imagesToCheck; i++) {

				//console.log(`ad ${mockData.ads[i].pictures[0].url}`);
				mockAdImgs.push(mockData.ads[i].pictures[0].url);

				// note: not all seller urls have data
				//console.log(`pr ${mockData.ads[i].seller.profileImage}`);
				mockProfileImgs.push(mockData.ads[i].seller.profileImage);

				// check trending item for src attr, lazy loaded images should not have loaded
				expect(homepagePO.getTileAdImage(i)).not.toEqual(mockAdImgs[i], 'Tile is not in view and ad image should not be loaded yet');
				expect(homepagePO.getTileProfileImage(i)).not.toEqual(mockProfileImgs[i], 'Tile is not in view and profile image should not be loaded yet');
			}

			// resize window to show all trending items
			browser.driver.manage().window().setSize(375, browserHeight).then(() => {
				return browser.sleep(1000);
			}).then(() => {
				// only checking the 3 images we expect to be loaded based on our window size
				for (let i = 0; i < imagesToCheck; i++) {
					homepagePO.getTileAdImage(i).then((image) => {
						expect(image).toEqual(mockAdImgs[i], `Ad image ${i} should be lazy loaded by now`);
					});
					if (mockProfileImgs[i]) {	// these may be undefined in mock data, not all ads have a seller profile
						homepagePO.getTileProfileImage(i).then((image) => {
							// concat the '13.JPG' like we do in the template
							expect(image).toEqual(mockProfileImgs[i] + '13.JPG', `Profile image ${i} should be lazy loaded by now`);
						});
					}
				}
			});
		});
	});
});
