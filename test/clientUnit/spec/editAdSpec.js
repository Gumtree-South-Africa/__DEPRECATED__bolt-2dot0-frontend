'use strict';

let editAdFormMainDetailsController = require("app/appWeb/views/components/editAdFormMainDetails/js/editAdFormMainDetails.js");
let categorySelectionModal = require("app/appWeb/views/components/categorySelectionModal/js/categorySelectionModal.js");
let specHelper = require('../helpers/commonSpecHelper.js');

let mockLocationData = {"results":[{"address_components":[{"long_name":"Mexico City","short_name":"México D.F.","types":["locality","political"]},{"long_name":"Mexico City","short_name":"D.F.","types":["administrative_area_level_1","political"]},{"long_name":"Mexico","short_name":"MX","types":["country","political"]}],"formatted_address":"Mexico City, Mexico","geometry":{"bounds":{"northeast":{"lat":19.5927572,"lng":-98.9604482},"southwest":{"lat":19.1887101,"lng":-99.3267771}},"location":{"lat":19.4326077,"lng":-99.133208},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":19.5927572,"lng":-98.9604482},"southwest":{"lat":19.1887101,"lng":-99.3267771}}},"place_id":"ChIJB3UJ2yYAzoURQeheJnYQBlQ","types":["locality","political"]}],"status":"OK"};
let mockLatLongData = {"id":201,"localizedName":"Mexico City","level":"L0","isLeaf":false,"_links":[{"rel":"self","href":"/locations/90/-70.5","method":"GET"}]};

let mockCategoryTree = require("../mock/categoryTree.json");

describe('Edit Ad', () => {
	it("should make ajax call when button is clicked", () => {
		let $testArea = specHelper.setupTest("editAdFormMainDetails_es_MX", {
			categoryCurrentHierarchy: "[0, 3]"
		}, "es_MX");
		editAdFormMainDetailsController.initialize();
		editAdFormMainDetailsController.onReady();
		specHelper.disableFormWarning();
		specHelper.registerMockAjax('/api/edit/update', {'vipLink': '/success'}, {
			success: (returnData) => {
				expect(returnData.vipLink).toBe('/success');
			}
		});

		let $button = $testArea.find('#js-edit-submit-button');
		$button.click();
	});

	describe("Location Selection", () => {
		it("should allow location selection without modifying the cookie", () => {
			specHelper.setCookie("geoId", "10ng10"); // storing canned cookie

			let $testArea = specHelper.setupTest("editAdFormMainDetails_es_MX", {
					categoryCurrentHierarchy: "[0, 3]"
				}, "es_MX"),
				$locationLink = $testArea.find(".location-link");

			let inputVal = "Mexico City";

			editAdFormMainDetailsController.initialize();
			editAdFormMainDetailsController.onReady();
			specHelper.disableFormWarning();

			specHelper.registerMockAjax(`https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&&components=country:MX&language=es&address=${inputVal}`, mockLocationData);
			specHelper.registerMockAjax(`/api/locate/locationlatlong`, mockLatLongData);
			specHelper.registerMockAjax(`/api/locate/locationlatlong?lat=${encodeURIComponent(mockLocationData.results[0].geometry.location.lat.toString())}&lng=${encodeURIComponent(mockLocationData.results[0].geometry.location.lng.toString())}`, mockLatLongData);

			$locationLink.click();

			specHelper.simulateTextInput($testArea.find("#modal-location"), inputVal);

			$testArea.find(".ac-field").first().click(); // select first result from auto complete

			$testArea.find(".modal-cp .btn").click(); // confirm location selection

			expect($locationLink.text().trim()).toEqual("Mexico City"); // make sure text has been updated
		});
	});

	describe("Category Selection Modal", () => {
		it("should open with an empty category hierarchy at all categories", () => {
			let $testArea = specHelper.setupTest("categorySelectionModal", {}, "es_MX");

			$testArea.append(`<div id="category-tree">${JSON.stringify(mockCategoryTree)}</div>`);

			categorySelectionModal.initialize();

			categorySelectionModal.openModal({
				currentHierarchy: []
			});

			expect($testArea.find(".current-hierarchy").text()).toEqual("All Categories");
			let $listItems = $testArea.find(".list-item");
			expect($listItems.length).toBeGreaterThan(0);
			expect($listItems.length).toEqual(mockCategoryTree.children.length);
			expect($testArea.find(".list-item").each((i, item) => {
				expect($(item).text()).toEqual(mockCategoryTree.children[i].localizedName);
			}));
		});

		it("should open with a selected category and its list if selected category is not a leaf", () => {
			let $testArea = specHelper.setupTest("categorySelectionModal", {}, "es_MX");

			$testArea.append(`<div id="category-tree">${JSON.stringify(mockCategoryTree)}</div>`);

			categorySelectionModal.initialize();

			categorySelectionModal.openModal({
				currentHierarchy: [0, 5]
			});

			expect($testArea.find(".current-hierarchy").text()).toEqual("All Categories > Automotive Vehicles");
			let $listItems = $testArea.find(".list-item");

			expect($testArea.find("#category-selection-modal").hasClass("staged")).toBeFalsy();

			$testArea.find("#clear-text-btn").click();

			expect($listItems.length).toBeGreaterThan(0);
			expect($listItems.length).toEqual(mockCategoryTree.children[0].children.length);
			expect($listItems.each((i, item) => {
				expect($(item).text()).toEqual(mockCategoryTree.children[0].children[i].localizedName);
			}));
		});


		it("should let you drill into menus", () => {
			let $testArea = specHelper.setupTest("categorySelectionModal", {}, "es_MX");

			$testArea.append(`<div id="category-tree">${JSON.stringify(mockCategoryTree)}</div>`);

			categorySelectionModal.initialize();

			categorySelectionModal.openModal({
				currentHierarchy: [0]
			});

			expect($testArea.find(".current-hierarchy").text()).toEqual("All Categories");

			$testArea.find(".list-item").first().click();

			let $listItems = $testArea.find(".list-item");

			expect($listItems.length).toBeGreaterThan(0);
			expect($listItems.length).toEqual(mockCategoryTree.children[0].children.length);
			expect($listItems.each((i, item) => {
				expect($(item).text()).toEqual(mockCategoryTree.children[0].children[i].localizedName);
			}));
		});

		it("should stage a leaf node", () => {
			let $testArea = specHelper.setupTest("categorySelectionModal", {}, "es_MX");

			$testArea.append(`<div id="category-tree">${JSON.stringify(mockCategoryTree)}</div>`);

			categorySelectionModal.initialize();

			categorySelectionModal.openModal({
				currentHierarchy: [0]
			});

			expect($testArea.find(".current-hierarchy").text()).toEqual("All Categories");

			$testArea.find(".list-item").first().click();

			let $listItems = $testArea.find(".list-item");

			expect($listItems.length).toEqual(mockCategoryTree.children[0].children.length);
			expect($listItems.each((i, item) => {
				expect($(item).text()).toEqual(mockCategoryTree.children[0].children[i].localizedName);
			}));

			$listItems.first().click();

			expect($testArea.find("#category-selection-modal").hasClass("staged")).toBeTruthy();
		});
	});
});
