'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;

describe('Search Page', () => {
	it('should return status code 200 search', (done) => {
		boltSupertest('/search', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);
				})
				.end(specHelper.finish(done));
		});
	});
});
