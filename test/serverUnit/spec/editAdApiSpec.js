'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;
let cwd = process.cwd();

describe('Edit Ad Api', () => {

	afterEach(() => {
		specHelper.verifyMockEndpointsClean();
	});

	it('should edit an ad for a logged in, valid user', (done) => {
		let file = require(cwd + '/test/serverUnit/mockData/editAd/EditAdRequest.json');
		specHelper.registerMockEndpoint(endpoints.userFromCookie,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json');

		specHelper.registerMockEndpoint(endpoints.specificAd.replace('{id}', '1001000002000910000000009'),
			'test/serverUnit/mockData/api/v1/EditAdResponse.json');

		boltSupertest('/api/edit/update', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth="TEST"')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);
					expect(jsonResult.adId).toBe("1001000002000910000000009");
					expect(jsonResult._links.find((link) => {
						return link.rel === 'seoVipUrl';
					}).href).toBe('/a-elektronarzedzia/buk/ad-posted-by-shuochen-ebay-com/1001000002000910000000009');
				})
				.end(specHelper.finish(done));
		});
	});

	it('should throw an error for user without cookie', (done) => {
		let file = require(cwd + '/test/serverUnit/mockData/editAd/EditAdRequest.json');
		boltSupertest('/api/edit/update', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(500);

					let jsonResult = JSON.parse(res.text);
					expect(jsonResult.error).toBe("Edit ad failed, user not logged in");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should throw an error for invalid user', (done) => {
		let file = require(cwd + '/test/serverUnit/mockData/editAd/EditAdRequest.json');

		specHelper.registerMockEndpoint(endpoints.userFromCookie,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json',
			{
				failStatusCode: 404
			});

		boltSupertest('/api/edit/update', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth="WILL FAIL"')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(404);

					let jsonResult = JSON.parse(res.text);
					expect(jsonResult.error).toBe("error updating ad, see logs for details");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should throw an error if user does not own this ad', (done) => {
		let file = require(cwd + '/test/serverUnit/mockData/editAd/EditAdRequest.json');

		specHelper.registerMockEndpoint(endpoints.userFromCookie,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json',
			{
				failStatusCode: 401
			});

		boltSupertest('/api/edit/update', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth="WILL FAIL"')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(401);

					let jsonResult = JSON.parse(res.text);
					expect(jsonResult.error).toBe("error updating ad, see logs for details");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should throw a 406 if we are sending something other than json', (done) => {
		boltSupertest('/api/edit/update', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth=nonce')
				.send("Hello")
				.expect((res) => {
					expect(res.status).toBe(406);
					expect(res.text).toBe('');
				})
				.end(specHelper.finish(done));
		});
	});

	it('should throw a schema error for missing id', (done) => {
		let file = require(cwd + '/test/serverUnit/mockData/editAd/EditAdRequest.json');
		delete file.adId;

		boltSupertest('/api/edit/update', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth=asdf')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);
					expect(jsonResult.schemaErrors[0].field).toBe('data.adId');
					expect(jsonResult.schemaErrors[0].message).toBe('is required');
				})
				.end(specHelper.finish(done));
		});
	});

});
