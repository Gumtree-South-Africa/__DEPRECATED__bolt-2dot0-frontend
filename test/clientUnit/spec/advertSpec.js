"use strict";

let specHelper = require('../helpers/commonSpecHelper.js');

describe("Advert Details", () => {

	it("should display ad details", (done) => {

		let $testArea = specHelper.setupTest("adDetails_es_MX", {}, "es_MX");

		let $priAttrs = $testArea.find(".pri-attrs");
		expect($priAttrs).toBeDefined('primary attributes should be defined');

		let $adTitle = $testArea.find(".ad-title");
		expect($adTitle).toBeTruthy('primary attributes should have a title');

		let $secAttrs = $testArea.find(".sec-attrs");
		expect($secAttrs).toBeDefined('secondary attributes should be defined');

		done();
	});

});
