'use strict';

let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");

let initialize = () => {
	// update title input char count
	$('.title-input').on('keyup', (event) => {
		$('.char-count').text(event.target.value.length);
	});

	formChangeWarning.initialize();
};

module.exports = {
	initialize
};



