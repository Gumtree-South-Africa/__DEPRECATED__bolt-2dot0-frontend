'use strict';

let $ = require('jquery');
let clientHbs = require("public/js/common/utils/clientHandlebars.js");

let _shuffleArr = (inputArr) => {
	for (let i = inputArr.length - 1; i >= 0; i--) {
		let randomIndex = Math.floor(Math.random() * (i + 1));
		let itemAtIndex = inputArr[randomIndex];

		inputArr[randomIndex] = inputArr[i];
		inputArr[i] = itemAtIndex;
	}
	return inputArr;
};

let initialize = () => {
	$(document).ready(() => {
		let $orgArr = JSON.parse($('.shuffled-arr').text() || "{}");
		this.locale = $(".client-hbs-locale").data("locale");
		clientHbs.initialize(this.locale);
		if ($orgArr.length > 0) {
			setInterval(function() {
				let shuffledArr = _shuffleArr($orgArr);
				let templateString = clientHbs.renderTemplate("recentActivity", {"recentActivities": {shuffledArr}});
				let $refreshDiv = $(".refresh-div");
				$refreshDiv.empty().hide().append(templateString).fadeIn(2000);
			}, 18000);
		}
	});
};

module.exports = {
	initialize
};
