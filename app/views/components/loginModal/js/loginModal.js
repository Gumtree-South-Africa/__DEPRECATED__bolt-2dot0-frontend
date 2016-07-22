'use strict';

let $ = require('jquery');

let initialize = () => {
	$('.close-button').on('click', () => {
		$('.login-modal').toggleClass('hidden');
		$('.modal-mask').toggleClass('hidden');
	});
};

module.exports = {
	initialize
};
