"use strict";

// @todo:
// All these are required, place them in the require block dependency [] list.

var jQuery = jQuery || {};
var Bolt = Bolt || {};
var BOLT = BOLT || {};
BOLT.UTILS = BOLT.UTILS || {};
BOLT.StringUtils = BOLT.StringUtils || {};

(function() {
    var cookieBannerID;

	function revealUrl(obfuscateUrl){
		return BOLT.StringUtils.rot13(obfuscateUrl);
	}

	var headerToggleInteraction = ("ontouchstart" in window || matchMedia("mobile")) && !matchMedia("desktop");

	/**
	 * Hide the sign in link on the header when the cursor is on the navigation
	 */
	if (!headerToggleInteraction) {
		$(function() {
			var $header = $(".header"),
				$signin = $header.find(".signin");
			$header.on("mouseover", ".nav", function(){
				$signin.hide();
			}).on("mouseout", ".nav", function(){
				$signin.removeAttr("style");
			});
		});
	}

	/**
	 * Prevent the link to be redirected when touch devices exist.
	 * The link will only be used as a toggler
	 */
	if (headerToggleInteraction) {
		$(function(){
			var $header = $(".header"),
				$nav = $header.find(".nav");
			$nav.addClass("untouched").find(".profile a").on("click", function(event){
				$nav.toggleClass("touched untouched");
				event.preventDefault();
				event.stopPropagation();
			});
			$header.find(".signin").css({ marginRight:"5em" });
		});
	}

	$(".sudo-link-toConvert").each(function() {
		var $this = $(this),
			unmaskedUrl = "";

		if (!!$this.data("o-uri-back")) {
			unmaskedUrl = revealUrl($this.data("o-uri-back")) + "?redirect=" + window.location.href;
			$this.removeAttr("data-o-uri-back");
		} else {
			unmaskedUrl = revealUrl($this.data("o-uri"));
			$this.removeAttr("data-o-uri");
		}
		
		if (unmaskedUrl) {
			$this.attr("href",unmaskedUrl);
			
			if (!!$this.data("target")) {
				$this.attr("target",$this.data("target"));
				$this.removeAttr("data-target");
			}
			//create new A tag
			var $newTag = $("<a></a>").append($this.contents().clone());
			$.each(this.attributes, function(i, attrib) {
				$newTag.attr(attrib.name, attrib.value);
			});
			$this.replaceWith($newTag);
		}
	});

	$("body")

		//elements with 'data-gtm' -events are taken care in  tracking handler ( Analytics.js). It will track first and trigger the 'event' again
		.on("click", "[data-o-uri]:not([data-gtm])", function(){
			

			var unmaskedUrl = revealUrl($(this).attr("data-o-uri"));
			if (unmaskedUrl) {
				if ("_blank" === $(this).attr("data-target")) {
					window.open(unmaskedUrl);
				}
				else {
					window.location = unmaskedUrl;
                    return false;
				}
			}
		})

		// enable obscrued links on header
		.on("click", "[data-uri]", function(){
			window.location.href = $(this).attr("data-uri");
			return false;
		});


        $(function() {
			$(".ng-cloak").removeClass("ng-cloak");
		});



	BOLT.UTILS.Cookie = (function () {
        return {
            readCookie: function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(";");
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === " ") {
                    	c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                    	return c.substring(nameEQ.length, c.length);
                    }
                }
                return null;
            },
            setCookie: function (cookieName,cookieValue,nDays) {
                var today = new Date();
                var expire = new Date();

                if (nDays === null || nDays === 0) {
                	nDays=1;
                }

                expire.setTime(today.getTime() + 3600000*24*nDays);

                document.cookie = cookieName + "=" + escape(cookieValue) +
                    ";expires="+expire.toGMTString() + ";path=/";
            }
        };
    })();

	BOLT.UTILS.formatNumber = function(number,places){
		/*

		BOLT.UTILS.formatNumber

		<p><b>BOLT.UTILS.formatNumber</b> uses the values set in rui_messages_*.properties to place
			decimal and placeholder values and returns a string representation. The values
			are added to the BOLT object in Html.html.</p>

		<p>if we add a locale (such as india) with non consistent grouping placeholders
			(e.g. 12,11,111.00) addSeparator will need to be revisited.</p>

		<p>numbers that render in scientific format on toString (outside of 1e(+/-)21) break
			this. If you need it for these really large numbers revisit getWholePart</p>

		<p>The <a href="https://github.com/jquery/globalize">globalize</a> would help, but it's 1.8k</p>

		@param number {float|string} The number to format
		@param places {string|int} The number of places
		 */

		number = parseFloat(number) || 0;
		places = parseInt(places) || 0;

		var decimal = Bolt.DECIMAL,
			placeholder = Bolt.PLACEHOLDER;

		return "" + getWholePart() + decimal + getDecimalPart();

		function getDecimalPart(){
			var num = number.toFixed(places);
			num = num.substring(num.length-places,num.length);
			return num;
		}

		function getWholePart(){
			var wp = Math.floor(number),
				bwp = wp.toString().split("").reverse().join("");
			wp = bwp.replace(/([0-9]{3})/g,"$1" + placeholder).split("").reverse();
			if (wp[0] === placeholder) {
				wp.shift();
			}
			return wp.join("");
		}

	};

	// update the input with the machine id
	$("input[name=machineId]").val(BOLT.UTILS.Cookie.readCookie("machguid"));

    // Banner Cookie code.
    cookieBannerID = "cookieWarning";
    if (BOLT.BannerCookie && Bolt.COUNTRY && ($.inArray(Bolt.COUNTRY.toUpperCase(), ["IE", "PL"]) !== -1)) {
        BOLT.BannerCookie.visit("cookieBanner", cookieBannerID, 3);
    }

})();
