'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Server to hit HomePage', function() {

	let lat = "19.451054";
	let lng = "-99.125519";
	let geoCookie = `${lat}ng${lng}`;

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
			`${endpoints.recentActivities}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/recentActivity.json');
		specHelper.registerMockEndpoint(
			`${endpoints.trendingSearch}?_forceExample=true&_statusCode=200&offset=0&limit=15&geo=null`,
			'test/serverUnit/mockData/api/v1/TrendingCard.json');


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

	describe('Geo Location', () => {

		it('shows geo location on home page', (done) => {

			let file = specHelper.getMockData("geo", "geoLocation");

			specHelper.registerMockEndpoint(
				`${endpoints.locationHomePage}/${lat}/${lng}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/geo/geoLocation.json');

			specHelper.registerMockEndpoint(
				`${endpoints.recentActivities}?_forceExample=true&_statusCode=200&geo=(${lat}%2C${lng})`,
				'test/serverUnit/mockData/api/v1/recentActivity.json');

			specHelper.registerMockEndpoint(
				`${endpoints.trendingSearch}?_forceExample=true&_statusCode=200&offset=0&limit=15&geo=(${lat}%2C${lng})`,
				'test/serverUnit/mockData/api/v1/TrendingCard.json');

			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('cookie', `b2dot0Version=2.0;geoId=${geoCookie}`)
					.expect((res) => {
						let c$ = cheerio.load(res.text);

						// searchControls has the location in it
						let searchControls = c$('#search-controls');
						expect(searchControls.length).toBe(1, 'selector should produce 1 element for searchControls');
						let location = c$('.location-text', searchControls);
						expect(location.text().trim()).toBe(file.localizedName);
					})
					.end(specHelper.finish(done));
			});
		});
	});

	describe('Safety Tips', () => {

		it('shows safety tips card on vivanuncios', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('cookie', `b2dot0Version=2.0`)
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
});
