'use strict';
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");

let _bindEvents = () => {
	this.$priceInput.on('keydown', (e) => {
		if (e.keyCode > 57 || e.keyCode < 48) {
			switch (e.keyCode) {
				case 8://backspace
				case 9://tab
				case 13://delete
				case 37://left arrow
				case 39://right arrow
					break;
				default:
					e.preventDefault();
					break;
			}
		}
	});
};


let initialize = () => {
	// update title input char count
	$('.title-input').on('keyup', (event) => {
		$('.char-count').text(event.target.value.length);
	});

	formChangeWarning.initialize();

	this.$priceInput = $('#price-input');
	_bindEvents();
};

module.exports = {
	initialize
};



