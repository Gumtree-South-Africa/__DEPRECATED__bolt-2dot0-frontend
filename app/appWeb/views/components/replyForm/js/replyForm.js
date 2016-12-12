'use strict';

let initialize = () => {
	//TODO btoa atob the number
	$(document).ready(() => {
		let $realPhone = $('.real-phone').text();
		let $encodedPhone = window.btoa($realPhone);
		$('.real-phone').text($encodedPhone);
		$('.show-phone').on('click', function() {
			$('.hidden-phone').addClass('hide');
			$('.real-phone').removeClass('hide');
			$('.show-phone').addClass('hide');
			$('.real-phone').text(window.atob($encodedPhone));
		});
	});
};

module.exports = {
	initialize
};
