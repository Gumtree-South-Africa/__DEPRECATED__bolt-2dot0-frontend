'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Post Ad Api', () => {

	let guid = "12345678-e3cb-4fc5-a6a3-2cb2e54b93fc";

	it('should create an ad for logged in user', (done) => {
		//console.log("first test - Post Ad Api");

		let file = require('../../serverUnit/mockData/postAd/postAdRequest.json');
		let responseFile = require('../../serverUnit/mockData/postAd/postAdResponse.json');

		specHelper.registerMockEndpoint(
			`${endpoints.userFromCookie}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json');

		specHelper.registerMockEndpoint(
			`${endpoints.ads}?_forceExample=true&_statusCode=201`,
			'test/serverUnit/mockData/postAd/postAdResponse.json');
		// 'server/services/mockData/postAdResponse.json');

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth="test value"')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.state).toBe("AD_CREATED");

					let id = Number(jsonResult.ad.id);
					expect(id).toEqual(jasmine.any(Number), `ad id value should be numeric`);
					expect(jsonResult.ad.redirectLinks).toBeDefined('ad should have a vipLink');
					// the activateStatus is expected to cause a message to appear on the destination page
					expect(jsonResult.ad.redirectLinks.vip).toEqual(responseFile._links[1].href + "?activateStatus=adActivateSuccess");
					expect(jsonResult.ad.redirectLinks.vip).toContain(jsonResult.ad.id, `link should contain id ${jsonResult.ad.id}`);
				})
				.end(specHelper.finish(done));
		});
	});

/*
	out until we remove the postAdMock() call

	it('should fail because the postAd API is mocked to fail (logged in user)', (done) => {
		let file = require('../../serverUnit/mockData/postAd/postAdRequest.json');

		specHelper.registerMockEndpoint(
			`${endpoints.userFromCookie}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json');

		specHelper.registerMockEndpoint(
			`${endpoints.ads}?_forceExample=true&_statusCode=201`,
			'server/services/mockData/postAdResponse.json', { failStatusCode: 500 });

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth="test value"')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(500);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.error).toBe("postAd failed, see logs for details");
				})
				.end(specHelper.finish(done));
		});
	});
*/
/*
	out until we remove the saveDraftMock() call

	it('should fail because the saveDraft API is mocked to fail (deferred ad, not logged in)', (done) => {
		let file = require('../../serverUnit/mockData/postAd/postAdRequest.json');

		specHelper.registerMockEndpoint(
			`${endpoints.draftAd}/${guid}?_forceExample=true&_statusCode=201`,
			'test/serverUnit/mockData/postAd/PostAdDraftResponse.json', { failStatusCode: 500 });

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect((res) => {
					expect(res.status).toBe(500);
				})
				.end(specHelper.finish(done));
		});
	});
*/
	it('should defer creation of an ad because our auth cookie is not present (not logged in)', (done) => {
		let file = require('../../serverUnit/mockData/postAd/postAdRequest.json');

		specHelper.registerMockEndpoint(
			`${endpoints.draftAd}/${guid}?_forceExample=true&_statusCode=201`,
			'test/serverUnit/mockData/postAd/PostAdDraftResponse.json');

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('cookie', `machguid=${guid}`)
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));

					expect(jsonResult.state).toBe("AD_DEFERRED");

					expect(jsonResult.defferedLink).toBeDefined('deferred ad should have link');

				})
				.end(specHelper.finish(done));
		});
	});

	it('should defer creation of an ad because auth cookie is not valid (user call mocked 404)', (done) => {
		let file = require('../../serverUnit/mockData/postAd/postAdRequest.json');

		specHelper.registerMockEndpoint(
			`${endpoints.userFromCookie}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json', { failStatusCode: 404 });

		specHelper.registerMockEndpoint(
			`${endpoints.draftAd}/${guid}?_forceExample=true&_statusCode=201`,
			'test/serverUnit/mockData/postAd/PostAdDraftResponse.json');

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', `bt_auth="test value; machguid=${guid}`)
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));

					expect(jsonResult.state).toBe("AD_DEFERRED");

					expect(jsonResult.defferedLink).toBeDefined('deferred ad should have link');
				})
				.end(specHelper.finish(done));
		});
	});

	it('should fail because attempting to validate auth cookie failed (user call mocked 500)', (done) => {
		let file = require('../../serverUnit/mockData/postAd/postAdRequest.json');

		specHelper.registerMockEndpoint(
			`${endpoints.userFromCookie}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json', { failStatusCode: 500 });

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'bt_auth="test value"')
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(500);

					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));

					expect(jsonResult.error).toBe("unable to validate user, see logs for details");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 406 because we did not send json', (done) => {
		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(null)
				.expect((res) => {
					expect(res.status).toBe(406);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, result should contain json schema error: "ads" required', (done) => {
		let file = {};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads");
					expect(jsonResult.schemaErrors[0].message).toBe("is required");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, result should contain json schema error: "ads" too few items', (done) => {
		let file = {
			"ads": []
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads");
					expect(jsonResult.schemaErrors[0].message).toBe("has less items than allowed");
				})
				.end(specHelper.finish(done));
		});
	});

	// Note: once we support multiple ads we can get rid of this test
	it('should respond with 400, result should contain json schema error: "ads" too many items', (done) => {
		let file = {
			"ads": [
				{
					imageUrls: ["image"]
				},
				{
					imageUrls: ["image"]
				}
			]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads");
					expect(jsonResult.schemaErrors[0].message).toBe("has more items than allowed");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, result should contain json schema error: invalid latitude', (done) => {
		let file = {
			"ads": [{
				"location": {
					"latitude": "invalid format",
					"longitude": 19.999
				},
				imageUrls: ["image"]
			}]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);
					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads.0.location.latitude");
					expect(jsonResult.schemaErrors[0].message).toBe("is the wrong type");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, an empty ad, result should contains json schema: imageUrls required', (done) => {
		let file = {
			"ads": [{
			}]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);
					//console.log(JSON.stringify(jsonResult, null, 4));

					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads.0.imageUrls");
					expect(jsonResult.schemaErrors[0].message).toBe("is required");

				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, an empty ad, result should contains json schema: imageUrls has less items than allowed', (done) => {
		let file = {
			"ads": [{
				imageUrls: []
			}]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));

					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads.0.imageUrls");
					expect(jsonResult.schemaErrors[0].message).toBe("has less items than allowed");

				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, result should contains json schema error: title too long', (done) => {
		let file = {
			"ads": [{
				imageUrls: ["image"],
				"title": "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901"
			}]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);
					//console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads.0.title");
					expect(jsonResult.schemaErrors[0].message).toBe("has longer length than allowed");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, result should contain json schema error: price fields missing', (done) => {
		let file = {
			"ads": [{
				imageUrls: ["image"],
				"price": {
				},

			}]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);
					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads.0.price.priceType");
					expect(jsonResult.schemaErrors[0].message).toBe("is required");
				})
				.end(specHelper.finish(done));
		});
	});


	it('should respond with 400, result should contain json schema error: invalid price amount', (done) => {
		let file = {
			"ads": [{
				imageUrls: ["image"],
				"price": {
					"priceType": "FIXED",
					"currency": "MXN",
					"amount": "123.00"
				}
			}]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);
					let jsonResult = JSON.parse(res.text);
					// console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads.0.price.amount");
					expect(jsonResult.schemaErrors[0].message).toBe("is the wrong type");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should respond with 400, result should contain json schema error: invalid price currency', (done) => {
		let file = {
			"ads": [{
				imageUrls: ["image"],
				"price": {
					"priceType": "FIXED",
					"currency": "foo",
					"amount": 123.00
				}
			}]
		};

		boltSupertest('/api/postad/create', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);
					let jsonResult = JSON.parse(res.text);
					//console.log(JSON.stringify(jsonResult, null, 4));
					expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

					expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
					expect(jsonResult.schemaErrors[0].field).toBe("data.ads.0.price.currency");
					expect(jsonResult.schemaErrors[0].message).toBe("must be an enum value");
				})
				.end(specHelper.finish(done));
		});
	});

	/*
	deferred ad (no auth cookie)
	 curl -X POST --data @test/serverUnit/mockData/postAd/postAdRequest.json -H "Content-Type: application/json" -H "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" http://www.vivanuncios.com.mx.localhost:8000/api/postad/create -v
	post ad (auth cookie)
	  curl -X POST --data @test/serverUnit/mockData/postAd/postAdRequest.json -H "Cookie: bt_auth=dummy" -H "Content-Type: application/json" -H "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" http://www.vivanuncios.com.mx.localhost:8000/api/postad/create -v

	 */


});
