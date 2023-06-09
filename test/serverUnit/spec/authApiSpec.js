'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;
let loginRequest = require('../../serverUnit/mockData/auth/loginRequest.json');
let facebookLoginRequest = require('../../serverUnit/mockData/auth/loginWithFacebookRequest.json');
let registerRequest = require('../../serverUnit/mockData/auth/registerRequest.json');
let loginResponse = require('../../serverUnit/mockData/auth/loginResponse.json');
// let registerResponse = require('../../serverUnit/mockData/auth/registerResponse.json');


describe('Authentication Api', () => {

	// todo: move this into spec helper
	let getCookie = (headers, cookieName) => {
		let cookies = headers;
		let foundCookie;
		let parts;
		for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i];
			parts = cookie.split(/;|=/);
			if (parts.length > 0 && parts[0] === cookieName) {
				foundCookie = cookie;
				break;
			}
		}
		if (foundCookie) {
			return {
				name: parts[0],
				value: parts[1],
				raw: foundCookie
			};
		}
		return null;
	};

	describe('login', () => {

		it('should login the user', (done) => {

			specHelper.registerMockEndpoint(
				`${endpoints.authBoltLogin}?_forceExample=true&_statusCode=200`,
				'test/serverUnit/mockData/auth/loginResponse.json');

			boltSupertest('/api/auth/login', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send(loginRequest)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(200);
						// let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));

						// no json data, but the cookie coming back from this call, unless there is an error
						// cookie should be set (but it will be a http only cookie, we shouldn't see it this way)
						let cookie = getCookie(res.headers["set-cookie"], "bt_auth");
						expect(cookie).toBeTruthy('should have bt_auth cookie set');
						if (cookie) {
							expect(cookie.value).toBe(loginResponse.accessToken, 'should have cookie value match the accessToken of the login response');
							expect(cookie.raw.indexOf("HttpOnly") !== -1).toBeTruthy('should have cookie with HttpOnly on bt_auth');
						}
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400, result should contain json schema error: required fields missing ', (done) => {

			boltSupertest('/api/auth/login', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({})
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400);
						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(2, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.emailAddress");
						expect(jsonResult.schemaErrors[0].message).toBe("is required");
						expect(jsonResult.schemaErrors[1].field).toBe("data.password");
						expect(jsonResult.schemaErrors[1].message).toBe("is required");

					})
					.end(specHelper.finish(done));
			});
		});

		// bad test hangs with regex on server in validate schema
		it('should respond with 400, result should contain json schema errors: longer than allowed ', (done) => {

			boltSupertest('/api/auth/login', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						emailAddress: "1234567890123456789012345678901234567890123456789012345678901234567890",
						password: "123456789012345678901234567890"
					})
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400);
						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(3, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.emailAddress");
						expect(jsonResult.schemaErrors[0].message).toBe("pattern mismatch");
						expect(jsonResult.schemaErrors[1].field).toBe("data.emailAddress");
						expect(jsonResult.schemaErrors[1].message).toBe("has longer length than allowed");
						expect(jsonResult.schemaErrors[2].field).toBe("data.password");
						expect(jsonResult.schemaErrors[2].message).toBe("has longer length than allowed");
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400, result should contain json schema errors: shorter than allowed ', (done) => {

			boltSupertest('/api/auth/login', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						emailAddress: "good@domain.com",
						password: "12345"
					})
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400);
						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.password");
						expect(jsonResult.schemaErrors[0].message).toBe("has less length than allowed");

					})
					.end(specHelper.finish(done));
			});
		});


		it('should fail the schema regex for certain strings that are not valid emails, and visa versa', () => {

			// these two schemas are very similar, and they have the same regex, so we verify they are staying in sync.
			let loginSchema = require('../../../app/appWeb/jsonSchemas/loginRequest-schema.json');
			let registerSchema = require('../../../app/appWeb/jsonSchemas/registerRequest-schema.json');

			let loginPattern = loginSchema.properties.emailAddress.pattern;
			expect(loginPattern).toBeTruthy('should have a string pattern in schema');

			let registerPattern = registerSchema.properties.emailAddress.pattern;
			expect(registerPattern).toBeTruthy('should have a string pattern in schema');

			expect(loginPattern).toBe(registerPattern, 'should have matching email patterns between the two schemas');

			// now lets run the pattern thru a few obvious cases...
			let regex = new RegExp(loginPattern);

			let badEmails = [
				"1234567890123456789012345678901234567890123456789012345678901234567890",
				"",
				" ",
				"@",
				"x@y",
				".x@y",
				"x@y.",
				"x@_",
				"x@..com",
				"'",
				"'test@x.com'",
				'"test@x.com"'
			];

			for (let i = 0; i < badEmails.length; i++) {
				let candidate = badEmails[i];
				let matches = candidate.match(regex);

				expect(matches).toBeFalsy(`should not find a match in ${candidate}`);
			}

			let goodEmails = [
				"test@x.y.com",
				"test.test@x.com",
				"test_test@x.com",
				"test-test@x.com",
				"test@x-y.com",
				"test@x_y.com"
			];

			for (let i = 0; i < goodEmails.length; i++) {
				let candidate = goodEmails[i];
				let matches = candidate.match(regex);

				expect(matches).toBeTruthy(`should find a match in ${candidate}`);
			}
		});

		it('should respond with 400, result should contain json schema errors: email pattern error (x@y)', (done) => {

			boltSupertest('/api/auth/login', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						emailAddress: "x@y",
						password: "123456"
					})
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400);
						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.emailAddress");
						expect(jsonResult.schemaErrors[0].message).toBe("pattern mismatch");
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400, result should contain json schema errors: email pattern error (empty) ', (done) => {

			boltSupertest('/api/auth/login', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						emailAddress: "",
						password: "123456"
					})
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400);
						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.emailAddress");
						expect(jsonResult.schemaErrors[0].message).toBe("pattern mismatch");
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400, result should contain json schema errors: email pattern error (@) ', (done) => {

			boltSupertest('/api/auth/login', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						emailAddress: "@",
						password: "123456"
					})
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400);
						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(1, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.emailAddress");
						expect(jsonResult.schemaErrors[0].message).toBe("pattern mismatch");
					})
					.end(specHelper.finish(done));
			});
		});

	});

	describe('facebook login', () => {
		let apiEndpoint = '/api/auth/loginWithFacebook';
		it('should log in the user', (done) => {

			specHelper.registerMockEndpoint(
				endpoints.authFbLogin,
				'test/serverUnit/mockData/auth/loginResponse.json');

			boltSupertest(apiEndpoint, 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send(facebookLoginRequest)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(200);

						let cookie = getCookie(res.headers["set-cookie"], "bt_auth");
						expect(cookie).toBeTruthy('should have bt_auth cookie set');
						if (cookie) {
							expect(cookie.value).toBe(loginResponse.accessToken, 'should have cookie value match the accessToken of the login response');
							expect(cookie.raw.indexOf("HttpOnly") !== -1).toBeTruthy('should have cookie with HttpOnly on bt_auth');
						}
					})
					.end(specHelper.finish(done));
			});
		});

		it('should throw an error if they are missing the agreeTerms field and email', (done) => {

			// specHelper.registerMockEndpoint(
			// 	endpoints.authFbLogin,
			// 	'test/serverUnit/mockData/auth/loginResponse.json');
			boltSupertest(apiEndpoint, 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						email: "asdf",
						facebookId: "fake",
						facebookToken: "guid",
						optInMarketing: true
					})
					.expect((res) => {
						expect(res.status).toBe(400);
						let responseJson = JSON.parse(res.text);
						expect(responseJson.schemaErrors.length).toBe(3);
						expect(responseJson.schemaErrors[0].field).toBe('data.email');
						expect(responseJson.schemaErrors[0].message).toBe('pattern mismatch');
						expect(responseJson.schemaErrors[1].field).toBe('data.email');
						expect(responseJson.schemaErrors[1].message).toBe('has less length than allowed');
						expect(responseJson.schemaErrors[2].field).toBe('data.agreeTerms');
						expect(responseJson.schemaErrors[2].message).toBe('is required');
					})
					.end(specHelper.finish(done));
			});
		});

		it('should throw an error if they are missing the facebook id and token', (done) => {

			// specHelper.registerMockEndpoint(
			// 	endpoints.authFbLogin,
			// 	'test/serverUnit/mockData/auth/loginResponse.json');
			boltSupertest(apiEndpoint, 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						email: "asdf@asdf.com",
						agreeTerms: true,
						optInMarketing: true
					})
					.expect((res) => {
						expect(res.status).toBe(400);
						let responseJson = JSON.parse(res.text);
						expect(responseJson.schemaErrors.length).toBe(2);
						expect(responseJson.schemaErrors[0].field).toBe('data.facebookId');
						expect(responseJson.schemaErrors[0].message).toBe('is required');
						expect(responseJson.schemaErrors[1].field).toBe('data.facebookToken');
						expect(responseJson.schemaErrors[1].message).toBe('is required');
					})
					.end(specHelper.finish(done));
			});
		});

		it('should throw an error if agreeTerms field is set to false', (done) => {

			// specHelper.registerMockEndpoint(
			// 	endpoints.authFbLogin,
			// 	'test/serverUnit/mockData/auth/loginResponse.json');

			boltSupertest(apiEndpoint, 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({
						email: "asdf@asdf.com",
						facebookId: "fake",
						facebookToken: "guid",
						agreeTerms: false,
						optInMarketing: true
					})
					.expect((res) => {
						expect(res.status).toBe(400);
						let responseJson = JSON.parse(res.text);
						expect(responseJson.schemaErrors[0].field).toBe("data.agreeTerms");
						expect(responseJson.schemaErrors[0].message).toBe("must be an enum value");
					})
					.end(specHelper.finish(done));
			});
		});
	});

	describe('register', () => {

		it('should register the user', (done) => {

			specHelper.registerMockEndpoint(
				`${endpoints.authRegister}?_forceExample=true&_statusCode=201`,
				'test/serverUnit/mockData/auth/registerResponse.json');


			boltSupertest('/api/auth/register', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send(registerRequest)
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(200);
						// let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
					})
					.end(specHelper.finish(done));
			});
		});

		it('should respond with 400, result should contain json schema error: required fields missing ', (done) => {

			boltSupertest('/api/auth/register', 'vivanuncios.com.mx', 'POST').then((supertest) => {
				supertest
					.send({})
					.expect('Content-Type', 'application/json; charset=utf-8')
					.expect((res) => {
						expect(res.status).toBe(400);
						let jsonResult = JSON.parse(res.text);
						// console.log(JSON.stringify(jsonResult, null, 4));
						expect(jsonResult.schemaErrors instanceof Array).toBeTruthy('there should be schema errors');

						expect(jsonResult.schemaErrors.length).toBe(5, 'there should be schema errors');
						expect(jsonResult.schemaErrors[0].field).toBe("data.emailAddress");
						expect(jsonResult.schemaErrors[0].message).toBe("is required");
						expect(jsonResult.schemaErrors[1].field).toBe("data.password");
						expect(jsonResult.schemaErrors[1].message).toBe("is required");
						expect(jsonResult.schemaErrors[2].field).toBe("data.password2");
						expect(jsonResult.schemaErrors[2].message).toBe("is required");
						expect(jsonResult.schemaErrors[3].field).toBe("data.agreeTerms");
						expect(jsonResult.schemaErrors[3].message).toBe("is required");
						expect(jsonResult.schemaErrors[4].field).toBe("data.optInMarketing");
						expect(jsonResult.schemaErrors[4].message).toBe("is required");

					})
					.end(specHelper.finish(done));
			});
		});
	});
});
