'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;
// let cheerio = require('cheerio');

describe('Edit Ad Page', () => {
	// let i18n;
	//
	// beforeAll(() => {
	// 	i18n = specHelper.getMockDataByLocale("/app/locales/bolt-translation", "", "es_MX");
	// });

	beforeEach(() => {
		specHelper.registerMockEndpoint(
			`${endpoints.userFromCookie}?_forceExample=true&_statusCode=200`,
			'test/serverUnit/mockData/api/v1/UserHeaderInfo.json');
	});

	it('should show edit page for existing ad', (done) => {
		specHelper.registerMockEndpoint(
			endpoints.specificAd.replace('{id}', '12'),
			'test/serverUnit/mockData/api/v1/GetAdResponse.json');
		specHelper.registerMockEndpoint(
			endpoints.categoryAttributes.replace('{catId}', '9000'),
			'test/serverUnit/mockData/api/v1/GetAttributeDefinitionsResponse.json'
		);

		boltSupertest('/edit/12').then((supertest) => {
			supertest
				.expect((res) => {
					expect(res.status).toBe(200);
					// let c$ = cheerio.load(res.text);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should throw 404 for page that does not exist', (done) => {
		specHelper.registerMockEndpoint(
			endpoints.specificAd.replace('{id}', '12'),
			'test/serverUnit/mockData/api/v1/Error404.json',
			{
				failStatusCode: 404
			}
		);

		boltSupertest('/edit/12').then((supertest) => {
			supertest
				.expect((res) => {
					expect(res.status).toBe(404);
				})
				.end(specHelper.finish(done));
		});
	});

});
