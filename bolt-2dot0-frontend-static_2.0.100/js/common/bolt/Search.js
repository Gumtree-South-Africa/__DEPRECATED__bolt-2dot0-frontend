/**
 * @description Singleton that generates and initializes the Category and Location header dropdowns
 *     To be used as follows:  BOLT.SRP.SearchBar();
 * @namespace  BOLT.SRP
 * @class SearchBar
 */
var BOLT = BOLT || {};
BOLT.SRP = BOLT.SRP || {};
/** TO BE modified
 * @property ICON_CLASSES
 * @description Structure with the mapping for Icon Classes
 
 * @type JSON
 */
//var ICON_CLASSES = {
//    "-1": "icon-cat-all",
//    "1": "icon-cat-sale",
//    "4": "icon-cat-sale",
//    "20": "icon-cat-service",
//    "30": "icon-cat-house",
//    "36": "icon-cat-job",
//    "48": "icon-cat-travel",
//    "53": "icon-cat-edu",
//    "64": "icon-cat-car",
//    "5": "icon-cat-auto",
//    "2": "icon-cat-prop",
//    "8": "icon-cat-jobs",
//    "9": "icon-cat-services",
//    "6": "icon-cat-community",
//    "224": "icon-cat-party",
//    "9389": "icon-cat-jobseek",
//    "9175": "icon-cat-homegar",
//    "9178": "icon-cat-elect",
//    "9101": "icon-cat-boats",
//    "9171": "icon-cat-b2b",
//    "9176": "icon-cat-baby",
//    "9067": "icon-cat-event",
//    "9122": "icon-cat-pets",
//    "9124": "icon-cat-pets",
//    "8019": "icon-cat-pets",
//    "9177": "icon-cat-fashion",
//    "9179": "icon-cat-sports",
//    "9490": "icon-cat-sports",
//    "9218": "icon-cat-boats",
//    "9290": "icon-cat-jobseek",
//    "9237": "icon-cat-elect",
//    "9459": "icon-cat-baby",
//    "9541": "icon-cat-fashion"
//};
//
///* ---- Begin SearchBar Class ---- */
//searchbar_init = BOLT.SRP.SearchBar = function () {
//
//    /**
//     * @property UTILS
//     * @description Structure with some utility methods
//     * @private
//     * @type JSON
//     */
//    var UTILS = {
//        getCookie: function (name) {
//            var nameEQ = name + "=";
//            var ca = document.cookie.split(';');
//            for (var i = 0; i < ca.length; i++) {
//                var c = ca[i];
//                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
//                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
//            }
//            return null;
//        }
//    };
//
//
//
//    // Private Fields
//    var enableMenuAutoHide = !("ontouchstart" in window);
//
//    /**
//     * @method processClickEvent
//     * @description Handles the click event of a container based on a configuration object with multiple keys
//     * @private
//     * @param {Object} configObj Object with the configuration required in the format:
//     *     { eventObject : ..., eventSelectorStr : ..., anchorAttributeName : ..., hiddenField : ...,
//     *       labelObj : ..., ulObj : ..., getSelectObj : function () {}, methodExecute : function () {}  }
//     */
//    var processClickEvent = function (configObj) {
//        configObj.eventObject.on("click", configObj.eventSelectorStr, function () {
//            var $this = $(this);
//            // Find the select div for this element
//            var selectObj = configObj.getSelectObj($this);
//            var ulObj = configObj.ulObj;
//            var labelObj = configObj.labelObj;
//            var hiddenField = configObj.hiddenField;
//            var fieldValue = $this.attr(configObj.anchorAttributeName);
//
//            // Remove all active classes
//            selectObj.find(".active").removeClass("active");
//            $this.addClass("active");
//
//            // Find the input and apply the value
//            hiddenField.val(fieldValue === "-1" ? "" : fieldValue);
//
//            // Find the label and change the label value/text
//            if (labelObj.is('input')) {
//                labelObj.val($this.text());
//            } else {
//                labelObj.html($this.text());
//            }
//
//            // Execute method passed if available
//            if (configObj.methodExecute) {
//                configObj.methodExecute($this);
//            }
//
//            // Hide the container
//            if (enableMenuAutoHide) {
//                ulObj.hide();
//                setTimeout(function () {
//                    ulObj.removeAttr("style").removeClass("visible");
//                }, 300);
//            }
//
//            // imediately submit the form when user selects
//            // a category and there's no location selector
//            if (Bolt.Config.search.instantSearchEnabled) {
//                // category or location selection
//                //$this.parents('form').find("[name=locId]").val("");
//                var selectorsArr = ['a[data-id]', 'a[data-loc-id]'];
//                if (selectorsArr.indexOf(configObj.eventSelectorStr) !== -1) {
//                    $this.parents('form').submit();
//                }
//            }
//        });
//    };
//
//    // Definition of the actual functionality
//    /**
//     * @description A singleton class that implements the handling of creating the Category dropdown
//     * @class CategoryProcessor
//     */
//    var CategoryProcessor = (function () {
//        var $searchDiv = $(".search"),
//            $form = $searchDiv.find("form"),
//            ALL_CATEGORIES = $form.data("all-categories"),
//            SEARCH_CATEGORY = $form.data("search-category"),
//            $searchInput,
//            $catId,
//            $select,
//            $topUl,
//            $selectIcon,
//            $selectLabel;
//
//
//
//        return {
//            /**
//             * @method init
//             * @description Coordinates the set of method calls to create the Category dropdown tree and its
//             *     event handling.
//             * @private
//             */
//            init: function () {
//                // Check if there is a Category dropdown.
//                if ($("#catSelect").length > 0) {
//                    this.generateTree();
//                    this.renderUI();
//                    this.syncUI();
//                }
//            },
//
//            /**
//             * @method generateTree
//             * @description Calls a Tree builder class to build the Category dropdown links
//             * @private
//             */
//            generateTree: function () {
//                // Begin generating menu links for Category dropdown
//                var categoryData;
//                try{
//                    categoryData = JSON.parse($("#category-filter-json").html());
//                }catch(e){}
//                if (categoryData) {
//                    BOLT.SRP.HeaderFilterLinks({
//                        selectObj: $("#catSelect"),
//                        //
//                        assocFieldObj: $form.find("[name=catId]"),
//                        data: categoryData,
//                        text: {
//                            'allItems': ALL_CATEGORIES,
//                            'header': SEARCH_CATEGORY
//                        },
//                        //
//                        enableMenuAutoHide: enableMenuAutoHide,
//                        allItemsLinkId: "-1",
//                        methodForAnchor: function (anchorObj) {
//                            var catId = anchorObj.attr("data-id");
//
//                            // insert an element to hover easier over the links
//                            // hinders selection on tablet
//                            //$("<span />").addClass("easyhover").insertBefore(anchorObj);
//
//                            // append the icon
//                            if (ICON_CLASSES[catId]) {
//                                anchorObj.prepend($("<span />").addClass(ICON_CLASSES[catId]));
//
//                            }
//                        }
//                    });
//                }
//                // End menu links
//            },
//
//            /**
//             * @method renderUI
//             * @description Handles the initial DOM manipulations for this class
//             * @private
//             */
//            renderUI: function () {
//                $searchInput = $form.find("[type=search]");
//
//                $catId = $form.find("[name=catId]");
//                $select = $form.find("#catSelect.select");
//                $topUl = $select.children("ul");
//                $selectIcon = $select.children("a").children("[class*=icon-]").not(".icon-caret-down");
//                $selectLabel = $select.children("a").children(".label");
//
//            },
//
//            /**
//             * @method syncUI
//             * @description Handles the initial event manipulations for this class
//             * @private
//             */
//            syncUI: function () {
//                // Attach a click event on the search container
//                processClickEvent({
//                    eventObject : $searchDiv,
//                    eventSelectorStr : "a[data-id]",
//                    anchorAttributeName : "data-id",
//                    hiddenField : $catId,
//                    labelObj : $selectLabel,
//                    ulObj : $topUl,
//                    getSelectObj : function ($this) {
//                        return $this.parents(".select:first");
//                    },
//                    methodExecute : function ($this) {
//                        //console.log('methodExecute', $this);
//
//                        var parentCatId = $this.parents("ul:first").prev("a").attr("data-id") || $this.attr("data-id");
//                        $selectIcon.removeAttr("class").addClass(ICON_CLASSES[parentCatId]);
//                    }
//                });
//            }
//        }
//    })();
//
//    /**
//     * @description A singleton class that implements the handling of creating the Location dropdown
//     * @class LocationProcessor
//     */
//    var LocationProcessor = (function () {
//        var $form = $(".search form");
//        var LFT = window.LOCATION_FILTER_TITLES || {};
//        var $locationFilter,
//            $ul,
//            $locId,
//            $label,
//            $link,
//            currentLocId,
//            currentLocName;
//
//        return {
//            /**
//             * @method init
//             * @description Coordinates the set of method calls to create the Location dropdown tree and its
//             *     event handling.
//             * @private
//             */
//            init: function () {
//                // Check if there is a Location dropdown...
//                if ($("#searchbar-locFilter").length > 0) {
//                    this.generateTree();
//                    this.renderUI();
//                    this.syncUI();
//                    this.postProcessing();
//                }
//            },
//
//            /**
//             * @method generateTree
//             * @description Calls a Tree builder class to build the Category dropdown links
//             * @private
//             */
//            generateTree: function () {
//                // Begin generating menu links for Location dropdown
//                if (window.LOCATION_FILTER_JSON) {
//                    BOLT.SRP.HeaderFilterLinks({
//                        selectObj: $("#searchbar-locFilter"),
//                        assocFieldObj: $form.find("[name=locId]"),
//                        data: window.LOCATION_FILTER_JSON,
//                        text: {
//                            'allItems': LFT['all-locations']
//                        },
//                        enableMenuAutoHide: enableMenuAutoHide,
//                        allItemsLinkId: "",
//                        anchorAttributeName: "data-loc-id",
//                        appendAllItemsBefore: true
//                    });
//                }
//            },
//
//            /**
//             * @method renderUI
//             * @description Handles the initial DOM manipulations for this class
//             * @private
//             */
//            renderUI: function () {
//                $locationFilter = $form.find("#searchbar-locFilter");
//                $ul = $locationFilter.find("ul");
//                $locId = $form.find('[name=locId]');
//                $label = $locationFilter.find('input.label');
//                currentLocId = $locId.val();
//
//                if(!currentLocId){
//              	  currentLocId = parseInt(UTILS.getCookie("searchLocId"));
//              	  if (typeof currentLocId === "number" && !isNaN(currentLocId)){
//              		  $locId.val(currentLocId);
//              	  }
//                }
//            },
//
//            /**
//             * @method syncUI
//             * @description Handles the initial event manipulations for this class
//             * @private
//             */
//            syncUI: function () {
//                // Attach a click event on the location filter.
//                processClickEvent({
//                    eventObject : $locationFilter,
//                    eventSelectorStr : "a[data-loc-id]",
//                    anchorAttributeName : "data-loc-id",
//                    hiddenField : $locId,
//                    labelObj : $label,
//                    ulObj : $ul,
//                    getSelectObj : function () {
//                        return  $ul;
//                    }
//                });
//            },
//
//            /**
//             * @method postProcessing
//             * @description Finalizes the processing of the Location Dropdown creation
//             * @private
//             */
//            postProcessing: function () {
//                if (currentLocId) {
//                    //currentLocName = (UTILS.getCookie("searchLocName") || "").split('"').join(""),
//                    currentLocName = this.getLocalizedNameWithId(currentLocId),
//                        $link = $locationFilter.find("[data-loc-id=" + currentLocId + "]");
//
//                    /* Frontend devs need to refactor this one and the value should come from backend  */
//                    if (currentLocName === "South Africa" || currentLocName === "Ireland")
//                        currentLocName = "All " + currentLocName;
//                    if (currentLocName || $link.length > 0)
//                        $label.val(currentLocName || $link.text());
//                    if ($link.length > 0)
//                        $link.parentsUntil("#searchbar-locFilter").filter("li").addClass("active");
//                }
//            },
//
//            getLocalizedNameWithId: function (locId) {
//                // This is case for all locations
//                if (window.LOCATION_FILTER_JSON) {
//                    if (window.LOCATION_FILTER_JSON.id == locId) {
//                        return LFT['all-locations'];
//                        //return window.LOCATION_FILTER_JSON.localizedName;
//                    } else {
//                        this.searchChildNodes (locId, window.LOCATION_FILTER_JSON.children);
//                    }
//                } else {
//                    currentLocName = (UTILS.getCookie("searchLocName") || "").split('"').join("")
//                }
//            },
//
//            searchChildNodes: function(locId, childList) {
//                for (var i = 0; i < childList.length; i++) {
//                    var obj = childList[i];
//                    if (obj.id == locId) {
//                        return obj.localizedName;
//                    } else {
//                        this.searchChildNodes (locId, obj.children);
//                    }
//                }
//            }
//        };
//    })();
//
//    // Start the process to create the category and location trees.
//    CategoryProcessor.init();
//    LocationProcessor.init();
//};

// Function to be executed right away
(function () {
        //var $searchDiv = $(".search"),
         //   $form = $searchDiv.find("form"),
		//	$searchInput = $form.find("#tags"),
		//	$catId = $form.find("[name=catId]"),
		//	$select = $form.find("#catSelect"),
		//	$selectIcon = $select.children("a").children("[class*=icon-]").not(".icon-caret-down"),
		//	$placeHolder = $form.find('.placeholder');
		//	$selectIcon.removeClass().addClass( ICON_CLASSES[$catId.val() && $catId.val() != 0 ?$catId.val():-1] );
        //
        //$searchInput.prevAll( '.placeholder' ).on( 'click', function() {
		//	var $t = $( this );
		//	$t.hide();
		//	$searchInput.off( '.searchhint' ).on( 'blur.searchhint', function() {
		//		$t.show();
		//	}).focus();
		//});
        //
		//	// load explorer scripts if needed
		//if($(".lt-ie10").length > 0) {
		//	$searchInput
		//		.on("blur", function(){
		//			if($searchInput.val() === "")
		//				$searchInput.removeClass("opaque");
		//		})
		//		.on("focus", function(){
		//			$searchInput.addClass("opaque");
		//		});
		//	if($searchInput.val() !== "") {
		//		$searchInput.addClass("opaque");
         //   }
		//}

		//This code has to be moved from here. 
	    // ===============================================================
	    // Seller Badge for Desktop
	    // ===============================================================
	    if (!matchMedia('mobile')) {
	        $('.sellerBadge_icon a img[xsrc]').each(function() {
	            var $img_xsrc = $(this);
	            $img_xsrc.attr('src', $img_xsrc.attr('xsrc'));
	            $img_xsrc.removeAttr('xsrc');
	        });

            /*
            // For Urgent Ads
            // Check if we have a list view
            if ($(".results.list-view").length > 0) {
                // Switch the class name that shows the urgent image
                // there are diff. images for mobile and non-mobile
                $(".icon-urgent_label_mobile").each(function () {
                    $(this).removeClass("icon-urgent_label_mobile");
                    $(this).addClass("icon-urgent_label");
                });
            }
            */
	    } else {
	        $('.sellerBadge').css('display', 'none');
	    }

  })();