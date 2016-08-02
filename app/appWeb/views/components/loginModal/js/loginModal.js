'use strict';

let $ = require('jquery');

let initialize = () => {
	$('.login-modal .close-button').on('click', () => {
		$('.login-modal').toggleClass('hidden');
		$('.login-modal-mask').toggleClass('hidden');
	});
};

module.exports = {
	initialize
};
