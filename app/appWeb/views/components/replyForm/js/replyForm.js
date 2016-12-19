'use strict';

class replyForm {
	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param options
	 */
	initialize() {
		this.$headerHeight = $('.header-wrapper').height();
		$(document).ready(() => {
			// let adActivateStatus = this._getURLParameter('adActivateStatus') || '';
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

	_getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}

	_messageSeller() {
		let $replyForm = $('.reply-form');
		let $replyFormContainer = $('.reply-form-container');
		$('.header-wrapper').addClass('fixed-header');
		$replyFormContainer.removeClass('desktop-only');
		$replyForm.addClass('fixed');
		$replyForm.css('top', this.$headerHeight + 'px');
	}
}

module.exports = new replyForm ();
