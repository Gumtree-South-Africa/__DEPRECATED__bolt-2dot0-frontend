'use strict';


let $ = require('jquery');



let initialize = () => {

$(document).ready(() => {
	  
		function getCookie(cname) {
		    var name = cname + "=";
		    var ca = document.cookie.split(';');
		    for(var i = 0; i <ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') {
		            c = c.substring(1);
		        }
		        if (c.indexOf(name) == 0) {
		            return c.substring(name.length,c.length);
		        }
		    }
		    return "";
		 }
		
		
		    if (getCookie('alreadyVisited') == "") { 
			    document.cookie = 'alreadyVisited=true';
                $('.modal').css('display', 'block');
			    $('.stickybottom').css('bottom','1em'); 
		    }

			$('.close , #myModal').on('click', function(){
	            $('.panel-wrapper').css('display', 'none');
		        $('.modal').fadeOut('slow', function() {
		         $(this).removeClass('modal');
		       });
			 });
			
			$(window).scroll(function() {
				  if($(window).scrollTop() + $(window).height() == $(document).height()) {
				      $('.stickybottom').css('bottom','1em'); 
				  }
				   
				  else {
				      $('.stickybottom').css('bottom','0'); 
				   }
			});

});
};

module.exports = {
initialize
};
