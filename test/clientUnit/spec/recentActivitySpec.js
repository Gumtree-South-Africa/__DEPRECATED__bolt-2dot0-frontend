"use strict";

let recentActivityController = require("app/appWeb/views/components/recentActivity/js/recentActivity.js");
let specHelper = require('../helpers/commonSpecHelper.js');


describe("Recent Activity", () => {

	it("should display recent activities", (done) => {

		let $testArea = specHelper.setupTest("recentActivity_es_MX", {}, "es_MX");

		recentActivityController.initialize(false);		// we init with false because we're handing the onReady
		recentActivityController.onReady();

		let $shuffledArr = $testArea.find(".shuffled-arr");
		expect($shuffledArr.hasClass("hidden")).toBeTruthy("shuffled array should be hidden");

		let $userImages = $testArea.find(".user-avatar");
		expect($userImages).toBeDefined("user profile pictures need to exist");

		let $feedTiles = $testArea.find(".feed-tiles");
		expect($feedTiles).toBeTruthy("profile dropdown should be hidden on initial load");

		done();
	});

});
