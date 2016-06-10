"use strict";
let specHelper = require('./helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cheerio = require('cheerio');

describe("Server to hit HomePage", function () {

	beforeEach(() => {
		specHelper.registerMockEndpoint(
			'/locations/top/L2?_forceExample=true&_statusCode=200',
			'test/spec/mockData/api/v1/LocationList.json');
		specHelper.registerMockEndpoint(
			'/keywords/top?limit=15&_forceExample=true&_statusCode=200',
			'test/spec/mockData/api/v1/keywords.json');
		specHelper.registerMockEndpoint(
			'/keywords/trending?limit=15&_forceExample=true&_statusCode=200',
			'test/spec/mockData/api/v1/keywords.json');
		specHelper.registerMockEndpoint(
			'/ads/gallery?_forceExample=true&_statusCode=200',
			'test/spec/mockData/api/v1/GallerySlice.json');
		specHelper.registerMockEndpoint(
			'/ads/statistics?_forceExample=true&_statusCode=200',
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
