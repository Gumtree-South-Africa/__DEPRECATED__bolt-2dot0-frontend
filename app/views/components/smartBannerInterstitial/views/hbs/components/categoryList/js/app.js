"use strict";

/*
requirejs.config({
    paths: {}
});
*/

require([/* Dependencies */], function () {
    var app = {
        initialize: function () {
            // BEGIN Code from CategoryList.js (BOLT 1.0)

		    $("li.all-label").click(function(){
				window.location.href = $(this).parent().siblings("a.toggler").get(0).href;
			});

			$(".allCategories").on("click", function(){
				$("ul.category-list, .icon-gl-message-close, .catText").css("display", "block");
				$(this).css("display", "none").addClass("showLess");
			});
			
			$(".category-wrapper .icon-gl-message-close").on("click", function(){
				$(".allCategories").css("display", "inline-block").removeClass("showLess");
				$(this).css("display", "none");
				$("ul.category-list, .catText").css("display", "none");
			});
			
			$(".ver-all").on("click", function(){
				$(this).toggleClass("displayMore");
				$(this).siblings(".displayMore").removeClass("displayMore");
				$(this).toggleClass("displayMoreDeskTop");
				$(this).siblings(".displayMoreDeskTop").removeClass("displayMoreDeskTop");
			});
			
			$(".homepagewrapper .icon-close_icon").on("click", function(){		
			    $(".homepagewrapper").remove(); 
			});

			// allow expand and collapse of
			// L2 categories on homepage
			// on mobile resolutions
			
			$(".content").on("click", "a.toggler", function(ev){
				var $this = $(this),
			    $ul = $this.next("ul");
				
				if( $this.find("span.arrow ").is(":visible") === false ) {  
				   return true;
				}
				
						
				if($ul.hasClass("visible")){
					$ul.css({ overflow:"hidden" });
			   	    $ul.removeClass("visible").removeAttr("style");
					$this.find("span.icon-caret-down").removeClass("icon-caret-down").addClass("icon-caret-right");
				}else{
					$ul.css({ overflow:"hidden" });
					$ul.addClass("visible").removeAttr("style");
					$this.find("span.icon-caret-right").removeClass("icon-caret-right").addClass("icon-caret-down");
				}	

				ev.preventDefault();
				ev.stopPropagation();
			});

            // END Code from CategoryList.js (BOLT 1.0)

        }
    };

    app.initialize();

});
