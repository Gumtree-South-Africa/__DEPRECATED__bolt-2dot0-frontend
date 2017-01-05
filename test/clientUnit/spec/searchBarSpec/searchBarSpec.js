"use strict";

let searchBarController = require("app/appWeb/views/components/searchbarV2/js/searchbarV2.js");
let specHelper = require('../../helpers/commonSpecHelper.js');

let mockTypeAheadResults = {
	"items": [
		{
			"keyword": "kayak",
			"seoUrl": "/search.html?q=kayak&catId=7",
			"displayText": "kayak en Deportes y pasatiempos",
			"category": 7,
			"location": 10015,
			"localizedCatName": "Deportes y pasatiempos"
		},
		{
			"keyword": "kite",
			"seoUrl": "/search.html?q=kite&catId=7",
			"displayText": "kite en Deportes y pasatiempos",
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
			// expect($firstResult.attr('href')).toEqual(mockTypeAheadResults.items[0].seoUrl);
			expect($firstResult.html()).toEqual(mockTypeAheadResults.items[0].keyword);
		});

		it("should populate the search field with items that are clicked", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($testArea.find('input[type="text"]'), "k");
			let $firstResult = $testArea.find(".type-ahead-link").first();

			$firstResult.click();
			expect($testArea.find('input[type="text"]').val()).toEqual($firstResult.text());
		});

		it("items should highlight the top item when arrowing down if none are selected", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			let $textInput = $testArea.find('input[type="text"]');
			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($textInput, "k");

			specHelper.simulateDownArrow($textInput);
			expect($testArea.find(".type-ahead-results-row").first().hasClass("active")).toBeTruthy();
		});

		it("should highlight the top item when arrowing down if none are selected", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			let $textInput = $testArea.find('input[type="text"]');
			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($textInput, "k");

			specHelper.simulateUpArrow($textInput);
			expect($testArea.find(".type-ahead-results-row").last().hasClass("active")).toBeTruthy();
		});

		it("should highlight the next item when arrowing down if one is already selected", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			let $textInput = $testArea.find('input[type="text"]');
			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($textInput, "k");

			let $typeAheadRows = $testArea.find(".type-ahead-results-row");
			$typeAheadRows.first().addClass("active");

			specHelper.simulateDownArrow($textInput);
			let $secondRow = $($typeAheadRows[1]);
			expect($secondRow.hasClass("active")).toBeTruthy();
		});

		it("should highlight the previous item when arrowing up if one is already selected", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			let $textInput = $testArea.find('input[type="text"]');
			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($textInput, "k");

			let $typeAheadRows = $testArea.find(".type-ahead-results-row");
			$typeAheadRows.last().addClass("active");

			specHelper.simulateUpArrow($textInput);
			let $secondToLastRow = $($typeAheadRows[$typeAheadRows.length - 2]);
			expect($secondToLastRow.hasClass("active")).toBeTruthy();
		});

		it("should select the highlighted item when pressing enter", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			let $textInput = $testArea.find('input[type="text"]');
			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($textInput, "k");

			let $typeAheadRows = $testArea.find(".type-ahead-results-row");
			$typeAheadRows.first().addClass("active");

			spyOn(searchBarController, "_selectItem").and.stub();

			specHelper.simulateEnter($textInput);
		});

		it("should close the autocomplete when pressing esc", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			let $textInput = $testArea.find('input[type="text"]');
			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($textInput, "k");

			expect($testArea.find("#search-controls").hasClass("is-typing")).toBeTruthy();

			specHelper.simulateEsc($textInput);

			expect($testArea.find(".search-textbox").val()).toBeFalsy();

			specHelper.simulateEsc($textInput);

			expect($testArea.find("#search-controls").hasClass("is-typing")).toBeFalsy();
		});
	});
});
