'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Hamburger', () => {
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
			`${endpoints.userFromCookie}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json');
		specHelper.registerMockEndpoint(
			`${endpoints.updateConfig}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/Ad.json');
		specHelper.registerMockEndpoint(
			`${endpoints.recentActivities}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/recentActivity.json');
		specHelper.registerMockEndpoint(
			`${endpoints.trendingSearch}?_forceExample=true&_statusCode=200&offset=0&limit=48&minResults=48&withPicsOnly=true`,
			'test/serverUnit/mockData/api/v1/TrendingCard.json');
	});

	it('should show logged in user name for logged in user', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0; bt_auth=loggedin')
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					let hamburgerMenu = c$('.menu-container');
					let profilePicture = c$('.profile-icon', hamburgerMenu);
					let profileName = c$('.profile-welcome-text', hamburgerMenu);

					expect(profileName.text().trim()).toContain('Bolt', 'expected it to show the correct username');
					let profileImageEnding = '12345678901234567890/picture';
					expect(profilePicture.css('background-image')).toContain(profileImageEnding,
						`expected profile image for logged in user to be ${profileImageEnding}`);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should show correct category information', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0;')
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					let hamburgerMenu = c$('.menu-container');
					let data = specHelper.getMockDataByLocale("categories", "categories", "es_MX");
					let map = new Map();
					map.set(data.localizedName, data._links[1].href);
					data.children.map((child) => {
						map.set(child.localizedName, child._links[1].href);
					});
					let categories = c$('#js-hamburger-browse', hamburgerMenu);
					let exploreCategories = c$('.browse-categories-text', hamburgerMenu);
					expect(exploreCategories.text().trim()).toBe(i18n.header.catDropdown.browseCategories,
						`expected Explore categories drop down to be ${i18n.header.catDropdown.browseCategories}`);
					c$('a', categories).each((i, el) => {
						let element = c$(el);
						let name = element.text().trim();
						expect(map.has(name)).toBe(true, `link ${name} should be in the mock data`);
						let link = map.get(name);
						let href = element.attr('href');
						expect(element.attr('href').indexOf(link) >= 0).toBe(true,
							`expected link for ${name} to be ${link}, got ${href}`);
					});
				})
				.end(specHelper.finish(done));
		});
	});

	it('should show correct profile information for logged in', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0; bt_auth=on')
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					let hamburgerMenu = c$('.menu-container');
					let data = specHelper.getMockDataByLocale("profile", "profile", "es_MX");
					let map = new Map();
					data.loggedInContent.map((child) => {
						map.set(child.localizedName, child.link);
					});
					let profileArea = c$('.profile-dropdown', hamburgerMenu);
					c$('a', profileArea).each((i, el) => {
						let element = c$(el);
						let name = element.text().trim();
						expect(map.has(name)).toBe(true, `link ${name} should be in the mock data`);
						let link = map.get(name);
						let href = element.attr('href');
						expect(element.attr('href')).toBe(link,
							`expected link for ${name} to be ${link}, got ${href}`);
					});
				})
				.end(specHelper.finish(done));
		});
	});
});
