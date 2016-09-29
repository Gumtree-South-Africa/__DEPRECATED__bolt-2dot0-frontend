'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let authService = require(`${process.cwd()}/server/services/authService`);
let Q = require('q');

describe('Login Page', () => {

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
				return (req, res, next) => {};
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
				return (req, res, next) => {};
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
				return (req, res, next) => {};
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
	});
});
