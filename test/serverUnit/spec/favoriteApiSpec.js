'use strict';

let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;


describe('Favorite Ad Api', () => {

	describe('Favorite Ad (POST)', () => {

		beforeEach(() => {
			specHelper.verifyMockEndpointsClean();
		});

		afterEach(() => {
			specHelper.verifyMockEndpointsClean();
		});

		it('should respond with 200', (done) => {
			let file = {
				"adId": "1234567890"
			};

			specHelper.registerMockEndpoint(
				`${endpoints.favoriteAd.replace('{id}',file.adId)}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/favorites/emptyResult.json');

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.set('Cookie', 'bt_auth="test value"')
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(200, 'should return status 200');
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 401 (bt_auth cookie missing)', (done) => {
			let file = {
				"adId": "1234567890"
			};

			specHelper.registerMockEndpoint(
				`${endpoints.favoriteAd.replace('{id}',file.adId)}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/favorites/emptyResult.json');

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(401, 'should return status 401');
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400 (adId is missing or undefined)', (done) => {
			let file = {
				"adId": undefined
			};

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.set('Cookie', 'bt_auth="test value"')
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400, 'should return status 400');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.adId");
						expect(jsonResult.schemaErrors[0].message).toBe("is required");
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 500 (favorite call mocked 500)', (done) => {
			let file = {
				"adId": "1234567890"
			};

			specHelper.registerMockEndpoint(
				`${endpoints.favoriteAd.replace('{id}',file.adId)}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/favorites/emptyResult.json', { failStatusCode: 500 });

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.set('Cookie', 'bt_auth="test value"')
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(500, 'should return 500 on failed call');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						expect(jsonResult.error).toBe("unable to favorite ad, see logs for details");
					})
					.end(specHelper.finish(done));
			});
		});

	});

	describe('Unfavorite Ad (DELETE)', () => {

		beforeEach(() => {
			specHelper.verifyMockEndpointsClean();
		});

		afterEach(() => {
			specHelper.verifyMockEndpointsClean();
		});

		it('should respond with 200 (unfavorite)', (done) => {
			let file = {
				"adId": "1234567890"
			};

			specHelper.registerMockEndpoint(
				`${endpoints.favoriteAd.replace('{id}',file.adId)}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/favorites/emptyResult.json');

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'DELETE').then((supertest) => {
				supertest
					.set('Cookie', 'bt_auth="test value"')
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(200, 'should return status 200');
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 401 (unfavorite - bt_auth cookie missing)', (done) => {
			let file = {
				"adId": "1234567890"
			};

			specHelper.registerMockEndpoint(
				`${endpoints.favoriteAd.replace('{id}',file.adId)}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/favorites/emptyResult.json');

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'DELETE').then((supertest) => {
				supertest
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(401, 'should return status 401');
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400 (unfavorite - adId is missing or undefined)', (done) => {
			let file = {
				"adId": undefined
			};

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'DELETE').then((supertest) => {
				supertest
					.set('Cookie', 'bt_auth="test value"')
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400, 'should return status 400');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.adId");
						expect(jsonResult.schemaErrors[0].message).toBe("is required");
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 500 (unfavorite call mocked 500)', (done) => {
			let file = {
				"adId": "1234567890"
			};

			specHelper.registerMockEndpoint(
				`${endpoints.favoriteAd.replace('{id}',file.adId)}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/favorites/emptyResult.json', { failStatusCode: 500 });

			boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'DELETE').then((supertest) => {
				supertest
					.set('Cookie', 'bt_auth="test value"')
					.send(file)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(500, 'should return 500 on failed call');

						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						expect(jsonResult.error).toBe("unable to unfavorite ad, see logs for details");
					})
					.end(specHelper.finish(done));
			});
		});

	});


	/*
	 curl -X POST --data "{}" -H "Content-Type: application/json" -H "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/5376 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" "http://localhost:5000/ads/1001096096020910618300709/favorites?_forceExample=true&_statusCode=200" -v
	 */
});
