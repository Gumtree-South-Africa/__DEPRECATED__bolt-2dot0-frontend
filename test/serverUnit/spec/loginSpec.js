'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let authService = require(`${process.cwd()}/server/services/authService`);
let cheerio = require('cheerio');
let Q = require('q');

describe('Login Page', () => {

	it('should render a form with login and redirect url', (done) => {

		boltSupertest(`/login/`, 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.query("redirect=foo")
				.expect((res) => {
					expect(res.statusCode).toBe(200);

					let c$ = cheerio.load(res.text);
					let loginContainer = c$('.login-container');
					expect(loginContainer.length).toBe(1, 'should have a login container');

					expect(c$('.save-terms-btn', loginContainer).length).toBe(0, 'should NOT have save terms button');
					expect(c$('.facebook-button', loginContainer).length).toBe(1, 'should have a faccebook button');
					expect(c$('.submit-btn', loginContainer).length).toBe(1, 'should have submit button');

					let redirectUrl = c$('#redirect-url', loginContainer);
					expect(redirectUrl.length).toBe(1, 'should have an element for redirect url');
					expect(redirectUrl.hasClass('hidden')).toBeTruthy('should have redirect url hidden');
					expect(redirectUrl.text()).toBe("foo", 'should have a redirect url value');

				}).end(specHelper.finish(done));
		});
	});

	it('should render a form with only terms and conditions checkboxes', (done) => {

		boltSupertest(`/login/`, 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.query("showterms=true")
				.expect((res) => {
					expect(res.statusCode).toBe(200);

					let c$ = cheerio.load(res.text);
					let loginContainer = c$('.login-container');
					expect(loginContainer.length).toBe(1, 'should have a login container');

					expect(c$('.terms-and-conditions', loginContainer).length).toBe(1, 'should have a terms and conditions element');
					expect(c$('.save-terms-btn', loginContainer).length).toBe(1, 'should have save terms button');

				}).end(specHelper.finish(done));
		});
	});

	describe('Facebook Login', () => {
		it('should redirect to passed url if email exists in BAPI', (done) => {
			let passport = require('passport');
			let code = 'asdf';
			let redirect = '/post';
			spyOn(passport, 'authenticate').and.callFake((type, options, callback) => {
				callback(null, {
					id: 123456,
					facebookToken: code,
					email: 'test@test.com'
				});
				//Function to be returned for the controller to execute, do nothing, just suppress error.
				return () => {};
			});
			spyOn(authService, 'checkEmailExists').and.callFake(() => {
				return Q({});
			});

			boltSupertest(`/login/facebook/callback?redirect=${redirect}&code=${code}`, 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						expect(res.statusCode).toBe(302);
						expect(res.text).toBe(`Found. Redirecting to ${redirect}`);
					}).end(specHelper.finish(done));
			});
		});

		//These tests are not working because the authmodel calls mock which always returns success.
		/*
		it('should bring user to login page if the email does not exist', (done) => {
			let passport = require('passport');
			let code = 'asdf';
			let redirect = '/post';
			let id = 123456;
			let email = 'test@test.com';
			spyOn(passport, 'authenticate').and.callFake((type, options, callback) => {
				callback(null, {
					id: id,
					facebookToken: code,
					email: email
				});
				//Function to be returned for the controller to execute, do nothing, just suppress error.
				return () => {};
			});
			spyOn(authService, 'checkEmailExists').and.callFake(() => {
				return Q.reject({
					statusCode: 404
				});
			});

			boltSupertest(`/login/facebook/callback?redirect=${redirect}&code=${code}`, 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						let redirectUrl = `/login?showTerms=true&facebookToken=${code}&facebookId=${id}&email=${email}&redirect=${redirect}`;
						expect(res.statusCode).toBe(302);
						expect(res.text).toBe(`Found. Redirecting to ${redirectUrl}`);
					}).end(specHelper.finish(done));
			});
		});

		it("should show error page for anything other than a 404 for checkEmailExists call", (done) => {
			let passport = require('passport');
			let code = 'asdf';
			let redirect = '/post';
			let id = 123456;
			let email = 'test@test.com';
			spyOn(passport, 'authenticate').and.callFake((type, options, callback) => {
				callback(null, {
					id: id,
					facebookToken: code,
					email: email
				});
				//Function to be returned for the controller to execute, do nothing, just suppress error.
				return () => {};
			});
			spyOn(authService, 'checkEmailExists').and.callFake(() => {
				return Q.reject({
					message: 'Fake 500 from bapi',
					statusCode: 500
				});
			});

			boltSupertest(`/login/facebook/callback?redirect=${redirect}&code=${code}`, 'vivanuncios.com.mx').then((supertest) => {
				supertest
					.set('Cookie', 'b2dot0Version=2.0')
					.expect((res) => {
						expect(res.statusCode).toBe(500);
					}).end(specHelper.finish(done));
			});
		});
		*/
	});
});
