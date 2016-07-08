'use strict';


let initialize = () => {

$(document).ready(() => {
	
	function getCookie(cname) {
	    var name = cname + "=";
	    var ca = document.cookie.split(';'); //cookie array
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
		    $('.modal-wrapper .modal').css('display', 'block');
        }	
	
	
		$('.modal-wrapper .modal-close-section').on('click', function(){
             $('.modal-wrapper .modal').fadeOut('slow', function() {
		         $(this).removeClass('modal');
		         $('.modal-footer').css('display', 'block');
	         });
		 });



     });
 };

module.exports = {
initialize
};
