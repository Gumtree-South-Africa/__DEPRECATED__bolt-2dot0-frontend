// 'use strict';
//
// let initialize = () => {
// 	//TODO btoa atob the number
// 	$(document).ready(() => {
// 		let $realPhone = $('.real-phone').text();
// 		let $encodedPhone = window.btoa($realPhone);
// 		$('.real-phone').text($encodedPhone);
//
// 		$('.show-phone').on('click', function() {
// 			$('.hidden-phone').addClass('hide');
// 			$('.real-phone').removeClass('hide');
// 			$('.show-phone').addClass('hide');
// 			$('.real-phone').text(window.atob($encodedPhone));
// 		});
//
// 		$('#vip-send-button').on('click', function() {
// 			$('.reply-form-container').addClass('hide');
// 			$('.message-sent').removeClass('hide');
// 		});
//
// 		$('.return-button').on('click', function() {
// 			$('.message-sent').addClass('hide');
// 		});
//
// 		$('.close-button').on('click', function() {
// 			$('.message-sent').addClass('hide');
// 		});
// 	});
// };
//
// module.exports = {
// 	initialize
// };

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
		let $replyFormContainer = $('.reply-form-container');
		let $offsetTop = 190;
		$('.header-wrapper').addClass('fix');
		$replyFormContainer.removeClass('desktop-only');
		$("html,body").animate({ scrollTop: $replyFormContainer.offset().top - $offsetTop }, "fast");
	}
}

module.exports = new replyForm ();
