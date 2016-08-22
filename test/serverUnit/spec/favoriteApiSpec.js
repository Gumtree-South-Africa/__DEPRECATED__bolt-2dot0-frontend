'use strict';

let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;

describe('Favorite Ad Api', () => {
	beforeEach(() => {
		specHelper.verifyMockEndpointsClean();
	});

	afterEach(() => {
		specHelper.verifyMockEndpointsClean();
	});

	it('should respond with 400 if adId is missing or undefined', (done) => {
		let file = {
			"adId": undefined
		};

		boltSupertest('/api/ads/favorite', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.send(file)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400, 'Missing/undefined adId should give 400');
				})
				.end(specHelper.finish(done));
		});
	});


	/*
	 curl -X POST --data "{}" -H "Content-Type: application/json" -H "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/5376 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" "http://localhost:5000/ads/1001096096020910618300709/favorites?_forceExample=true&_statusCode=200" -v
	 */
});
