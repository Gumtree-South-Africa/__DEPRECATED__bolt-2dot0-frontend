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
});
