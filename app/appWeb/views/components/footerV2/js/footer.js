'use strict';

let $ = require('jquery');

let initialize = () => {

	$(document).ready(() => {
		function toggleCategory(e) {
			//$('.menu-items').toggleClass('hide');
			$(e.currentTarget).find('.menu-items').toggleClass('hide');
		}

		$('.menu-category').on('click', (e) => {
			toggleCategory(e);
		});
	});
};

module.exports = {
	initialize
};
