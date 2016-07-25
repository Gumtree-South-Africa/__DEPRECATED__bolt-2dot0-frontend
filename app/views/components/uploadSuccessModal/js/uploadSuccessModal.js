'use strict';

// let $ = require('jquery');

let initialize = () => {
	$('.upload-success-modal .close-button').on('click', () => {
		$('.upload-success-modal').toggleClass('hidden');
		$('.success-modal-mask').toggleClass('hidden');
	});
};

module.exports = {
	initialize
};
