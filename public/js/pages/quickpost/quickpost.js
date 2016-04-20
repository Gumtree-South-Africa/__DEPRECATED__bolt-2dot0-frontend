var BOLT = BOLT || {};

/**
 * @description A singleton class that implements the handling of the Quickpost page
 * @namespace BOLT
 * @class QuickPostPage
 */
BOLT.QuickPostPage = (function() {
    var GMapObj = BOLT.MapLatLong;
    var catMobileSelObj = null;

   /**
    * @method openMap
    * @description Opens a Gmap region
    * @private
    */
    function openMap() {
        if (!openMap.opened) {
            $("#map_canvas_wrapper").slideDown("slow");
        } else {
            $("#map_canvas_wrapper").slideUp("slow", function() {
                // var latlongData = GMapObj.getLatLong();
                setMapCoords(GMapObj.getLatLong());
            });
        }
        openMap.opened = !openMap.opened;
    }
    openMap.opened = false;

   /**
    * @method setMapCoords
    * @description Sets the Gmap coordinates
    * @param {Object} latlongData
    * @private
    */
    function setMapCoords(latlongData) {
    	$("#latitude").val(latlongData.lat);
    	$("#longitude").val(latlongData.long);
    	$("#address").val(latlongData.address);
    	$("#location").val(latlongData.address);
	}

   /**
    * @method mobileCategorySelector
    * @description Selects a Category from the Mobile Selector/Menu
    * @private
    */
    function mobileCategorySelector() {
    	if (typeof Bolt === "undefined" || typeof BOLT === "undefined") {
    		return false;
    	}

        var PAC = BOLT.POSTAD.MobileItemSelector || undefined;
        var pageMode;
        var mobileCatConfig = {
            title: Bolt._postFormMsgs.selectCategoryLabel || "",
            searchPlaceholder: Bolt._postFormMsgs.categorySearchPlaceholder || "",
            highlightItemOnNewPanel: false,
            selectors: {
                menuContainer: "#cat-list",
                mobileContainer: "#mobileCats",
                basePanel: ".base-panel",
                itemListPanel: ".item-list"
            }
        };

        if (typeof PAC !== "undefined" && $("#mobileCats").length > 0) {
            if (!catMobileSelObj) {
                catMobileSelObj = new PAC();
            }
        }

        if (catMobileSelObj.hasRendered()) {
            $("#catSelector").show();
            $("#mobileCats").show();
            $("#cat-list").trigger("MobileListNodesReady");
            return;
        }

        pageMode = {
            idEdit: false,
            isPreview: false,
            isSimilarAd: false
        };

        if (catMobileSelObj) {
            catMobileSelObj.init(mobileCatConfig, pageMode);
        }
    }


    // Public methods
    return {

        /**
         * @method init
         * @description Handles the initial state
         * @public
         */
        init: function() {
        	mobileCategorySelector();
        	this.syncUI();
            this.tooltip();
            this.charCount();
            this.toggleSwitchUpdate();
            this.getData();
            this.populate();
        },

        /**
         * @method syncUI
         * @description Handles the initial EVENT manipulations for this class
         * @public
         */
        syncUI : function () {
            $("#maps-link").click(openMap);

            $(document).on("applyLocation", function(e, latlongData) {
            	setMapCoords(latlongData);
            });

            // Listener to update the category Id when the user selects a category.
            $(document).on("MobileLeafReached", function(e, obj) {
                if (catMobileSelObj === obj.currentInstance) {
                    window.setTimeout(function() {
                        $("#mobileCats .base-panel-container > ul > li").removeClass("mm-hidden");

                        // Set the Category name
                        $("#mobileCats .base-panel .initial-label").text(obj.label);
                    }, 100);

                    // Set the Category Id in a hidden var.
                    $("input[name=Category]").val(obj.id);

                    // Re-run validation on the category hidden field.
                    $("input[name=Category]").valid();
                }
            });
        },

        tooltip: function(){
          $('.description .icon-contextual-info').on('click', function(){
            $('.floating-tooltip').css('display', 'block');
          })
          $('.tooltip-wrapper .icon-gl-message-close').on('click', function(){
            $('.floating-tooltip').css('display', 'none');
          })
        },

        charCount: function(){
            $('.description').on('keyup', function(){
                $('#description-char-count').text(4096 - $('#Description').val().length);
            })
        },

        toggleSwitchUpdate: function(){
          $('.toggleswitch input[type=checkbox]').on('change', function(){
            var isToggleSwitchOn = $(this).is(':checked');
            if(isToggleSwitchOn){
              $('input[name=switch]').val('YES');
            }
            else{
              $('input[name=switch]').val('NO');
            }
          });
        },
        getData : function(){
    			$('#location').on('keyup', function(){
              var htmlElt = '';
    					$.ajax({
    							url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&address=' + $('#location').val(),
    							dataType: 'JSON',
    							type: 'GET',
    							success: function(resp){
    									if (resp.results instanceof Array) {
                          $('#autocompleteField').html('');
                          $('#autocompleteField').removeClass('hiddenElt');
    											for (var idx=0; idx<resp.results.length; idx++) {
    													var address = resp.results[idx].formatted_address;
    													var latitude = resp.results[idx].geometry.location.lat;
    													var longitude = resp.results[idx].geometry.location.lng;
                              htmlElt += '<div class="ac-field" data-long='+longitude+' data-lat='+latitude+'>'+ address +'</div>';
    											}
                          $('#autocompleteField').append(htmlElt);
    									}
    							}
    					})
    				})
    			},

          populate: function(){
              $('#autocompleteField').on('click', '.ac-field', function(){
                var $this = $(this);
              $('#location').val($this.html());
              $('#autocompleteField').addClass('hiddenElt');
              $('#longitude').val($this.attr('data-long'));
              $('#latitude').val($this.attr('data-lat'));
              $('#address').val($this.html());
            })
          }
    };

})(); // Ends singleton

// Start the page main JS.
$(document).ready(function() {
	BOLT.QuickPostPage.init();
});
