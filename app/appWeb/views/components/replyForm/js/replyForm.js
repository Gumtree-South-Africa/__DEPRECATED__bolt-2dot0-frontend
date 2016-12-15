'use strict';

class replyForm {
	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param options
	 */
	initialize() {
		$(document).ready(() => {
			let $realPhone = $('.real-phone').text();
			let $encodedPhone = window.btoa($realPhone);
			$('.real-phone').text($encodedPhone);

			$('.show-phone').on('click', function() {
				$('.hidden-phone').addClass('hide');
				$('.real-phone').text(window.atob($realPhone));
				$('.real-phone').removeClass('hide');
				$('.show-phone').addClass('hide');
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

		$('.welcome-wrapper .email').on('click', () => {
			this._messageSeller();
		});
	}

	_messageSeller() {
		let $replyForm = $('.reply-form');
		let $replyFormContainer = $('.reply-form-container');
		let $headerHeight = this._setHeaderHeight();
		$('.reply-form').css('top', $headerHeight + 'px');
		$('.header-wrapper').addClass('fixed-header');
		$replyFormContainer.removeClass('desktop-only');
		$replyForm.addClass('fixed');
	}

	_setHeaderHeight() {
		let $headerHeight = $('.header-wrapper').height();
		return $headerHeight;
	}
}

module.exports = new replyForm ();
