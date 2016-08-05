'use strict';


(function() {
	$(document).ready(function() {
	
		$('.full-screen-smartbanner').css({'height': (($(window).height())) + 'px'});
		
		let checkw = null;

		$(window).resize(function() {
			
			let w = $(window).width();
		    if (typeof checkw === 'undefined') { 
		    	checkw = w; 
	    	}
		    if (w!==checkw) {
	            $('.full-screen-smartbanner').css({'height': (($(window).height())) + 'px'});
		        checkw = w;
		    }
		});


		$('.mobile-site-link').on('click', function() {
           $('.full-screen-smartbanner').addClass('hide-banner');
           
		});


	});

})();


