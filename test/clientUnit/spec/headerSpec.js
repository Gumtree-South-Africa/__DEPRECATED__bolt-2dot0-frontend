"use strict";

let headerController = require("app/appWeb/views/components/headerV2/js/header.js");
let profileMenuContoller = require("app/appWeb/views/components/profileMenu/js/profileMenu.js");
let specHelper = require('../helpers/commonSpecHelper.js');

let headerModel = require("../mockData/headerModel.json");

describe("Header V2", () => {

	it("should toggle header dropdown menus state on click", () => {

		let $testArea = specHelper.setupTest("headerV2_es_MX", {}, "es_MX");

		headerController.initialize(false);		// we init with false because we're handing the onReady
		headerController.onReady();

		let $catDropdown = $testArea.find("#js-cat-dropdown");
		expect($catDropdown.hasClass("hidden")).toBeTruthy("category dropdown should be hidden on initial load");

		let $catButton = $testArea.find(".browse");
		$catButton.trigger('mouseenter');
		expect($catDropdown.hasClass("hidden")).toBeFalsy("category dropdown should be visible after hover");


		let $profileDropdown = $testArea.find("#js-profile-dropdown");
		expect($profileDropdown.hasClass("hidden")).toBeTruthy("profile dropdown should be hidden on initial load");

		let $profileButton = $testArea.find(".profile");
		$profileButton.click();
		expect($profileDropdown.hasClass("hidden")).toBeFalsy("profile dropdown should be visible after click");
	});

	it("should rot13 profile menu links to make them navigable", () => {
		let $testArea = specHelper.setupTest("profileMenu", { header: headerModel }, "es_MX");

		spyOn(profileMenuContoller, "_revealUrl").and.callThrough();

		let numLinks = $testArea.find(".rot-link-toConvert").length;
		profileMenuContoller.initialize();

		expect(profileMenuContoller._revealUrl.calls.count()).toEqual(numLinks);
	});

	it('should open hamburger menu when clicking it', () => {
		let $testArea = specHelper.setupTest("headerV2_es_MX", headerModel, "es_MX");

		$testArea.append("<div id='js-body-overlay'></div>");
		$testArea.append("<div class='containment'></div>");

		headerController.initialize(false);		// we init with false because we're handing the onReady
		headerController.onReady();

		let $hamburgerIcon = $testArea.find("#js-hamburger-icon");
		let $hamburgerContents = $testArea.find(".hamburger-contents");

		$hamburgerIcon.click();

		expect($hamburgerContents.hasClass("hamburger-open")).toBeTruthy();
		expect($hamburgerContents.hasClass("hamburger-closed")).toBeFalsy();
	});
});
