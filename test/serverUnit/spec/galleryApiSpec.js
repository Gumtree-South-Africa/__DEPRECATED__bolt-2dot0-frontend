'use strict';

let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;


describe('Gallery Ad Api', () => {

	describe('Gallery Ads (GET)', () => {

		it('should respond with 200', (done) => {
			let requestData = {
				offset: 0,
				limit: 16
			};

			let responseFile = require('../../serverUnit/mockData/gallery/galleryResult.json');

			specHelper.registerMockEndpoint(
				`${endpoints.homepageGallery}?_forceExample=true&_statusCode=200&offset=${requestData.offset}&limit=${requestData.limit}`,
				'test/serverUnit/mockData/gallery/galleryResult.json');

			boltSupertest('/api/ads/gallery/card', 'vivanuncios.com.mx', 'GET').then((supertest) => {
				supertest
					.query(`offset=${requestData.offset}&limit=${requestData.limit}`)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(200, 'should return status 200');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						// make sure the ads are transformed into the new format, and the card config is present
						expect(jsonResult.config.cardName).toBe("galleryCard");
						expect(jsonResult.ads[0].price.priceType).toBe(responseFile.ads[0].priceType);
						expect(jsonResult.ads[0].price.currency).toBe(responseFile.ads[0].currency);
						expect(jsonResult.ads[0].price.amount).toBe(responseFile.ads[0].amount);
						expect(jsonResult.ads[0].viewSeoUrl).toBe(responseFile.ads[0].viewPageUrl);
						expect(jsonResult.ads[0].pictures[0].url).toBe(responseFile.ads[0].primaryImgUrl);

					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400 (params are missing)', (done) => {

			boltSupertest('/api/ads/gallery/card', 'vivanuncios.com.mx', 'GET').then((supertest) => {
				supertest
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400, 'should return status 400');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						expect(jsonResult.error).toBe("query params required");
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400 (params are not numeric)', (done) => {

			boltSupertest('/api/ads/gallery/card', 'vivanuncios.com.mx', 'GET').then((supertest) => {
				supertest
					.query(`offset=foo&limit=bar`)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400, 'should return status 400');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						expect(jsonResult.error).toBe("query params could not be parsed into numbers");
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 500 (api call mocked 500)', (done) => {
			let requestData = {
				offset: 0,
				limit: 16
			};

			specHelper.registerMockEndpoint(
				`${endpoints.homepageGallery}?_forceExample=true&_statusCode=200&offset=${requestData.offset}&limit=${requestData.limit}`,
				'test/serverUnit/mockData/gallery/galleryResult.json', { failStatusCode: 500 });

			boltSupertest('/api/ads/gallery/card', 'vivanuncios.com.mx', 'GET').then((supertest) => {
				supertest
					.query(`offset=${requestData.offset}&limit=${requestData.limit}`)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(500, 'should return 500 on failed call');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						expect(jsonResult.error).toBe("unable to get gallery data, see logs for details");
					})
					.end(specHelper.finish(done));
			});
		});

	});

});
