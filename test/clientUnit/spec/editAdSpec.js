'use strict';

let editAdFormMainDetailsController = require("app/appWeb/views/components/editAdFormMainDetails/js/editAdFormMainDetails.js");
let specHelper = require('../helpers/commonSpecHelper.js');

let mockLocationData = {"results":[{"address_components":[{"long_name":"Mexico City","short_name":"México D.F.","types":["locality","political"]},{"long_name":"Mexico City","short_name":"D.F.","types":["administrative_area_level_1","political"]},{"long_name":"Mexico","short_name":"MX","types":["country","political"]}],"formatted_address":"Mexico City, Mexico","geometry":{"bounds":{"northeast":{"lat":19.5927572,"lng":-98.9604482},"southwest":{"lat":19.1887101,"lng":-99.3267771}},"location":{"lat":19.4326077,"lng":-99.133208},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":19.5927572,"lng":-98.9604482},"southwest":{"lat":19.1887101,"lng":-99.3267771}}},"place_id":"ChIJB3UJ2yYAzoURQeheJnYQBlQ","types":["locality","political"]}],"status":"OK"};
let mockLatLongData = {"id":201,"localizedName":"Mexico City","level":"L0","isLeaf":false,"_links":[{"rel":"self","href":"/locations/90/-70.5","method":"GET"}]};

describe('Edit Ad', () => {
	it("should allow location selection without modifying the cookie", () => {

		$("#testArea").html("");
		specHelper.setCookie("geoId", "10ng10"); // storing canned cookie

		let $testArea = specHelper.setupTest("editAdFormMainDetails_es_MX", {
				categoryCurrentHierarchy: "[0, 3]"
			}, "es_MX"),
			$locationLink = $testArea.find(".location-link");

		let inputVal = "Mexico City";

		editAdFormMainDetailsController.initialize();
		editAdFormMainDetailsController.onReady();

		specHelper.registerMockAjax(`https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&address=${inputVal}`, mockLocationData);
		specHelper.registerMockAjax("/api/locate/locationlatlong?latLong=" + encodeURIComponent(mockLocationData.results[0].geometry.location.lat.toString()) + "ng" + encodeURIComponent(mockLocationData.results[0].geometry.location.lng.toString()), mockLatLongData);

		$locationLink.click();

		specHelper.simulateTextInput($testArea.find("#modal-location"), inputVal);

		$testArea.find(".ac-field").first().click(); // select first result from auto complete

		$testArea.find(".modal-cp .btn").click(); // confirm location selection

		expect($locationLink.text().trim()).toEqual("ServerLoc"); // make sure text has been updated
		expect(specHelper.getCookie("geoId")).toEqual("10ng10");
		$("#testArea").html("");
	});

	it("should make ajax call when button is clicked", () => {
		let $testArea = specHelper.setupTest("editAdFormMainDetails_es_MX", {
			categoryCurrentHierarchy: "[0, 3]"
		}, "es_MX");
		editAdFormMainDetailsController.initialize();
		editAdFormMainDetailsController.onReady();
		specHelper.registerMockAjax('/api/edit', {'vipLink': '/success'}, {
			success: (returnData) => {
				expect(true).toBeFalsy();
				expect(returnData.vipLink).toBe('/success');
			}
		});

		let $button = $testArea.find('#js-edit-submit-button');
		$button.click();
	});
});
