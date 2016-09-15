'use strict';

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
		clientHbs.initialize();
		if ($orgArr.length > 5) {
			setInterval(function() {
				let shuffledArr = _shuffleArr($orgArr);
				let templateString = clientHbs.renderTemplate("recentActivity", {"recentActivities": {shuffledArr}});
				let $refreshDiv = $(".refresh-div");
				$refreshDiv.empty().hide().append(templateString).fadeIn(2000);
			}, 13000);
		}
	});
};

module.exports = {
	initialize
};
