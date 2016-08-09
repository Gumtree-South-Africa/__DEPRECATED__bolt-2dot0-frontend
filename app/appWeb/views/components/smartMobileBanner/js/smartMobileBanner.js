'use strict';


(function() {


	$(document).ready(function() {
		var $window = $(window);
		var windowWidth = $window.width();

		$('.full-screen-smartbanner').css({'height': (($window).height()) + 'px'});

		$window.resize(function() {

			if ($window.width() !== windowWidth) {
				
				windowWidth = $window.width();

				$('.full-screen-smartbanner').css({'height': (($window).height()) + 'px'});

			}

		});


		$('.mobile-site-link').on('click', function() {
			$('.full-screen-smartbanner').addClass('hide-banner');

		});


	});

})();


