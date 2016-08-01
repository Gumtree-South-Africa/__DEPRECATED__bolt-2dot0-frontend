'use strict';


(function() {
	$(document).ready(function() {

		$('.full-screen-smartbanner').css({'height': (($(window).height())) + 'px'});

		$(window).resize(function() {
           $('.full-screen-smartbanner').css({'height': (($(window).height())) + 'px'});
		});


		$('.mobile-site-link').on('click', function() {
           $('.full-screen-smartbanner').addClass('hide-banner');
           
		});


	});

})();


