'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Server to hit HomePage', function() {

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
	});

	describe('GET /', () => {

		it('returns status code 200', (done) => {
			boltSupertest('/').then((supertest) => {
				supertest
					.expect((res) => {
						expect(res.status).toBe(200);
					})
					.end(specHelper.finish(done));
			});
		});
	});

	it('returns Gumtree', function(done) {
		boltSupertest('/', 'gumtree.co.za').then((supertest) => {
			supertest
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					let headerText = c$('h1')[0].firstChild;
					expect(headerText.data).toBe('Gumtree South Africa - Free local classifieds');
					expect(res.status).toBe(200);
				})
				.end(specHelper.finish(done));
		});
	});

	describe('Safety Tips', () => {

		it('shows safety tips card on vivanuncios', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						expect(c$('.safetyTips')).toBeDefined();
						expect(c$('.safetyTips .title h1')[0]
							.firstChild.data).toContain('Vivanuncios Te Cuida');
					})
					.end(specHelper.finish(done));
			});
		});

		it('shows safety faq text on vivanuncios', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						let faq = c$('.safetyTips .faq a')[0];
						expect(faq.attribs.href)
							.toBe('http://ayuda.vivanuncios.com.mx/MX?lang=es&l=es&c=PKB%3AConsejos_de_Seguridad');
						expect(faq.firstChild.data).toContain('Consejos de seguridad');
					})
					.end(specHelper.finish(done));
			});
		});
	});

	describe('Recent Activitiy', () => {
		it('shows feed tiles on vivanuncios', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						expect(c$('.feed-tiles')).toBeDefined();
						expect(res.status).toBe(200);
					})
					.end(specHelper.finish(done));
			});
		});
	});

	describe('Footer', () => {
		it('shows footer', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						expect(c$('.footer-wrapper')).toBeDefined();
						expect(res.status).toBe(200);
					})
					.end(specHelper.finish(done));
			});
		});
	});

	describe('Header', () => {

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
						expect(href).toBe('/quickpost', 'the link href for the post ad button should link to post ad page');
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

						let href = c$('a:has(div.help)', header).attr('href');
						expect(href).toBe('help-TBD', 'the link href for help should link to the help page');	// todo: define where these should link to
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
							map.set(`${value.localizedName}`, value + "-TBD");
						}

						// ensure dropdown is exists and is hidden
						let c$ = cheerio.load(res.text);
						let profDropdown = c$('#js-profile-dropdown');
						expect(profDropdown).toBeDefined('element with id js-profile-dropdown should exist');
						expect(profDropdown.hasClass('hidden')).toBe(true, 'dropdown should be hidden');

						// test list item attributes
						let linkCount = 0;
						c$('li a', profDropdown).each((i, el) => {
							linkCount++;
							let itemName = c$('.profile-item-text', el).text();
							expect(map.has(itemName)).toBe(true, `link ${itemName} should contain a name from mock data`);

							let href = c$(el).attr('href');
							expect(href).toContain("-TBD", `href ${href} should contain a TBD link`);	// todo: this will eventually become a real link
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
							map.set(`${value.localizedName}`, value + "-TBD");
						}

						// ensure dropdown is exists and is hidden
						let c$ = cheerio.load(res.text);
						let profDropdown = c$('#js-profile-dropdown');
						expect(profDropdown).toBeDefined('element with id js-profile-dropdown should exist');
						expect(profDropdown.hasClass('hidden')).toBe(true, 'dropdown should be hidden');

						// test list item attributes
						let linkCount = 0;
						c$('li a', profDropdown).each((i, el) => {
							linkCount++;
							let itemName = c$('.profile-item-text', el).text();
							expect(map.has(itemName)).toBe(true, `link ${itemName} should contain a name from mock data`);

							let href = c$(el).attr('href');
							expect(href).toContain("-TBD", `href ${href} should contain a TBD link`);	// todo: this will eventually become a real link
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
						for (let value of data.children) {
							// setup a key we can use to lookup the category
							let key = value.localizedName;
							map.set(key, value);
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
							let itemName = c$('.item-primary-text', el).text();
							expect(map.has(itemName)).toBe(true, `link ${itemName} should contain a name from mock data`);

							let href = c$(el).attr('href');
							expect(href).toContain("-TBD", `href ${href} should contain a TBD link`);	// todo: this will eventually become a real link
						});
						expect(linkCount).toBe(data.children.length, 'count of category items in the menu');

					})
					.end(specHelper.finish(done));
			});
		});
	});
});
