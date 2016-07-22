'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');

describe('Locations', () => {
	it('should show locations', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					expect(c$('.locations-wrapper').length).toBe(1, 'selector should produce 1 element for top locations');
					expect(res.status).toBe(200);
				})
				.end(specHelper.finish(done));
		});
	});
});
