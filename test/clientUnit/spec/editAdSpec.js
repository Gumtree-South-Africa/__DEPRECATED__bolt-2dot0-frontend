'use strict';

let editAdFormMainDetailsController = require("app/appWeb/views/components/editAdFormMainDetails/js/editAdFormMainDetails.js");
let categorySelectionModal = require("app/appWeb/views/components/categorySelectionModal/js/categorySelectionModal.js");
let specHelper = require('../helpers/commonSpecHelper.js');

//let mockGoogleAutoCompleteData = "window.google=window.google||{};google.maps=google.maps||{};google.maps.__gjsload__(\'places\',function(_){\'use strict\';var Qw=function(a,b){try{_.Ib(window.HTMLInputElement,\"HTMLInputElement\")(a)}catch(c){if(_.Fb(c),!a)return}\r\n_.J(\"places_impl\",(0,_.v)(function(c){this.setValues(b||{});c.b(this,a);_.Ie(a)},this))},Rw=function(){this.b=null;_.J(\"places_impl\",(0,_.v)(function(a){this.b=a.l()},this))},Sw=function(a){this.b=null;_.J(\"places_impl\",(0,_.v)(function(b){this.b=b.f(a)},this))},Tw=function(a,b){_.J(\"places_impl\",(0,_.v)(function(c){c.j(this,a);this.setValues(b||{})},this))};_.w(Qw,_.G);Qw.prototype.setTypes=_.wc(\"types\",_.Kb(_.$g));Qw.prototype.setComponentRestrictions=_.wc(\"componentRestrictions\");_.xc(Qw.prototype,{place:null,bounds:_.Ob(_.Ud)});Rw.prototype.getPlacePredictions=function(a,b){_.J(\"places_impl\",(0,_.v)(function(){this.b.getPlacePredictions(a,b)},this))};Rw.prototype.getPredictions=Rw.prototype.getPlacePredictions;Rw.prototype.getQueryPredictions=function(a,b){_.J(\"places_impl\",(0,_.v)(function(){this.b.getQueryPredictions(a,b)},this))};_.r=Sw.prototype;_.r.getDetails=function(a,b){_.J(\"places_impl\",(0,_.v)(function(){this.b.getDetails(a,b)},this))};_.r.nearbySearch=function(a,b){_.J(\"places_impl\",(0,_.v)(function(){this.b.nearbySearch(a,b)},this))};_.r.search=Sw.prototype.nearbySearch;_.r.textSearch=function(a,b){_.J(\"places_impl\",(0,_.v)(function(){this.b.textSearch(a,b)},this))};_.r.radarSearch=function(a,b){_.J(\"places_impl\",(0,_.v)(function(){this.b.radarSearch(a,b)},this))};_.w(Tw,_.G);_.xc(Tw.prototype,{places:null,bounds:_.Ob(_.Ud)});_.Lc.google.maps.places={PlacesService:Sw,PlacesServiceStatus:{OK:_.ha,UNKNOWN_ERROR:_.ka,OVER_QUERY_LIMIT:_.ia,REQUEST_DENIED:_.ja,INVALID_REQUEST:_.ca,ZERO_RESULTS:_.la,NOT_FOUND:_.ga},AutocompleteService:Rw,Autocomplete:Qw,SearchBox:Tw,RankBy:{PROMINENCE:0,DISTANCE:1},RatingLevel:{GOOD:0,VERY_GOOD:1,EXCELLENT:2,EXTRAORDINARY:3}};_.mc(\"places\",{});});";
//let mockLocationData = {"results":[{"address_components":[{"long_name":"Mexico City","short_name":"México D.F.","types":["locality","political"]},{"long_name":"Mexico City","short_name":"D.F.","types":["administrative_area_level_1","political"]},{"long_name":"Mexico","short_name":"MX","types":["country","political"]}],"formatted_address":"Mexico City, Mexico","geometry":{"bounds":{"northeast":{"lat":19.5927572,"lng":-98.9604482},"southwest":{"lat":19.1887101,"lng":-99.3267771}},"location":{"lat":19.4326077,"lng":-99.133208},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":19.5927572,"lng":-98.9604482},"southwest":{"lat":19.1887101,"lng":-99.3267771}}},"place_id":"ChIJB3UJ2yYAzoURQeheJnYQBlQ","types":["locality","political"]}],"status":"OK"};
//let mockLatLongData = {"id":201,"localizedName":"Mexico City","level":"L0","isLeaf":false,"_links":[{"rel":"self","href":"/locations/90/-70.5","method":"GET"}]};

let mockEditAdResponse = {
	redirectLink : {
		vip: "/a-venta-inmuebles/2-de-octubre/post-house-ad-from-bapi-at-2016+07+22-00-57-24-085/1001100557900910658758009?activateStatus=adEdited"
	}
};
//let mockEditAdWithPaymentResponse = {
//	redirectLink : {
//		vip: "/a-elektronarzedzia/buk/ad-posted-by-shuochen-ebay-com/1001000002000910000000009?activateStatus=adEdited",
//		previp: "/payment/payment.html?orderId=101016200",
//		previpRedirect: "/a-elektronarzedzia/buk/ad-posted-by-shuochen-ebay-com/1001000002000910000000009?activateStatus=adActivateSuccessWithIFPayment"
//	}
//};

let mockCategoryTree = require("../mock/categoryTree.json");

describe('Edit Ad', () => {
	it("should make ajax call when button is clicked", () => {
		specHelper.mockGoogleLocationApi();
		let $testArea = specHelper.setupTest("editAdFormMainDetails_es_MX", {
			categoryCurrentHierarchy: "[0, 3]",
			footer: {
				"baseJSUrl": "/public/js/"
			}
		}, "es_MX");

		specHelper.mockWebshim();

		editAdFormMainDetailsController.initialize();
		editAdFormMainDetailsController.onReady();
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

	describe("Category Selection Modal", () => {
		it("should open with an empty category hierarchy at all categories", () => {
			let $testArea = specHelper.setupTest("categorySelectionModal", {}, "es_MX");

			$testArea.append(`<div id="category-tree">${JSON.stringify(mockCategoryTree)}</div>`);

			categorySelectionModal.initialize();

			categorySelectionModal.openModal({
				currentHierarchy: []
			});

			expect($testArea.find(".current-hierarchy").text()).toEqual("editAd.categorySelect.rootLabel");
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

			expect($testArea.find(".current-hierarchy").text()).toEqual("editAd.categorySelect.rootLabel > Automotive Vehicles");
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

			expect($testArea.find(".current-hierarchy").text()).toEqual("editAd.categorySelect.rootLabel");

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

			expect($testArea.find(".current-hierarchy").text()).toEqual("editAd.categorySelect.rootLabel");

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
