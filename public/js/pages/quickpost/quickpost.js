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
            $('#map_canvas_wrapper').slideDown('slow');
        } else {
            $('#map_canvas_wrapper').slideUp('slow', function() {
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
    	$('#latitude').val(latlongData.lat);
    	$('#longitude').val(latlongData.long);
    	$('#address').val(latlongData.address);
    	$('#location').val(latlongData.address);
	}

   /**
    * @method mobileCategorySelector
    * @description Selects a Category from the Mobile Selector/Menu
    * @private
    */
    function mobileCategorySelector() {
    	if (typeof Bolt === 'undefined' || typeof BOLT === 'undefined') {
    		return false;
    	}

        var PAC = BOLT.POSTAD.MobileItemSelector || undefined;
        var pageMode;
        var mobileCatConfig = {
            title: Bolt._postFormMsgs.selectCategoryLabel || '',
            searchPlaceholder: Bolt._postFormMsgs.categorySearchPlaceholder || '',
            highlightItemOnNewPanel: false,
            selectors: {
                menuContainer: '#cat-list',
                mobileContainer: '#mobileCats',
                basePanel: '.base-panel',
                itemListPanel: '.item-list'
            }
        };

        if (typeof PAC !== 'undefined' && $('#mobileCats').length > 0) {
            if (!catMobileSelObj) {
                catMobileSelObj = new PAC();
            }
        }

        if (catMobileSelObj.hasRendered()) {
            $('#catSelector').show();
            $('#mobileCats').show();
            $('#cat-list').trigger('MobileListNodesReady');
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
            this.validDesc();
            this.validPrice();
            this.validLoc();
            this.categorySelector();
            this.currencySelector();
            this.toggleSwitchUpdate();
            this.geoMap();
            this.autoComplete();
            this.autoCompletePopulate();
            this.registerUnloadEvent();
            this.clearForm();
        },

        /**
         * @method syncUI
         * @description Handles the initial EVENT manipulations for this class
         * @public
         */
        syncUI : function () {
            $('#postForm').submit(function () {
                window.skipOnBeforeUnload = true;
            });

            $('#window').load = this.clearForm();
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
        
        
         validDesc: function(){
        	$('.description').on('focusout keyup', function(){
        		
    	    		setTimeout(function(){
    	    			var x = $('#Description').hasClass("valid"),
    	    		   desclabelIcon= $('.description').find('.icon-validation-check');
    	                if(x)
    	                	desclabelIcon.css('display', 'inline-block');
    	                else
    	                	desclabelIcon.css('display', 'none');
    	    		}, 100);
        		
                });
            },

           validPrice: function(){
               $('.price-field').on('focusout keyup', function(){
            	
            	   setTimeout(function(){ 
            		var labelIcon= $(".price").find('.icon-validation-check');
            		 if($('#Price').val().length >0 &&  $('#Price').val().length<10)	
    					 labelIcon.css('display', 'inline-block');
    				 else 
    			   	    labelIcon.css('display', 'none');
            	   }, 100);  
    			});
            },
  
            
        validLoc: function(){
           $('#Location').on('focusout keyup', function(){
        	   
        	   setTimeout(function(){ 
        		var labelIcon= $(".select-location").find('.icon-validation-check');
				 if($('#Location').hasClass( "valid"))
					 labelIcon.css('display', 'inline-block');
				 else
					 labelIcon.css('display', 'none');
        	   }, 100);  
			});
        },

        categorySelector: function(){
            // Listener to update the category Id when the user selects a category.
            $(document).on('MobileLeafReached', function(e, obj) {
                if (catMobileSelObj === obj.currentInstance) {
                    window.setTimeout(function() {
                        $('#mobileCats .base-panel-container > ul > li').removeClass('mm-hidden');

                        // Set the Category name
                        $('#mobileCats .base-panel .initial-label').text(obj.label);
                    }, 100);

                    // Set the Category Id in a hidden var.
                    $('input[name=Category]').val(obj.id);

                    // Re-run validation on the category hidden field.
                    $('input[name=Category]').valid();
                }
            });
        },

        currencySelector: function(){
            var selectedOption,
                currency = document.getElementById('currencyOptions');

            if(currency != undefined) {
                // Listener to update the currency when the user selects a currency.
                $('#currencyOptions').change( function() {
                    selectedOption = currency[currency.selectedIndex].value;

                    // Set the currency Id in a hidden var.
                    $('input[name=SelectedCurrency]').val(selectedOption);
                });

                if (($('input[name=SelectedCurrency]').val() == '') || ($('input[name=SelectedCurrency]').val() == null)) {
                    selectedOption = currency[currency.selectedIndex].value;

                    $('input[name=SelectedCurrency]').val(selectedOption);
                }
                else { //There is a pre-selected value
                    $('#currencyOptions').val($('input[name=SelectedCurrency]').val()); // Select that option in the dropdown
                }
            }
        },

        toggleSwitchUpdate: function(){
            $('.toggleswitch input[type=checkbox]').on('change', function(){
                var isToggleSwitchOn = $(this).is(':checked');
                if(isToggleSwitchOn){
                    $('input[name=switch]').val('YES');
                    $('#switchBtn').addClass('checked');
                }
                else{
                    $('input[name=switch]').val('NO');
                    $('#switchBtn').removeClass('checked');
                }
            });
        },

        geoMap: function(){
            $('#maps-link').click(openMap);

            $(document).on('applyLocation', function(e, latlongData) {
                setMapCoords(latlongData);
            });
        },

        autoComplete : function(){
            $('#Location').on('keyup', function(){
                var htmlElt = '';
                    $.ajax({
                        url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&address=' + $('#Location').val(),
                        dataType: 'JSON',
                        type: 'GET',
                        success: function(resp){
                            if (resp.results instanceof Array) {
                                $('#autocompleteField').html('');
                                if (resp.results.length > 0) {
                                    $('#autocompleteField').removeClass('hiddenElt');
                                    for (var idx = 0; idx < resp.results.length; idx++) {
                                        var address = resp.results[idx].formatted_address;
                                        var latitude = resp.results[idx].geometry.location.lat;
                                        var longitude = resp.results[idx].geometry.location.lng;
                                        htmlElt += '<div class="ac-field" data-long=' + longitude + ' data-lat=' + latitude + '>' + address + '</div>';
                                    }
                                    $('#autocompleteField').append(htmlElt);
                                }
                                else {
                                    $('#autocompleteField').addClass('hiddenElt');
                                }
                            }
                        }
                    })
            })
        },

        autoCompletePopulate: function(){
            $('#autocompleteField').on('click', '.ac-field', function(){
                var $this = $(this);
                $('#autocompleteField').addClass('hiddenElt');
                $('#longitude').val($this.attr('data-long'));
                $('#latitude').val($this.attr('data-lat'));
                $('#address').val($this.html());
                $('#Location').val($this.html());
            })

            $(':not(#autocompleteField)').on('click', function(e){
                $('#autocompleteField').addClass('hiddenElt');
            })
        },

        registerUnloadEvent: function(){
            window.onbeforeunload = function() {
                if (window.skipOnBeforeUnload) {
                    return;
                }
                return '';
            };
        },

        clearForm: function(){
            $(window).bind('pageshow', function() {
                var $postForm = $('#postForm');
                $postForm.reset();

                if ($('#formError').value == false) {
                    var elements = $postForm.elements;
                    for (var i = 0, element; element = elements[i++];) {
                        if (element.type === 'hidden' && element.val() !== '') {
                            if (element.id == 'SelectedCurrency') continue;
                            element.val('');
                        }
                    }
                }
            });
        }
    };

})(); // Ends singleton

// Start the page main JS.
$(document).ready(function() {
	BOLT.QuickPostPage.init();
});
