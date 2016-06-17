"use strict";
let specHelper = require('./helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');
let endpoints = require(`${process.cwd()}/server/config/mock.json`).BAPI.endpoints;

describe("Server to hit HomePage", function () {

	beforeEach(() => {
		specHelper.registerMockEndpoint(
			`${endpoints.topLocationsL2}?_forceExample=true&_statusCode=200`,
			'test/spec/mockData/api/v1/LocationList.json');
		specHelper.registerMockEndpoint(
			`${endpoints.topKeywords}?limit=15&_forceExample=true&_statusCode=200`,
			'test/spec/mockData/api/v1/keywords.json');
		specHelper.registerMockEndpoint(
			`${endpoints.trendingKeywords}?limit=15&_forceExample=true&_statusCode=200`,
			'test/spec/mockData/api/v1/keywords.json');
		specHelper.registerMockEndpoint(
			`${endpoints.homepageGallery}?_forceExample=true&_statusCode=200`,
			'test/spec/mockData/api/v1/GallerySlice.json');
		specHelper.registerMockEndpoint(
			`${endpoints.adStatistics}?_forceExample=true&_statusCode=200`,
			'test/spec/mockData/api/v1/GallerySlice.json');
	});
	
	describe("GET /", () => {

		it("returns status code 200", (done) => {
			boltSupertest('/').then((supertest) => {
				supertest
					.expect((res) => {
						expect(res.status).toBe(200);
					})
					.end(specHelper.finish(done));
			});
		});
	});

	it("returns Gumtree", function (done) {
		boltSupertest('/', 'gumtree.co.za').then((supertest) => {
			supertest
				.expect((res) => {
					let c$ = cheerio.load(res.text);
					let headerText = c$('h1')[0].firstChild;
					expect(headerText.data).toBe("Gumtree South Africa - Free local classifieds");
					expect(res.status).toBe(200);
				})
				.end(specHelper.finish(done));
		});
	});
});
