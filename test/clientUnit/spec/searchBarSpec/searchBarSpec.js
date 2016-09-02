"use strict";

let searchBarController = require("app/appWeb/views/components/searchbarV2/js/searchbarV2.js");
let specHelper = require('../../helpers/commonSpecHelper.js');

let mockTypeAheadResults = {
	"items": [
		{
			"keyword": "kayak",
			"seoUrl": "/search.html?q=kayak&locId=10015&catId=7",
			"displayText": "kayak en Deportes y pasatiempos",
			"category": 7,
			"location": 10015,
			"localizedCatName": "Deportes y pasatiempos"
		}
	],
	"localizedInWord": "en"
};


describe("Search Bar V2", () => {
	describe("Type Ahead", () => {
		it("should display type ahead when input is given to the textbox", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($testArea.find('input[type="text"]'), "k");
			let $firstResult = $testArea.find(".type-ahead-link").first();

			expect($testArea.find("#search-controls").hasClass("is-typing")).toBeTruthy();
			expect($firstResult.attr('href')).toEqual(mockTypeAheadResults.items[0].seoUrl);
			expect($firstResult.html()).toEqual(mockTypeAheadResults.items[0].keyword);
		});

		it("items that are clicked should populate the search field", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($testArea.find('input[type="text"]'), "k");
			let $firstResult = $testArea.find(".type-ahead-link").first();

			$firstResult.click();
			expect($testArea.find('input[type="text"]').val()).toEqual($firstResult.text());
		});
	});
});
