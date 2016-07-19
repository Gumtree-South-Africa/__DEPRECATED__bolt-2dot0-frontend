'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');

describe('Footer', () => {
	it('should show footer', (done) => {
		boltSupertest('/', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					expect(c$('.searches-wrapper')).toBeDefined();
					expect(res.status).toBe(200);
				})
				.end(specHelper.finish(done));
		});
	});
});
