"use strict";

let headerController = require("app/views/components/headerV2/js/header.js");
let specHelper = require('../helpers/commonSpecHelper.js');


describe("Header V2", () => {

	it("should toggle header dropdown menus state on click", (done) => {

		let $testArea = specHelper.setupTest("headerV2_es_MX", {}, "es_MX");

		headerController.initialize(false);		// we init with false because we're handing the onReady
		headerController.onReady();

		let $catDropdown = $testArea.find("#js-cat-dropdown");
		expect($catDropdown.hasClass("hidden")).toBeTruthy("category dropdown should be hidden on initial load");

		let $profileDropdown = $testArea.find("#js-profile-dropdown");
		expect($profileDropdown.hasClass("hidden")).toBeTruthy("profile dropdown should be hidden on initial load");

		let $catButton = $testArea.find(".profile");
		$catButton.click();

		expect($catDropdown.hasClass("hidden")).toBeFalsy("category dropdown should be visible after click");

		let $profileButton = $testArea.find(".browse");
		$profileButton.click();

		expect($profileDropdown.hasClass("hidden")).toBeFalsy("profile dropdown should be visible after click");
		
		done();
	});

});
