'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Server to hit HomePage', function() {

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

	describe('Header', () => {

		it('shows header', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						expect(res.status).toBe(200);

						let c$ = cheerio.load(res.text);
						expect(c$('.headerV2').length).toBe(1, 'header selector returned no matches, 1 header element should be found');
					})
					.end(specHelper.finish(done));
			});
		});

		it('header logo is linked to root', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						expect(res.status).toBe(200);

						let c$ = cheerio.load(res.text);
						let header = c$('.headerV2');
						expect(header.length).toBe(1, 'header selector returned no matches, 1 header element should be found');

						let href   = c$('a:has(div.logo)', header).attr('href');
						expect(href).toBe('/', 'the link href for the logo should link to the root');
					})
					.end(specHelper.finish(done));
			});
		});

		it('category dropdown has correct content and links but is hidden', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						expect(res.status).toBe(200);

						let data = specHelper.getMockDataByLocale("categories", "categories", "es_MX");
						let map = new Map();
						for(let value of data.children) {
							// setup a key we can use to lookup the category
							let key = value.localizedName;
							map.set(key, value);
						}

						let c$ = cheerio.load(res.text);
						let catUl = c$('#js-cat-dropdown');
						expect(catUl.length).toBe(1, '1 element with id js-cat-dropdown should exist');
						expect(catUl.hasClass('hidden')).toBe(true, 'dropdown should be hidden');

						let linkCount = 0;
						c$('a', catUl).filter((i, el) => {
							linkCount++;
							let itemName = c$('.item-primary-text', el).text();
							expect(map.has(itemName)).toBe(true, `link ${itemName} should contain a name from mock data`);

							let href = c$(el).attr('href');
							expect(href).toContain("-TBD",  `href ${href} should contain a TBD link`);	// todo: this will eventually become a real link
						});
						expect(linkCount).toBe(data.children.length, 'count of category items in the menu');

					})
					.end(specHelper.finish(done));
			});
		});
	});
});
