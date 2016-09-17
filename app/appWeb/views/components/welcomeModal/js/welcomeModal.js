'use strict';

let initialize = () => {

	$(document).ready(() => {

		function getCookie(cname) {
			let name = cname + "=";
			let ca = document.cookie.split(';'); //cookie array
			for (let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) === 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		}

		if (getCookie('alreadyVisited') === "") {
			document.cookie = 'alreadyVisited=true';
			$('.modal-wrapper .modal').css('display', 'block');
			$('.viewport').addClass('modal-open');
		}


		$('.modal-wrapper .modal-close-section').on('click', function() {
			$('.modal-wrapper .modal').fadeOut('slow', function() {
				$(this).removeClass('modal');
				$('.welcome-footer').css('display', 'block');
				$('.viewport').removeClass('modal-open');
			});
		});


	});
};

module.exports = {
	initialize
};
