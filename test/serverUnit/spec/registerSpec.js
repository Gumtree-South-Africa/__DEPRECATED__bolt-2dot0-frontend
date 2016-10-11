'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');

describe('Register Page', () => {

	it('should render a form with register and redirect url', (done) => {

		boltSupertest(`/register/`, 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.query("redirect=foo")
				.expect((res) => {
					expect(res.statusCode).toBe(200);

					let c$ = cheerio.load(res.text);
					let regContainer = c$('.registration-form-container');
					expect(regContainer.length).toBe(1, 'should have a registration container');

					expect(c$('.registration-submit-button', regContainer).length).toBe(1, 'should have submit button');
					expect(c$('.terms-and-conditions', regContainer).length).toBe(1, 'should have terms and conditions');
					expect(c$('.save-terms-btn', regContainer).length).toBe(0, 'should NOT have save terms button');

					let redirectUrl = c$('#redirect-url', regContainer);
					expect(redirectUrl.length).toBe(1, 'should have an element for redirect url');
					expect(redirectUrl.attr('type')).toBe('hidden', 'should have redirect url hidden');
					expect(redirectUrl.val()).toBe("foo", 'should have a redirect url value');

				}).end(specHelper.finish(done));
		});
	});

});
