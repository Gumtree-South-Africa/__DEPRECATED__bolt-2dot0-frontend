'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;
let cheerio = require('cheerio');

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

		boltSupertest('/edit/12', 'vivanuncios.com.mx').then((supertest) => {
			supertest
				.expect((res) => {
					expect(res.status).toBe(302);
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

		boltSupertest('/edit/12', 'vivanuncios.com.mx').then((supertest) => {
			supertest.set('Cookie', 'bt_auth=Bear XXX')
				.expect((res) => {
					expect(res.status).toBe(404);
				})
				.end(specHelper.finish(done));
		});
	});

	it('should populate the fields with correct data from BAPI', (done) => {
		specHelper.registerMockEndpoint(
			endpoints.specificAd.replace('{id}', '12'),
			'test/serverUnit/mockData/api/v1/GetAdResponse.json');
		specHelper.registerMockEndpoint(
			endpoints.categoryAttributes.replace('{catId}', '9000'),
			'test/serverUnit/mockData/api/v1/GetAttributeDefinitionsResponse.json'
		);
		let mockData = require('../mockData/api/v1/GetAdResponse.json');

		boltSupertest('/edit/12', 'vivanuncios.com.mx').then((supertest) => {
			supertest.set('Cookie', 'bt_auth=Bear XXX')
				.expect((res) => {
					expect(res.status).toBe(200);

					let c$ = cheerio.load(res.text);
					expect(c$(`input[title='Title']`).val()).toBe(mockData.title);
					expect(c$(`#description-input`).text()).toBe(mockData.description);
					expect(c$(`input[title='amount']`).val()).toBe(`${mockData.price.amount}`);
					expect(c$(`input[value='USD']`).is(':checked')).toBeTruthy();

					expect(c$(`input[name='AlmVehicleBrand']`).val()).toBe(mockData.attributes[0].value.attributeValue);
					expect(c$(`input[name='AlmVehicleModel']`).val()).toBe(mockData.attributes[2].value.attributeValue);

					let imageJson = JSON.parse(c$('#image-urls').text()).sizeUrls;
					expect(imageJson.length).toBe(2);
					// mimicking the replace for fixing self signed ssl cert issue on ebayimg.sandbox.ebay domain
					expect(imageJson[0].LARGE).toBe(mockData.pictures.sizeUrls[0].LARGE.replace( "ebayimg.sandbox.ebay", "sandbox.ebayimg"));
					expect(imageJson[1].SMALL).toBe(mockData.pictures.sizeUrls[1].SMALL.replace("ebayimg.sandbox.ebay", "sandbox.ebayimg"));
				})
				.end(specHelper.finish(done));
		});
	});

});
