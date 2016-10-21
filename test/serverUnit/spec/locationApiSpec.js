'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe('Location Api', () => {

	let lat = "19.12345";
	let lng = "-99.6789";
	let geoCookie = `${lat}ng${lng}`;

	it('should return a location for a lat long (from cookie)', (done) => {

		let responseFile = require('../../serverUnit/mockData/geo/geoLocation.json');

		specHelper.registerMockEndpoint(
			`${endpoints.locationHomePage}/${lat}/${lng}?isLeaf=false&_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/geo/geoLocation.json');

		boltSupertest('/api/locate/locationlatlong', 'vivanuncios.com.mx', 'GET').then((supertest) => {
			supertest
				.set('Cookie', `geoId=${geoCookie}`)
				.send()
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.localizedName).toBe(responseFile.localizedName);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should return a location for a lat long (using query parameters)', (done) => {

		let responseFile = require('../../serverUnit/mockData/geo/geoLocation.json');

		specHelper.registerMockEndpoint(
			`${endpoints.locationHomePage}/${lat}/${lng}?isLeaf=false&_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/geo/geoLocation.json');

		boltSupertest('/api/locate/locationlatlong', 'vivanuncios.com.mx', 'GET').then((supertest) => {
			supertest
				.query(`lat=${lat}&lng=${lng}`)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(200);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.localizedName).toBe(responseFile.localizedName);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should fail location (no parameters passed)', (done) => {

		boltSupertest('/api/locate/locationlatlong', 'vivanuncios.com.mx', 'GET').then((supertest) => {
			supertest
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.error).toBe("query params or cookie required");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should fail location (query parameters not numeric)', (done) => {

		boltSupertest('/api/locate/locationlatlong', 'vivanuncios.com.mx', 'GET').then((supertest) => {
			supertest
				.query(`lat=bad&lng=robot`)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.error).toBe("query params could not be parsed into numbers");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should fail location (cookie not formatted numeric)', (done) => {

		boltSupertest('/api/locate/locationlatlong', 'vivanuncios.com.mx', 'GET').then((supertest) => {
			supertest
				.set('Cookie', `geoId=badngRobot`)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.error).toBe("query params or cookie required");
				})
				.end(specHelper.finish(done));
		});
	});

	it('should fail location (cookie not splitting properly)', (done) => {

		boltSupertest('/api/locate/locationlatlong', 'vivanuncios.com.mx', 'GET').then((supertest) => {
			supertest
				.set('Cookie', `geoId=bad-Robot`)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect((res) => {
					expect(res.status).toBe(400);

					let jsonResult = JSON.parse(res.text);

					expect(jsonResult.error).toBe("query params or cookie required");
				})
				.end(specHelper.finish(done));
		});
	});

});
