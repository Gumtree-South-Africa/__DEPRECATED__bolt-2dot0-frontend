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
				}

				$('.reply-form-container').addClass('hide');
				$('.message-sent').removeClass('hide');
			}

			let $realPhone = $('.real-phone');
			$realPhone.text(window.btoa($realPhone.text()));

			$('.show-phone').on('click', function() {
				$('.hidden-phone').addClass('hide');
				$realPhone.text(window.atob($realPhone.text()));
				$realPhone.removeClass('hide');
				$('.show-phone').hide();
			});

			/* Convert checkbox value on/off to true/false */
			$('.is-send-me-copy-email').on('click', function(e) {
				$("input[name='isSendMeCopyEmail']").val($(e.currentTarget).prop("checked"));
			});

			document.addEventListener('invalid', (function() {
				return function(e) {
					e.preventDefault();
				};
			})(), true);

			$('#vip-send-button').on('click', function() {
				$('.fe-message-validation').addClass('hide');

				if($(".canned-checkbox").prop("checked")){
					$(".message-box-area").val($(".canned-message").html());
				}

				if($(".message-box-area").val() === ''){
					$('.fe-message-validation').removeClass('hide');
					return;
				}

				if ($('.email-box-area').val() === '') {
					$('.fe-email-validation').removeClass('hide');
					return;
				} else {
					$('.fe-email-validation').addClass('hide');
				}

				if ($('.phone-box-area').val() === '' && $('.phone-box-area').data('id') === true) {
					$('.fe-phone-validation').removeClass('hide');
					return;
				} else {
					$('.fe-phone-validation').addClass('hide');
				}

				let $originalMessage = JSON.parse(JSON.stringify($('.message-box-area').val()));
				let $finalMessage = $originalMessage;
				$('.canned-checkbox:checkbox:checked').each(function() {
					$finalMessage = $finalMessage + ' ' + $(this).data('id');
				});

				$('.message-box-area').val($finalMessage);
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

		$('.header-wrapper').on('click', '.inZoomMode', () => {
			this.backFromReplyFn();
		});
	}

	_getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}

	_messageSeller() {
		let $replyForm = $('.reply-form');
		let $replyFormContainer = $('.reply-form-container');
		$('.header-wrapper').addClass('fixed-header hidden-search');
		$replyFormContainer.removeClass('desktop-only');
		$replyForm.addClass('fixed');
		this.$headerHeight = $('.header-wrapper').height();
		$replyForm.css('top', this.$headerHeight + 'px');
		$('.zoomT, .inZoomMode').removeClass('hidden');
	}

	backFromReplyFn() {
		$('.header-wrapper').removeClass('fixed-header hidden-search');
		$('.reply-form-container').addClass('desktop-only');
		$('.reply-form').removeClass('fixed');
		$('.zoomT, .inZoomMode').addClass('hidden');
	}
}

module.exports = new replyForm ();
