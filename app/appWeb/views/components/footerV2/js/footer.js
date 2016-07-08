'use strict';

let $ = require('jquery');

let initialize = () => {

	let _toggleCategory = (e) => {
		$(e.currentTarget).find('.menu-items').toggleClass('hide');
	}

	$(document).ready(() => {
		$('.menu-category').on('click', (e) => {
			_toggleCategory(e);
		});
	});
};

module.exports = {
	initialize
};
