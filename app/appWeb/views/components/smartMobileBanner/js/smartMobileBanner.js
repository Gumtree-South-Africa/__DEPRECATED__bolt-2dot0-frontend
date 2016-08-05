'use strict';


(function() {
	$(document).ready(function() {
	
		$('.full-screen-smartbanner').css({'height': (($(window).height())) + 'px'});

		$(window).resize(function() {

		    if (typeof $('.full-screen-smartbanner').attr("oldwidth") === 'undefined') { 
	            $('.full-screen-smartbanner').attr("oldwidth", $(window).width());
	    	}
		    if ($(window).width() !==$('.full-screen-smartbanner').attr("oldwidth")) {
	            $('.full-screen-smartbanner').css({'height': (($(window).height())) + 'px'});
	            $('.full-screen-smartbanner').attr("oldwidth", $(window).width());
		    }
		});

		$('.mobile-site-link').on('click', function() {
           $('.full-screen-smartbanner').addClass('hide-banner');
           
		});
	});
})();


