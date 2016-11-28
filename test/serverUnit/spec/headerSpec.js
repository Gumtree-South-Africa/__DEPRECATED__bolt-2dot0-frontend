'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Header', () => {
	let i18n;

	beforeAll(() => {
		i18n = specHelper.getMockDataByLocale("/app/locales/bolt-translation", "", "es_MX");
	});

	beforeEach(() => {
		specHelper.registerMockEndpoint(
			`${endpoints.topLocationsL2}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/LocationList.json');
		specHelper.registerMockEndpoint(
			`${endpoints.topKeywords}?limit=15&_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/keywords.json');
		specHelper.registerMockEndpoint(
			`${endpoints.trendingKeywords}?limit=15&_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/keywords.json');
		specHelper.registerMockEndpoint(
			`${endpoints.homepageGallery}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/GallerySlice.json');
		specHelper.registerMockEndpoint(
			`${endpoints.adStatistics}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/GallerySlice.json');
		specHelper.registerMockEndpoint(
			`/users/logged-in-user-info?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json');
		specHelper.registerMockEndpoint(
			`${endpoints.recentActivities}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/recentActivity.json');
		specHelper.registerMockEndpoint(
			`${endpoints.trendingSearch}?_forceExample=true&_statusCode=200&offset=0&limit=48&minResults=48&withPicsOnly=true`,
			'test/serverUnit/mockData/api/v1/TrendingCard.json');
	});

	it('should show header content', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					let c$ = cheerio.load(res.text);
					expect(c$('.headerV2').length).toBe(1, 'selector should produce 1 element for header');
				})
				.end(specHelper.finish(done));
		});
	});

	it('header logo should link to root', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					let c$ = cheerio.load(res.text);
					let header = c$('.headerV2');
					expect(header.length).toBe(1, 'selector should produce 1 element for header');

					let href = c$('a:has(div.logo)', header).attr('href');
					expect(href).toBe('/', 'the link href for the logo should link to the root');
				})
				.end(specHelper.finish(done));
		});
	});

	it('header post ad button should have correct i18n content and link', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					let c$ = cheerio.load(res.text);
					let header = c$('.headerV2');
					expect(header.length).toBe(1, 'selector should produce 1 element for header');

					let button = c$('.post-ad-button', header);
					expect(button.length).toBe(1, 'selector should produce 1 element for post ad button');

					let buttonText = c$('.sudolink', button).text().trim();
					expect(buttonText).toBe(i18n.header.postAd, 'i18n string for button is does not match');

					let href = c$('a', button).attr('href');
					expect(href).toBe('/post?&backUrl=./', 'the link href for the post ad button should link to post ad page');
				})
				.end(specHelper.finish(done));
		});
	});

	it('header help menu should have correct i18n content and link ', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					let c$ = cheerio.load(res.text);
					let header = c$('.headerV2');
					expect(header.length).toBe(1, 'selector should produce 1 element for header');

					let mainMenuItemText = c$('.help', header).text().trim();
					expect(mainMenuItemText).toBe(i18n.header.help, 'i18n string for help menu item should match');

					//Will uncomment it out once the https Branch goes live
					//let href = c$('a:has(div.help)', header).attr('href');
					//expect(href).toBe('http://ayuda.vivanuncios.com.mx/MX/', 'the link href for help should link to the help page');	// todo: define where these should link to
				})
				.end(specHelper.finish(done));
		});
	});

	it('profile dropdown is hidden and has correct content with a user logged in', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0; bt_auth=on')
				.expect((res) => {
					expect(res.status).toBe(200);

					// setup map of expected text to href
					let data = specHelper.getMockDataByLocale("profile", "profile", "es_MX");
					let map = new Map();
					for (let value of data.loggedInContent) {
						map.set(`${value.localizedName}`, value);
						map.set(`${value.link}`, value.link);
					}

					// ensure dropdown is exists and is hidden
					let c$ = cheerio.load(res.text);
					let profDropdown = c$('#js-profile-dropdown');
					expect(profDropdown).toBeDefined('element with id js-profile-dropdown should exist');
					expect(profDropdown.hasClass('hidden')).toBe(true, 'dropdown should be hidden');

					// test list item attributes
					let linkCount = 0;
					c$('li span', profDropdown).each((i, el) => {
						linkCount++;
						let itemName = c$('.profile-item-text', el).text();
						expect(map.has(itemName)).toBe(true, `link ${itemName} should contain a name from mock data`);

						let link = c$(el).attr('data-o-uri');
						expect(map.has(link)).toBe(true, `link ${itemName} should have href: ${link}`);
					});
					expect(linkCount).toBe(data.loggedInContent.length, 'count of category items in the menu');
				})
				.end(specHelper.finish(done));
		});
	});

	it('profile dropdown is hidden and has correct content with no user logged in', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					// setup map of expected text to href
					let data = specHelper.getMockDataByLocale("profile", "profile", "es_MX");
					let map = new Map();
					for (let value of data.loggedOutContent) {
						map.set(`${value.localizedName}`, value);
						map.set(`${value.link}`, value.link);
					}

					// ensure dropdown is exists and is hidden
					let c$ = cheerio.load(res.text);
					let profDropdown = c$('#js-profile-dropdown');
					expect(profDropdown).toBeDefined('element with id js-profile-dropdown should exist');
					expect(profDropdown.hasClass('hidden')).toBe(true, 'dropdown should be hidden');

					// test list item attributes
					let linkCount = 0;
					c$('li span', profDropdown).each((i, el) => {
						linkCount++;
						let itemName = c$('.profile-item-text', el).text();
						expect(map.has(itemName)).toBe(true, `link ${itemName} should contain a name from mock data`);

						let link = c$(el).attr('data-o-uri');
						expect(map.has(link)).toBe(true, `link ${itemName} should have href: ${link}`);
					});
					expect(linkCount).toBe(data.loggedOutContent.length, 'count of category items in the menu');

					// ensure button is login
					let buttonText = c$('.login-button .sudolink', profDropdown).text().trim();
					expect(buttonText).toBe(data.logInBtnText.localizedName);

				})
				.end(specHelper.finish(done));
		});
	});

	it('category dropdown should have correct i18n content and links but is hidden', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					let data = specHelper.getMockDataByLocale("categories", "categories", "es_MX");
					let map = new Map();

					// add the root "All Categories"
					map.set(data.id, data);

					// only expecting L1 categories
					for (let child of data.children) {
						// setup a key we can use to lookup the category
						let key = child.id;
						map.set(key, child);
					}

					let c$ = cheerio.load(res.text);
					let catUl = c$('#js-cat-dropdown');
					expect(catUl.length).toBe(1, 'selector should produce 1 element for cat dropdown');
					expect(catUl.hasClass('hidden')).toBe(true, 'cat dropdown should be hidden');

					let mainMenuItemText = c$('#js-browse-item-text').text().trim();
					expect(mainMenuItemText).toBe(i18n.header.catDropdown.browse, 'i18n string for category main menu item should match');

					let linkCount = 0;
					c$('a', catUl).each((i, el) => {
						linkCount++;
						// lookup the metadata we need to validate from the map
						let stringId = c$(el).attr('data-id');
						let id = parseInt(stringId);
						expect(id).toEqual(jasmine.any(Number), `link with id ${stringId} should be numeric`);
						expect(map.has(id)).toBe(true, `link with id ${id} should be found in mock data`);
						let mapValue = map.get(id);

						let itemName = c$('.item-primary-text', el).text();
						expect(itemName).toBe(mapValue.localizedName, `link ${itemName} should match mock data localizedName`);

						let href = c$(el).attr('href');
						if (id === 0) {
							expect(href).toContain(`b${id}`, `link href ${href} should contain category id string 'b${id}'`);

						} else {
							expect(href).toContain(`c${id}`, `link href ${href} should contain category id string 'c${id}'`);
						}

						let title = c$(el).attr('title');
						expect(title).toBe(mapValue.localizedName, `link title ${title} should match mock data localizedName`);
					});

					expect(linkCount).toBe(map.size, 'count of category items in the menu');

				})
				.end(specHelper.finish(done));
		});
	});
});
