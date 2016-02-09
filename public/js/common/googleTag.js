/**
 * Created by moromero on 1/7/14.
 *
 * Fakes the _gaq tag from google to prevent us from
 * loading their script. Only if users call the native
 * google method _gaq.cmd.push (used to track hits),
 * only then will the method load the google script.
 *
 * Further, we can disable tracking on the page by
 * triggering the event:
 * $(window).trigger("preventgoogletrack");
 *
 * (an example would be when we prompt the user to
 * redirect to m.site and avoid user's tracking)
 */


// setup the global Google variables (if they haven't been set)
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

// sandbox this function
(function($){


	// need jQuery to continue
	if(typeof $ === "undefined")
		return;

	var $window = $(window),
		googleTrackPrevented;


	function enableAds(){
		googleTrackPrevented = false;
	}

	function disableAds(){
		googleTrackPrevented = true;
	}

	function performGoogleAds() {
		if(googletag.cmd.length && googletag.cmd.length > 0)
			$.getScript((('https:' == document.location.protocol) ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js');
	}


	// bind the events to the window
	$window
		.on("preventgoogleads disablegoogleads", disableAds)
		.on("enablegoogleads", enableAds)
		.on("googleads", performGoogleAds);




	// bind an onLoad event to trigger tracking
	$(function(){
		if(!googleTrackPrevented)
			$window.trigger("googleads");
	});


})(window.jQuery);
