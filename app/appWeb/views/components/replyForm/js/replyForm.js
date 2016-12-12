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

		$('#vip-send-button').on('click', function() {
			$('.reply-form-container').addClass('hide');
			$('.message-sent').removeClass('hide');
		});

		$('.return-button').on('click', function() {
			$('.message-sent').addClass('hide');
		});

		$('.close-button').on('click', function() {
			$('.message-sent').addClass('hide');
		});
	});
};

module.exports = {
	initialize
};
