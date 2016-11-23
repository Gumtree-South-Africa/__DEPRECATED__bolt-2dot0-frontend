'use strict';

let initialize = () => {
	$(document).ready(() => {
		$('.show-phone').on('click', function() {
			$('.hidden-phone').addClass('hide');
			$('.real-phone').removeClass('hide');
			$('.show-phone').addClass('hide');
		});

		$('.back-button').on('click', function() {
			$('.reply-form-container').addClass('hide');
		});
	});
};

module.exports = {
	initialize
};
