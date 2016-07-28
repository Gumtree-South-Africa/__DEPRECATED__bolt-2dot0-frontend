'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

fdescribe('Post Ad Api', () => {

	beforeEach(() => {

		specHelper.registerMockEndpoint(
			`${endpoints.quickpostAd}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/postAd/postAdResponse.json');
	});

	it('should create an ad for logged in user', (done) => {
		let file = specHelper.getMockData("postAd", "postAdRequest");

		boltSupertest('/post/api/postad/create', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth="test value to simulate logged in"')
				.set('ContentType', 'application/json')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.state).toBe("AD_CREATED");

					let id = Number(jsonResult.ad.id);
					expect(id).toEqual(jasmine.any(Number), `ad id value should be numeric`);

					expect(jsonResult.ad.vipLink).toBeDefined('ad should have a vipLink');
					expect(jsonResult.ad.vipLink).toEqual('/a-house-shares-flat-shares-offered/groblersdal/post-house-ad-from-bapi-at-2016+07+01-17-44-50-307/1001099833810910650990709');

					expect(jsonResult.ad.vipLink).toContain(jsonResult.ad.id, `link should contain id ${jsonResult.ad.id}`);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should defer creation of an ad because we are not logged in', (done) => {
		let file = specHelper.getMockData("postAd", "postAdRequest");

		boltSupertest('/post/api/postad/create', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('ContentType', 'application/json')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.state).toBe("AD_DEFERRED");

					expect(jsonResult.guid).toBeDefined('deferred ad should have a guid');
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 406 because we did not send json', (done) => {
		boltSupertest('/post/api/postad/create', 'vivanuncios.com.mx').then((supertest) => {
			supertest
			// .set('Cookie', 'b2dot0Version=2.0')
				.send("sending this but it is not json")
				.expect((res) => {
					expect(res.status).toBe(406);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, result should contains json schema errors', (done) => {
		let file = specHelper.getMockData("postAd", "postAdRequest-invalid-2");

		boltSupertest('/post/api/postad/create', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				// .set('Cookie', 'b2dot0Version=2.0')
				.set('ContentType', 'application/json')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);
					//console.log(JSON.stringify(JSON.parse(res.text), null, 4));
					// let c$ = cheerio.load(res.text);
					// expect(c$('.headerV2').length).toBe(1, 'selector should produce 1 element for header');
				})
				.end(specHelper.finish(done));
		});
	});

/*
 curl --data @test/serverUnit/mockData/postAd/postAdRequest-invalid-1.json -H "Content-Type: application/json" -X GET http://www.vivanuncios.com.mx.localhost:8000/post/api/postad/create
*/

});
