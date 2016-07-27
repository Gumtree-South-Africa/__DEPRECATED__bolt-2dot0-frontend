"use strict";

let searchBarController = require("app/views/components/searchbarV2/js/searchbarV2.js");
let specHelper = require('../../helpers/commonSpecHelper.js');

let mockTypeAheadResults = {
	"autoCompletContentList": [
		{
			"keyword": "kayak",
			"seoUrl": "http://www.vivanuncios.com.mx.localhost:8000/s-deportes-pasatiempos/baja-california/kayak/v1c7l1001q0p1",
			"displayText": "kayak en Deportes y pasatiempos",
			"catId": 7,
			"locId": 10015,
			"localizedCatName": "Deportes y pasatiempos"
		},
		{
			"keyword": "karman ghia",
			"seoUrl": "http://www.vivanuncios.com.mx.localhost:8000/s-venta-autos/baja-california/karman+ghia/v1c65l1001q0p1",
			"displayText": "karman ghia en Autos",
			"catId": 65,
			"locId": 10015,
			"localizedCatName": "Autos"
		},
		{
			"keyword": "karmann ghia",
			"seoUrl": "http://www.vivanuncios.com.mx.localhost:8000/s-venta-autos/baja-california/karmann+ghia/v1c65l1001q0p1",
			"displayText": "karmann ghia en Autos",
			"catId": 65,
			"locId": 10015,
			"localizedCatName": "Autos"
		}
	],
	"localizedInWord": "en"
};


describe("Search Bar V2", () => {
	describe("Type Ahead", () => {
		it("should display type ahead ahead when input is given to the textbox", () => {
			let $testArea = specHelper.setupTest("searchbarV2_es_MX", {}, "es_MX");
			searchBarController.initialize();

			specHelper.registerMockAjax("/api/search/autocomplete", mockTypeAheadResults);

			specHelper.simulateTextInput($testArea.find('input[type="text"]'), "k");
			let $firstResult = $testArea.find(".type-ahead-link").first();

			expect($testArea.find("#search-controls").hasClass("is-typing")).toBeTruthy();
			expect($firstResult.attr('href')).toEqual(mockTypeAheadResults.autoCompletContentList[0].seoUrl);
			expect($firstResult.html()).toEqual(mockTypeAheadResults.autoCompletContentList[0].displayText);
		});
	});
});
