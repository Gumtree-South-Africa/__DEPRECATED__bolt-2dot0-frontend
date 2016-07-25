'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;

describe('Search', () => {
	it('should return correct format for type ahead search endpoint', (done) => {
		// mock when hooked up to bapi
		// specHelper.registerMockEndpoint(
		// 	`type-ahead-bapi-endpoint?_forceExample=true&_statusCode=200`,
		// 	'test/serverUnit/mockData/api/v1/LocationList.json');

		boltSupertest('/api/search/autocomplete', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					// expect a list of auto complete content
					expect(res.body.autoCompletContentList instanceof Array).toBeTruthy();

				})
				.end(specHelper.finish(done));
		});
	});
});
