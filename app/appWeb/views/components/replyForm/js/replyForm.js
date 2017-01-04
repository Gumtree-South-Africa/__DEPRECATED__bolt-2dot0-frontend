'use strict';

class replyForm {
	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param options
	 */
	initialize() {
		$(document).ready(() => {
			let adActivateStatus = this._getURLParameter('adActivateStatus') || '';

			if (adActivateStatus === 'AdReplySuccess') {
				if ($(window).width() < 848) {
					this._messageSeller();
				} else {
					$('.reply-form-container').addClass('hide');
				}
				$('.message-sent').removeClass('hide');
			}

			let $realPhone = $('.real-phone');
			$realPhone.text(window.btoa($realPhone.text()));

			$('.show-phone').on('click', function() {
				let realPhoneNumber = window.atob($realPhone.text());
				$('.hidden-phone').addClass('hide');
				$realPhone.html($('<a>', {
					"text": realPhoneNumber,
					"href": "tel:" + realPhoneNumber
				}));
				$realPhone.removeClass('hide');
				$('.show-phone').hide();
			});

			document.addEventListener('invalid', (function() {
				return function(e) {
					e.preventDefault();
				};
			})(), true);

			$('#vip-send-button').on('click', () => {
				this.validateForm();
			});

			$(".main-content").submit((e) => {
				e.preventDefault();
				if(this.validateForm()) {
					let message = $(".message-box-area").val();
					if($(".canned-checkbox").prop("checked") && message !== '') {
						message = $(".canned-message").html() + "\n" + message;
					}
					$('.message-box-area').val(this.cleanupValue(message));
					$('.name-box-area').val(this.cleanupValue($('.name-box-area').val()));
					$(".main-content")[0].submit();
				}
			});

			$(".email-box-area").on('change', (() => {
				let email = $('.email-box-area').val();
				if (!this.validateEmail(email)) {
					$('.fe-email-validation').removeClass('hide');
				} else {
					$('.fe-email-validation').addClass('hide');
				}
			}));

			$(".phone-box-area").on('change', (() => {
				let phone = $('.phone-box-area').val();
				if (!this.validatePhone(phone) && $('.phone-box-area').data('id') === true) {
					$('.fe-phone-validation').removeClass('hide');
				} else {
					$('.fe-phone-validation').addClass('hide');
				}
			}));

			$('.return-button').on('click', function() {
				$('.message-sent').addClass('hide');
			});

			$('.close-button').on('click', function() {
				$('.message-sent').addClass('hide');
			});

			$('.send-message-text').on('click', function() {
				$('.message-sent').addClass('hide');
				$('.reply-form-container').removeClass('hide');
				$('.message-box-area').focus();
				if ($(window).width() < 848) {
					$('.welcome-wrapper .email').trigger( 'click' );
				}
			});
		});

		$('.welcome-wrapper .email').on('click', () => {
			this._messageSeller();
		});

		$('.header-wrapper').on('click', '.inZoomMode', () => {
			this.backFromReplyFn();
		});
	}

	// Evalues email adress
	// SUPPORT
	// acounttamail@.domain.com && acounttamail@.domain.com.country
	validateEmail(email) {
		let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
		return regex.test(email);
	}

	// Evalues a phone number
	// SUPPORT
	// (123) 456 7899
	// (123).456.7899
	// (123)-456-7899
	// 123-456-7899
	// 123 456 7899
	// 1234567899
	validatePhone(phone) {
		let regex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/i;
		return regex.test(phone);
	}

	cleanupValue(value) {
		return JSON.parse(JSON.stringify(value));
	}

	// validate the fields in all form and end show warning messages of all invalid fields
	validateForm() {
		let errorStack = new Array();
		//Reset error messages
		$('.fe-message-validation').addClass('hide');
		$('.fe-email-validation').addClass('hide');
		$('.fe-phone-validation').addClass('hide');
		$('.fe-name-validation').addClass('hide');

		// beggin validate fields
		let message = $(".message-box-area").val();
		if($(".canned-checkbox").prop("checked") && message === '') {
			$(".message-box-area").val($(".canned-message").html());
		}

		if($(".message-box-area").val() === '') {
			$('.fe-message-validation').removeClass('hide');
			errorStack.push(false);
		}

		let name = $(".name-box-area").val();
		if(name === '') {
			$('.fe-name-validation').removeClass('hide');
			errorStack.push(false);
		} else {
			$('.fe-name-validation').addClass('hide');
		}

		let email = $('.email-box-area').val();
		if (!this.validateEmail(email)) {
			$('.fe-email-validation').removeClass('hide');
			errorStack.push(false);
		} else {
			$('.fe-email-validation').addClass('hide');
		}

		let phone = $('.phone-box-area').val();
		if (!this.validatePhone(phone) && $('.phone-box-area').data('id') === true) {
			$('.fe-phone-validation').removeClass('hide');
			errorStack.push(false);
		} else {
			$('.fe-phone-validation').addClass('hide');
		}

		// if no exist any error the length of object errorStack should be equal to 0
		// and return TRUE else length is diferent to 0 the result is FALSE
		return errorStack.length === 0;
	}

	_getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}

	_messageSeller() {
		$('body').addClass('stop-scrolling');
		let $replyForm = $('.reply-form');
		let $replyFormContainer = $('.reply-form-container');
		$('.header-wrapper').addClass('fixed-header hidden-search');
		$replyFormContainer.removeClass('desktop-only');
		$replyForm.addClass('fixed');
		this.$headerHeight = $('.header-wrapper').height();
		$replyForm.css('top', this.$headerHeight + 'px');
		$('.header-back-page').addClass('hidden');
		$('.header-back-component').removeClass('hidden');
	}

	backFromReplyFn() {
		$('body').removeClass('stop-scrolling');
		$('.header-wrapper').removeClass('fixed-header hidden-search');
		$('.reply-form-container').addClass('desktop-only');
		$('.reply-form').removeClass('fixed');
		$('.header-back-page').removeClass('hidden');
		$('.header-back-component').addClass('hidden');
		$('.message-sent').removeClass('mobile-only').addClass('hidden');
	}
}

module.exports = new replyForm ();
