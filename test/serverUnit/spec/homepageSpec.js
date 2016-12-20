
'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;
let mockTrending = require(`${process.cwd()}/test/serverUnit/mockData/api/v1/TrendingCard.json`);

describe('Server to hit HomePage', function() {
	let i18n;
	let lat = "19.451054";
	let lng = "-99.125519";
	let geoCookie = `${lat}ng${lng}`;

	beforeEach(() => {
		i18n = specHelper.getMockDataByLocale("/app/locales/bolt-translation", "", "es_MX");

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
			`${endpoints.recentActivities}?_forceExample=true&_statusCode=200&limit=50`,
			'test/serverUnit/mockData/api/v1/recentActivity.json');
		specHelper.registerMockEndpoint(
			`${endpoints.trendingSearch}?_forceExample=true&_statusCode=200&offset=0&limit=48&minResults=48&withPicsOnly=true`,
			'test/serverUnit/mockData/api/v1/TrendingCard.json');
	});

	describe('V1 Home Page', () => {

		it('should return status code 200', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.expect((res) => {
						expect(res.status).toBe(200);
					})
					.end(specHelper.finish(done));
			});
		});
	});

	describe('Trending Card', () => {
		it('should show on vivanuncios', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						expect(c$('.trending-card')).toBeDefined();
						expect(c$('.card-trendingCard .card-title').text())
							.toContain(i18n.homepage.popularSearches.popularIn, 'i18n string should match');
						expect(c$('.card-trendingCard .card-title').text())
							.toContain(i18n.homepage.popularSearches.yourNeighborhood, 'i18n string should match');
						expect(c$('.tile-item').length).toBe(mockTrending.ads.length);
					})
					.end(specHelper.finish(done));
			});
		});

		it('should show price, user profile image and product image on trending tiles', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						let trendingItem = c$('.tile-item').first();
						expect(trendingItem).toBeDefined('Cannot find a trending tile');

						// Item 1, priceType: MXN
						expect(trendingItem.find("img.lazy.ad-image").attr('data-original'))
							.toBe(mockTrending.ads[0].pictures[0].url, 'Missing lazy load product url');
						expect(trendingItem.find(".price-text").text()).toContain("$50,000");
						expect(trendingItem.find(".price-text").text()).not.toContain("USD");

						// Item 2, priceType: USD
						trendingItem = c$('.tile-item').next();
						expect(trendingItem.find("img.lazy.ad-image").attr('data-original'))
							.toBe(mockTrending.ads[1].pictures[0].url, 'Missing lazy load product url');
						expect(trendingItem.find(".price-text").text()).toContain("$50,000");
						expect(trendingItem.find(".price-text").text()).toContain("USD");

						// Item 3, priceType: CONTACT_ME
						trendingItem = c$('.tile-item').next().next();
						expect(trendingItem.find("img.lazy.ad-image").attr('data-original'))
							.toBe(mockTrending.ads[2].pictures[0].url, 'Missing lazy load product url');
						expect(trendingItem.find(".price-text").text()).toContain(i18n.homepage.trending.contact);

						// Item 4, no profile image
						trendingItem = c$('.tile-item').next().next().next();
						expect(trendingItem.find("img.lazy.ad-image").attr('data-original'))
							.toBe(mockTrending.ads[3].pictures[0].url, 'Missing lazy load product url');
						expect(trendingItem.find(".price-text").text()).toContain(i18n.homepage.trending.contact);
					})
					.end(specHelper.finish(done));
			});
		});
	});

	describe('Geo Location', () => {

		it('should show geo location on home page (geoId cookie passed)', (done) => {

			let file = require('../../serverUnit/mockData/geo/geoLocation.json');

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

		it('should show safety tips card on vivanuncios', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('cookie', `b2dot0Version=2.0`)
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						expect(c$('.safetyTips')).toBeDefined();
						expect(c$('.safetyTips .title h2')[0]
							.firstChild.data).toContain('Vivanuncios Te Cuida');
					})
					.end(specHelper.finish(done));
			});
		});


		it('should show safety faq text on vivanuncios', (done) => {
			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let c$ = cheerio.load(res.text);
						let faq = c$('.safetyTips .faq a')[0];
						expect(faq.attribs.href)
							.toBe('https://ayuda.vivanuncios.com.mx/MX?lang=es&l=es&c=PKB%3AConsejos_de_Seguridad');
						expect(faq.firstChild.data).toContain('Consejos de seguridad');
					})
					.end(specHelper.finish(done));
			});
		});
  	});

	describe('Recent Activitiy', () => {
		it('should show feed tiles on vivanuncios', (done) => {
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

	describe('Header Page Messages', () => {

		it('should return status code 200 with flash message (userRegistered)', (done) => {

			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.query("status=userRegistered")
					.expect((res) => {
						expect(res.status).toBe(200);
						let c$ = cheerio.load(res.text);
						let messages = c$('.gl-messages');
						expect(messages.length).toBe(1, 'should have messages element');
						let message = c$(messages, '.message');
						expect(message.length).toBe(1, 'should have a message element');
						expect(message.text().trim()).toBe(i18n['home.user.registered']);
					})
					.end(specHelper.finish(done));
			});
		});

		it('should return status code 200 with flash message (adInactive)', (done) => {

			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.query("status=adInactive")
					.expect((res) => {
						expect(res.status).toBe(200);
						let c$ = cheerio.load(res.text);
						let messages = c$('.gl-messages');
						expect(messages.length).toBe(1, 'should have messages element');
						let message = c$(messages, '.message');
						expect(message.length).toBe(1, 'should have a message element');
						expect(message.text().trim()).toBe(i18n['home.ad.notyetactive']);
					})
					.end(specHelper.finish(done));
			});
		});

		it('should return status code 200 with flash message (resetPassword)', (done) => {

			boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.query("status=resetPassword")
					.expect((res) => {
						expect(res.status).toBe(200);
						let c$ = cheerio.load(res.text);
						let messages = c$('.gl-messages');
						expect(messages.length).toBe(1, 'should have messages element');
						let message = c$(messages, '.message');
						expect(message.length).toBe(1, 'should have a message element');
						expect(message.text().trim()).toBe(i18n['home.reset.password.success']);
					})
					.end(specHelper.finish(done));
			});
		});
	});
});
