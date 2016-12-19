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

	it("should display seller profile", (done) => {

		let $testArea = specHelper.setupTest("sellerProfile_es_MX", {}, "es_MX");

		let $sellerPic = $testArea.find(".seller-pic");
		expect($sellerPic).toBeDefined('seller picture should be shown');

		let $userFirstName = $testArea.find(".user-fname");
		expect($userFirstName).toBeTruthy('user first name should exist');

		let $userAds = $testArea.find(".user-ads");
		expect($userAds).toBeDefined('should show user ads posted and active');

		done();
	});

	it("should display disclaimers", (done) => {

		let $testArea = specHelper.setupTest("adDisclaimers_es_MX", {}, "es_MX");

		let $adDisclaimers = $testArea.find(".ads-disclaimers");
		expect($adDisclaimers).toBeDefined('ads disclaimers should be defined');

		let $lockIcon = $testArea.find(".lock-icon");
		expect($lockIcon).toBeTruthy('lock icon should be shown');

		done();
	});

	it("should display reply form", (done) => {

		let $testArea = specHelper.setupTest("replyForm_es_MX", {}, "es_MX");

		let $replyForm = $testArea.find(".reply-form-content");
		expect($replyForm).toBeDefined('reply form should be defined');

		let $sendButton = $testArea.find(".send-message-container");
		expect($sendButton).toBeTruthy('send button should be shown');

		done();
	});
});
