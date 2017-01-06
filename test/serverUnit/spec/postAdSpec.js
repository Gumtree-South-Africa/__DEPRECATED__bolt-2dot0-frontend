'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;
let cheerio = require('cheerio');


describe('Post Ad Page', () => {
	let i18n;

	beforeAll(() => {
		i18n = specHelper.getMockDataByLocale("/app/locales/bolt-translation", "", "es_MX");
	});

	beforeEach(() => {
		specHelper.registerMockEndpoint(
			`${endpoints.userFromCookie}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json');
	});

	it('should display header in distraction free mode', (done) => {
		boltSupertest('/post', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					let c$ = cheerio.load(res.text);
					expect(c$('.headerV2').length).toBe(1, 'header should be on the page');
					expect(c$('.headerV2').children.length).toBe(1, 'header should have only child');
					let button = c$('.post-ad-button');
					expect(button.length).toBe(0, 'selector should produce 0 elements for post ad button');
				})
				.end(specHelper.finish(done));
		});
	});

	it('should show footer in distraction free mode', (done) => {
		boltSupertest('/post', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);
					let c$ = cheerio.load(res.text);
					expect(c$('.footer-wrapper').length).toBe(1, 'footer should be displayed');

					expect(c$('.footer-aboutus').length).toBe(0, 'footer should not display about us');
					expect(c$('.df-footer-legal').length).toBe(1, 'footer should display legal information');
					expect(c$('.app-downloads-container').length).toBe(0, 'footer should not display app download information');
				})
				.end(specHelper.finish(done));
		});
	});

	it('should show correct translations for tips', (done) => {
		boltSupertest('/post', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);
					let c$ = cheerio.load(res.text);
					expect(c$('#promote-without-if .header-text .title-text').text().trim()).toBe(i18n.promote.confirmation);
					//expect(c$('.didKnow-text').text().trim()).toBe(i18n.postAd.confirm.didYouKnow);
					//expect(c$('.confirm-tip').text().trim()).toBe(i18n.postAd.confirm.tip);
					expect(c$('.directions').text().trim()).toBe(i18n.postAd.createAds.directions);
					expect(c$('.post-ad-btn .link-text').text().trim()).toBe(`${i18n.postAd.createAds.post} ${i18n.postAd.createAds.ad}`);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should redirect if b2dot0Version cookie not set', (done) => {
		boltSupertest('/post', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.expect((res) => {
					expect(res.status).toBe(302);
					expect(res.headers.location).toBe("/post.html");
				})
				.end(specHelper.finish(done));
		});
	});

});
