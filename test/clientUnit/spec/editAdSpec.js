'use strict';

let PostFormCustomAttributesController = require("app/appWeb/views/components/postFormCustomAttributes/js/postFormCustomAttributes.js");
let postAdFormMainDetailsController = require("app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js");
let EditAdController = require("app/appWeb/views/templates/pages/editAd/js/editPage.js").EditAd;
let specHelper = require('../helpers/commonSpecHelper.js');
let formMapController = require("app/appWeb/views/components/formMap/js/formMap.js");
let formMapMock =require('../mockData/formMapMock.json');

let mockEditAdResponse = {
	redirectLink : {
		vip: "/a-venta-inmuebles/2-de-octubre/post-house-ad-from-bapi-at-2016+07+22-00-57-24-085/1001100557900910658758009?activateStatus=adEdited"
	}
};

let editPageModel = require("../mockData/editPageModel.json");
let customAttributeAjaxResponse = require("../mockData/customAttributesAjaxResponse.json");
let dependentAttributesModel = require("../mockData/dependentAttributesModel.json");

describe('Edit Ad', () => {
	beforeEach(() => {
		// Don't run polyfill for form as it will throw following error on CI client UT
		// TypeError: Assignment to constant variable.
		// at t (/src/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js:25768:227)
		// at Object.test (/src/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js:25787:143)
		// at Object._polyfill (/src/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js:25481:272)
		// at Object.a.extend.polyfill (/src/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js:25476:269)
		// at PostAdFormMainDetails._setupPolyfillForm (/src/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js:24059:94)
		spyOn(postAdFormMainDetailsController, '_setupPolyfillForm');
	});

	it("should validate edit ad fields on submit", () => {
		specHelper.mockGoogleLocationApi();
		let editPageModelCopy = JSON.parse(JSON.stringify(editPageModel));
		editPageModelCopy.customAttributes = customAttributeAjaxResponse.customAttributes;
		let failPayload = {"error":"error updating ad, see logs for details","bapiJson":{"message":"Validation Errors","details":[{"code":"INVALID_PARAM_ATTRIBUTE","message":"Param: categoryAttribute-Youtube, Value: 3000, Message: Invalid param"}]},"bapiValidationFields":["Youtube"]};
		let $testArea = specHelper.setupTest("postAdFormMainDetails", editPageModelCopy, "es_MX");

		specHelper.mockWebshim();

		postAdFormMainDetailsController.initialize();
		postAdFormMainDetailsController.viewModel.setValidationError(failPayload);
		expect($testArea.find('[name="Youtube"]').hasClass("validation-error")).toBeTruthy();
	});

	it("should make ajax call when button is clicked", () => {
		specHelper.mockGoogleLocationApi();
		let $testArea = specHelper.setupPageTest('editAd', {
			categoryCurrentHierarchy: "[0, 3]",
			footer: {
				"baseJSUrl": "/public/js/"
			}
		}, "es_MX");

		specHelper.mockWebshim();

		let editAdController = new EditAdController();
		editAdController.componentDidMount($testArea);
		specHelper.disableFormWarning();
		specHelper.registerMockAjax('/api/edit/update', mockEditAdResponse, {
			success: (returnData) => {
				expect(returnData.redirectLink.vip).toMatch(/\w+?activateStatus=adEdited/i);
			}
		});

		let $button = $testArea.find('#js-edit-submit-button');
		$button.click();
	});

	// describe("Location Selection", () => {
	// 	it("should allow location selection without modifying the cookie", () => {
	// 		specHelper.registerMockAjax(`https://maps.googleapis.com/maps/api/js?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&libraries=places&language=`, mockGoogleAutoCompleteData);
	// 		specHelper.setCookie("geoId", "10ng10"); // storing canned cookie
	// 		specHelper.mockWebshim();
	//
	// 		let $testArea = specHelper.setupTest("editAdFormMainDetails_es_MX", {
	// 				categoryCurrentHierarchy: "[0, 3]",
	// 				footer: {
	// 					"baseJSUrl": "/public/js/"
	// 				}
	// 			}, "es_MX"),
	// 			$locationLink = $testArea.find(".location-link");
	//
	// 		let inputVal = "Mexico City";
	//
	// 		editAdFormMainDetailsController.initialize();
	// 		editAdFormMainDetailsController.onReady();
	// 		specHelper.disableFormWarning();
	//
	// 		specHelper.registerMockAjax(`/api/locate/locationlatlong`, mockLatLongData);
	// 		specHelper.registerMockAjax(`/api/locate/locationlatlong?lat=${encodeURIComponent(mockLocationData.results[0].geometry.location.lat.toString())}&lng=${encodeURIComponent(mockLocationData.results[0].geometry.location.lng.toString())}`, mockLatLongData);
	//
	// 		$locationLink.click();
	//
	// 		specHelper.simulateTextInput($testArea.find("#modal-location"), inputVal);
	//
	// 		$testArea.find(".ac-field").first().click(); // select first result from auto complete
	//
	// 		$testArea.find(".modal-cp .btn").click(); // confirm location selection
	//
	// 		expect($locationLink.text().trim()).toEqual("Mexico City"); // make sure text has been updated
	// 	});
	// });

	describe("Custom Attribute Rendering", () => {
		it("should render custom attributes on category changes", () => {
			let $testArea = specHelper.setupTest("postFormCustomAttributes", editPageModel, "es_MX");
			let newCatId = 64;

			specHelper.registerMockAjax(`/api/edit/customattributes/${newCatId}`, customAttributeAjaxResponse);

			let postFormCustomAttributesController = new PostFormCustomAttributesController();
			postFormCustomAttributesController.componentDidMount($testArea);
			postFormCustomAttributesController.categoryId = newCatId;

			expect($testArea.find('[data-field="ForSaleBy"]').length).toEqual(1);
			expect($testArea.find('[data-field="Youtube"]').length).toEqual(1);
		});

		it("should render custom attributes on category changes", () => {
			let $makeOptions, $modelOptions;
			let $testArea = specHelper.setupTest("postFormCustomAttributes", dependentAttributesModel.templateModel, "es_MX");

			specHelper.registerMockAjax(`/api/edit/attributedependencies`, dependentAttributesModel.dependencies.Pontiac);
			specHelper.registerMockAjax(`/api/edit/attributedependencies`, dependentAttributesModel.dependencies.Ford);

			let postFormCustomAttributesController = new PostFormCustomAttributesController();
			postFormCustomAttributesController.componentDidMount($testArea);

			let $makeSelect = $testArea.find('select[name="Make"]');
			let $modelSelect = $testArea.find('select[name="Model"]');
			$makeOptions = $makeSelect.find("option");
			$modelOptions = $modelSelect.find("option");
			expect($makeOptions.length).toEqual(3); // default value plus (Pontiac, Ford)
			expect($modelOptions.length).toEqual(1); // default value plus (Pontiac, Ford)

			specHelper.simulateSelectBoxSelect($makeSelect, "Pontiac");

			$modelOptions = $modelSelect.find("option");
			expect($makeOptions.length).toEqual(3); // default value plus (Pontiac, Ford)
			expect($modelOptions.length).toEqual(3); // default value plus (Trans Am, Fire Bird)

			expect($($modelOptions[0]).attr("value")).toEqual("default"); // default value plus (Trans Am, Fire Bird)
			expect($($modelOptions[1]).attr("value")).toEqual("Trans Am"); // default value plus (Trans Am, Fire Bird)
			expect($($modelOptions[2]).attr("value")).toEqual("Firebird"); // default value plus (Trans Am, Fire Bird)

			specHelper.simulateSelectBoxSelect($makeSelect, "Ford");

			$modelOptions = $modelSelect.find("option");
			expect($makeOptions.length).toEqual(3); // default value plus (Pontiac, Ford)
			expect($modelOptions.length).toEqual(2); // default value plus (Trans Am, Fire Bird)

			expect($($modelOptions[0]).attr("value")).toEqual("default"); // default value plus (Trans Am, Fire Bird)
			expect($($modelOptions[1]).attr("value")).toEqual("Mustang"); // default value plus (Trans Am, Fire Bird)
		});

	});

	describe("formMap", () => {
		let $testArea;
		window.getUrlParameter(true);
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();
			 this.navigator = {
				geolocation: function() {
					return {
						getCurrentPosition: function() { }
					};
				}
			};
			$testArea = specHelper.setupTest('formMap', { googleMap: formMapMock.googleMapConfiguration, locationlatlong: formMapMock.locationlatlong }, 'es_MX');
			formMapController.initialize();
			window.formMap.locationAd = {
				lat: 23.49125085380051,
		    lng: -100.15682835625
			};
		});

		it('test if google api maps has been applied on object window.google', () => {
			spyOn(window.google.maps, 'Map');
			this.map = new google.maps.Map($(".map")[0], {
				center: this.position,
				zoom: this.zoom,
				disableDefaultUI: true,
			});
			expect(google.maps.Map).toHaveBeenCalled();
		});

		it("initialize and disable geolocate", () => {
			let checkGeolocation = $testArea.find('#checkGeolocation');
			window.formMap.validateCountry(window.formMap.locationAd);
			window.google.maps.Geocoder.geocode = jasmine.createSpy();

			expect(checkGeolocation.hasClass('toggle-input')).toBeTruthy('should be display checkbox control');
		});
	});
});
