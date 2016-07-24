'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Top Locations', () => {
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

	it('top locations should have correct i18n content', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					let c$ = cheerio.load(res.text);
					let locationHeader = c$('.location-header-text');
					expect(locationHeader.length).toBe(1, 'selector should produce 1 element for location header');

					let locationHeaderText = c$('.location-header-text').text().trim();
					expect(locationHeaderText).toBe(i18n.footer.toplocations, 'i18n string for location header item should match');
				})
				.end(specHelper.finish(done));
		});
	});

	it('should show locations', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					expect(c$('.locations-wrapper').length).toBe(1, 'selector should produce 1 element for top locations');
					expect(res.status).toBe(200);
				})
				.end(specHelper.finish(done));
		});
	});
});
