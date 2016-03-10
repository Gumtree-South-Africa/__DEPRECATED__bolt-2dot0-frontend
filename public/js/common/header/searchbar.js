/**
 * Created by moromero on 12/15/14.
 */

$(document).ready(function() {

    var $locationId,
        $locationName;

    /**
     * These are the classes of the categories that we'll be using when rendering the categories
     * @type {Object}
     */
    var CATEGORY_ICON_CLASSES = {
        "-1": { out:"icon-cat-all", over:"icon-cat-all-white" },
        "1": { out:"icon-cat-sale", over:"icon-cat-sale-white" },
        "2": { out:"icon-cat-prop", over:"icon-cat-prop-white" },
        "20": { out:"icon-cat-service", over:"icon-cat-service-white" },
        "224": { out:"icon-cat-party", over:"icon-cat-party-white" },
        "30": { out:"icon-cat-house", over:"icon-cat-house-white" },
        "36": { out:"icon-cat-job", over:"icon-cat-job-white" },
        "4": { out:"icon-cat-sale", over:"icon-cat-sale-white" },
        "48": { out:"icon-cat-travel", over:"icon-cat-travel-white" },
        "5": { out:"icon-cat-auto", over:"icon-cat-auto-white" },
        "53": { out:"icon-cat-edu", over:"icon-cat-edu-white" },
        "6": { out:"icon-cat-community", over:"icon-cat-community-white" },
        "64": { out:"icon-cat-car", over:"icon-cat-car-white" },
        "8": { out:"icon-cat-jobs", over:"icon-cat-jobs-white" },
        "8019": { out:"icon-cat-pets", over:"icon-cat-pets-white" },
        "9": { out:"icon-cat-services", over:"icon-cat-services-white" },
        "9067": { out:"icon-cat-event", over:"icon-cat-event-white" },
        "9101": { out:"icon-cat-boats", over:"icon-cat-boats-white" },
        "9122": { out:"icon-cat-pets", over:"icon-cat-pets-white" },
        "9124": { out:"icon-cat-pets", over:"icon-cat-pets-white" },
        "9171": { out:"icon-cat-b2b", over:"icon-cat-b2b-white" },
        "9175": { out:"icon-cat-homegar", over:"icon-cat-homegar-white" },
        "9176": { out:"icon-cat-baby", over:"icon-cat-baby-white" },
        "9177": { out:"icon-cat-fashion", over:"icon-cat-fashion-white" },
        "9178": { out:"icon-cat-elect", over:"icon-cat-elect-white" },
        "9179": { out:"icon-cat-sports", over:"icon-cat-sports-white" },
        "9218": { out:"icon-cat-boats", over:"icon-cat-boats-white" },
        "9237": { out:"icon-cat-elect", over:"icon-cat-elect-white" },
        "9290": { out:"icon-cat-jobseek", over:"icon-cat-jobseek-white" },
        "9389": { out:"icon-cat-jobseek", over:"icon-cat-jobseek-white" },
        "9459": { out:"icon-cat-baby", over:"icon-cat-baby-white" },
        "9490": { out:"icon-cat-entertainment", over:"icon-cat-entertainment-white" },
        "9541": { out:"icon-cat-fashion", over:"icon-cat-fashion-white" },
        "9672": { out:"icon-cat-antiques", over:"icon-cat-antiques-white" },
        "9690": { out:"icon-cat-beauty", over:"icon-cat-beauty-white" },
        "9706": { out:"icon-cat-sports", over:"icon-cat-sports-white" }
    };

    var $searchbar = $(".searchbar");

    if ($searchbar.length === 0)
        return;

    function isTrue(value){
        return !!(value || "").toString().match(/yes|true|1/gi);
    }

    var $searchForm = $searchbar.find("form"),
        instantSearch = isTrue($searchForm.data("instantSearch")),
        isIE = $(".ie8,.ie9").length > 0;
    /**
     * We have to render the categories and locations based on the JSON provided by backend
     */
    function getListSize(size){
        var prefix = "size-";
        if(size > 30) return prefix + "xl";
        if(size > 20) return prefix + "l";
        if(size > 10) return prefix + "m";
        return prefix + "s";
    }
    function $getList(nodes){
        if(!nodes || !nodes.children || nodes.children.length === 0)
            return;
        var $ul = $("<ul />").addClass( getListSize(nodes.children.length) );
        $.each(nodes.children, function(i, node){
            $ul.append($getNode(node));
        });
        return $ul;
    }
    function $getNode(node){
        var iconCls = CATEGORY_ICON_CLASSES[(node.id||"").toString()];
        return $("<li />")
            .append(
            $("<a />")
                .data("id",node.id || 0)
                .attr({ href:"javascript:void(0);" })
                .append( iconCls ? ('<span class="icon"><span class="out ' + iconCls.out + '" /><span class="over ' + iconCls.over + '" /></span>') : null )
                .append($.trim(node.localizedName) || "Undefined")
        )
            .append( $getList(node) );
    }
    $(".searchbar script[type*=plain]").each(function(){
        var $this = $(this),
            root = $this.html();

        try{
            root = JSON.parse(root);
        }catch(e){ return; }

        var $parent = $this.parent(),
            $rootList = $getList(root),
            allLabel = $this.siblings("input").data("all") || root.localizedName;

        if(allLabel){
            var iconCls = CATEGORY_ICON_CLASSES[(root.id||"").toString()];
            $rootList.prepend(
                $("<li />").append(
                    $("<a />").attr({ href:"javascript:void(0)" })
                        .data("id", root.id || "")
                        .append( iconCls ? ('<span class="icon"><span class="out ' + iconCls.out + '" /><span class="over ' + iconCls.over + '" /></span>') : null )
                        .html( allLabel )
                )
            );
        }

        $parent.children("ul").remove();
        $parent.append( $("<div />").addClass("options").append($rootList) );
    });

    function setLocationCookies() {
        var locationId = $searchbar.find("input[name=locId]").val();
        var locationName = $searchbar.find(".options li a.active").text();
        Bolt.Cookie.setHardCookie("searchLocId", locationId);
        Bolt.Cookie.setHardCookie("searchLocName", encodeURIComponent(locationName));  
    }

    /**
     * On header inputs, we need to add an active class when the user focuses on the input
     * to activate sub-menus
     */
    $searchbar
        .on("focus", "input,button", function(){
            $(this)
                .parent()
                .addClass("active")
                .siblings();
        })
        .on("blur", "input,button", function(){
            $(this)
                .parent()
                .removeClass("active");
        })
        // Added in 2.0
        .on("click", "button", function() {
            setLocationCookies();
            $searchForm.submit();
        })
        // End added
        .on("mouseover", "fieldset > div", function(){
            var $this = $(this);
            $this
                .find(".options")
                .removeAttr("style");
            $this
                .siblings()
                .removeClass("active");

            // Code to set the active class when instant submit is enabled.
           if(instantSearch){
                var value = $this.find('input').val(),
                    $lis = $this.find(".options ul").first().children();

                $.each($lis, function(i, node){
                    var $anchorTag = $(node).find('a').first();
                    if($anchorTag.text() === value) {
                        $anchorTag.addClass ('active');
                        return false;
                    }
                });
            }
        })
        // we need to prevent the selection on touch devices to allow
        // the user to display the submenu
        .on("touchstart", ".options a", function(event){
            var $link = $(this),
                $children = $link.siblings("ul");
            if($children.length > 0 && !$children.is(":visible")){
                $link.data("preventSelection", true);
                setTimeout(function(){ $link.data("preventSelection", null); }, 500);
            }
        })
        .on("click", ".options a", function(){
            var $link = $(this);
            if($link.data("preventSelection"))
                return;
            var $options = $link.closest(".options"),
                $activePanel = $options.parent();

            $options.siblings(":input[type=text]").val($link.text());
            $options.siblings(":hidden").val($link.data("id"));
            // we need to hide the panel once the selection has been made
            $activePanel.removeClass('active');

            //Remove any active class from previous selection
            $options.find("a").removeClass('active');
            $link.addClass ('active');

            // this hides the options menu after a click has been performed
            //----
            $options.hide();
            setTimeout(function(){ $options.removeAttr("style"); }, 500);
            //----

            if(instantSearch){

                //the below if statement is a support of placeholder polyfill for IE
                var $inputSearch = $(".wrap > form").find("input[name=q]");
                if($inputSearch.val() == '') {
                    $inputSearch.val('');
                }

                setLocationCookies();
                $options.closest("form").submit();
            }

            // this is a fix for IE when the category changes
            // and the placeholder text disappears
            if(isIE){
                $searchbar.find(".keyword input").focus().blur();
                setTimeout(function(){
                    var $catInput = $searchbar.find(".category input");
                    if($catInput.val() == "")
                        $catInput.val( $catInput.attr("data-placeholder-value") );
                }, 500);
            }
            // replace cat input icon with selected branch icon
            setIconClass(findIconClass($link));
        });


    // Manage icons
    function _initIcons(){
        var catId = $("[name=catId]").val();
        if(catId !== ""){
            $("li a").each(function(){
                if($(this).data("id") == catId){
                    setIconClass(findIconClass($(this)));
                };
            })
        }
    }
    function findIconClass($icon) {
        if ($icon.find(".icon .out").length > 1)
            return CATEGORY_ICON_CLASSES[-1].out;
        if ($icon.find(".icon .out").length == 1)
            return $icon.find(".icon .out").prop("class");
        else
            return findIconClass($icon.parent());
    }
    function setIconClass(icon){
        $(".category .icon.main-icon span").prop("class",icon);
    }
    _initIcons();

    /*
     * ========================================================================================================
     * AUTO COMPLETE ==========================================================================================
     * ========================================================================================================
     */
    /**
     * This will generate an autocomplete field into the search box (or where it gets applied)
     * <br /><br /><br />
     * This autocomplete expects a restful response with the following format:
     *  {
     *      autoCompletContentList: [
     *          { keyword: "", seoUrl:"", displayText:"", catId:0, locId:0, localizedCatName:"" },
     *          ...
     *      ],
     *      localizedInWord: "in"
     *  }
     *
     * @constructor
     * @param   {Object}    config                                      The configuration of the object
     * @param   {string}    config.selector                             The selector of the field where the display will be submitted
     * @param   {string}    config.api                                  The url of the api where we'll be sending requests. User {catId}, {locId}, and {value} in the URL to replace the values. For example: mydomain.com/api/{catId}/{locId}/{value}
     * @param   {number}    [config.minLength=2]                        The minimum length of keyword that the user needs to type for the autocomplete to be activated
     * @param   {boolean}   [config.savedSearch=true]                   Boolean flag indicating if we should save searches
     * @param   {boolean}   [config.animated=true]                      Show animation when opening
     * @param   {number}    [config.maxItems=0]                         The number of maximum items to display. Use 0 if you want all the results.
     * @param   {string}    [config.clearMessage="Clear Searches"]      The localized message to display to clear the recent searches
     * @param   {string}    [config.highlight=true]                     Flag indicating if we need to highlight the entered keyword
     * @param   {number}    [config.delay=300]                          The delay before we call the autocomplete api
     * @param   {boolean}   [config.cache=true]                         Cache the results on the browser (and avoid calling api again)
     * @param   {number|string|Function}    [config.catId=-1]           The category ID or the function to obtain the category ID
     * @param   {number|string|Function}    [config.locId=-1]           The location ID or the function to obtain the location ID
     * @param   {number}    [config.maxSavedSearches=10]                The maximum number of searches to save display in the list
     * @param   {number}    [config.maxStoredSavedSearches=500]         The total number of saved searches to save in the user's local storage
     * @example
     *  new AutoComplete({ selector:".my-class" });
     */
    function AutoComplete(config){

        config = $.extend({
            maxItems: 0,
            selector: "",
            savedSearch: true,
            autoComplete: true,
            animated: true,
            delay: 500,
            cache: true,
            catId: -1,
            locId: -1,
            clearMessage: "Clear Searches",
            maxSavedSearches: 10,
            maxStoredSavedSearches: 500,
            highlight: true,
            minLength: 2
        }, config);

        /**
         * Need to make sure we support HTML5 local storage for saved searches
         * @type {boolean}
         */
        config.savedSearch = config.savedSearch && "localStorage" in window;

        if(!config.selector || (!config.savedSearch && !config.autoComplete))
            return;

        var $autocomplete = $("<div />").addClass("autocomplete"),
            cache = {},
            $input = $(config.selector),
            timeoutId;

        $autocomplete.on("mouseover", "a", function(){
            highlightItem.call(this, $autocomplete, $input, event, config);
        }).on("click", "a", function(event){
            selectItem.call(this, $autocomplete, $input, event, config);
        });

        $input.parent().append($autocomplete);

        $input
            .on("blur", function(event){
                setTimeout(function(){
                    hideAutocomplete($autocomplete);
                }, 1000);
                event.stopPropagation();
            })
            .on("keyup", function(event){

                if(timeoutId)
                    clearTimeout(timeoutId);

                switch(event.keyCode){
                    case 9:
                        // do nothing on blur
                        break;
                    case 38:
                        highlightPrevItem.call(this, $autocomplete, $input, event);
                        break;
                    case 40:
                        highlightNextItem.call(this, $autocomplete, $input, event);
                        break;
                    case 13:
                        selectItem.call(this, $autocomplete, $input, event, config);
                        break;
                    case 27:
                        hideAutocomplete.call(this, $autocomplete);
                        break;
                    default:

                        var value = $.trim($input.val());

                        if(value.length >= config.minLength){
                            var scope = this;
                            timeoutId = setTimeout(function(){

                                $autocomplete.empty();

                                var url = config.api,
                                    catId, locId;

                                if(typeof config.catId === "number" || typeof config.catId === "string")
                                    catId = config.catId;
                                else
                                    catId = config.catId();

                                if(typeof config.locId === "number" || typeof config.locId === "string")
                                    locId = config.locId;
                                else
                                    locId = config.locId();

                                /**
                                 * Need to ensure that the value is in the URL
                                 */
                                if(url.indexOf("{value}") === -1)
                                    url += "{value}";

                                if(value === "") {
                                    hideAutocomplete($autocomplete);
                                }
                                else if(cache[value + catId + locId]) {
                                    populateResults.call(scope, $autocomplete, $input, cache[value + catId + locId], config, value);
                                }
                                else {
                                    ajaxCallUrl = url.split("{catId}").join(catId).split("{locId}").join(locId).split("{value}").join(value);
                                    $.getJSON(ajaxCallUrl, function(response){
                                        // append the "in" word to each of the results
                                        if(response.localizedInWord)
                                            $.each(response.autoCompletContentList, function(i, result){
                                            this.localizedInWord = response.localizedInWord;
                                        });
                                        /**
                                         * Save the response in the local JS cache
                                         */
                                        if(config.cache)
                                            cache[value + catId + locId] = response;
                                        populateResults.call(scope, $autocomplete, $input, response, config, value);
                                    });
                                }

                            }, config.delay);
                        }

                }
            });

    }

    function selectItem($autocomplete, $input, event, config){

        var $this = $autocomplete.children(".active");

        if($this.length === 0)
            $this = $(this);

        if($this.hasClass("clear")){

            $autocomplete.show().children(".saved,.clear").slideUp("fast", function(){
                $(this).remove();
            });
            $autocomplete.children(":first-child").addClass('active');
            clearSavedSearches();
            event.preventDefault();

        }else{

            var data = $this.data("result");
            if(config.savedSearch)
                addToSavedSearches(data, config);
            hideAutocomplete($autocomplete);
            $input.val( data.displayText.replace(getCatReplacementRegExp(data), "") );
            //if(data.seoUrl){
            //    event.preventDefault();
            //    window.location.href = data.seoUrl;
            //}

        }

    }



    function highlightItem($autocomplete, $input, event){
        $(this).addClass("active").siblings().removeClass("active");
    }



    function highlightNextItem($autocomplete, $input, event){
        var $a = $autocomplete.show().children(".active").next();
        if($a.length === 0)
            $a = $autocomplete.children(":first-child");
        $a.addClass("active").siblings().removeClass("active");
        event.preventDefault();
    }


    function highlightPrevItem($autocomplete, $input, event){
        var $a = $autocomplete.show().children(".active").prev();
        if($a.length === 0)
            $a = $autocomplete.children(":last-child");
        $a.addClass("active").siblings().removeClass("active");
        event.preventDefault();
    }

    function clearSavedSearches(){
        window.localStorage.removeItem("savedSearches");
    }

    function getSavedSearches(){
        try{
            var list = JSON.parse(window.localStorage.getItem("savedSearches") || "[]");
            $.each(list, function(i, item){ item.saved = true; });
            return list;
        }catch(e){
            return [];
        }
    }

    function addToSavedSearches(result, config){
        if(!result)
            return;
        var savedSearches = getSavedSearches(),
            newSavedSearches = [];
        $.each(savedSearches, function(i, item){
            if(item.seoUrl !== result.seoUrl)
                newSavedSearches.push(item);
        });
        newSavedSearches.unshift(result);
        newSavedSearches.splice(config.maxStoredSavedSearches);
        try{
            window.localStorage.setItem("savedSearches", JSON.stringify(newSavedSearches));
        }catch(e){}
    }

    function hideAutocomplete($autocomplete){
        setTimeout(function(){
            $autocomplete.hide();
        }, 50);
    }


    function getCatReplacementRegExp(record){
        return new RegExp("((\\s*" + record.localizedInWord + "\\s*)?" + record.localizedCatName + ")","gi");
    }

    function populateResults($autocomplete, $input, response, config, value){

        var keywordReg = new RegExp("(" + value + ")", "gi"),
            allResults = (response || {}).autoCompletContentList || [],
            savedSearches, found = 0;

        if(config.savedSearch){
            savedSearches = getSavedSearches();
            $.each(savedSearches, function(i, saved){
                if(found > config.maxSavedSearches)
                    return false;
                if(saved.displayText.match(keywordReg)){
                    allResults.push(saved);
                    found++;
                }
            });
        }

        $.each(allResults, function(i, result){
            if(config.maxItems !== 0 && i > config.maxItems)
                return false;
            var text = result.displayText;
            if(config.highlight)
                text = text.replace(keywordReg, "<b>$1</b>").replace(getCatReplacementRegExp(result), "<i>$1</i>");
            $autocomplete.append( $("<a />").addClass(result.saved ? "saved" : "").data("result", result).attr({ href:result.seoUrl }).html(text) );
        });

        if(savedSearches && savedSearches.length > 0)
            $autocomplete.append( $("<a />").addClass("clear").html(config.clearMessage) );

        $autocomplete[ allResults.length > 0 ? "show" : "hide" ]();
    }


    var formData = $searchForm.data(),
        $catId = $searchbar.find("input[name=catId]"),
        $locId = $searchbar.find("input[name=locId]"),

        /**
         * Create the instance on the page
         * @instance
         * @type {AutoComplete}
         */
        autocomplete = new AutoComplete({
            clearMessage: formData.clearSearchesMessage,
            selector: $searchbar.find(".keyword input"),
            api: formData.autoCompleteApi,
            savedSearch: isTrue(formData.savedSearch),
            autoComplete: isTrue(formData.autoComplete),
            catId: function(){
                return $catId.val() || 0;
            },
            locId: function(){
                return $locId.val() || 0;
            }
        });
    /*
     * ========================================================================================================
     * / AUTO COMPLETE ========================================================================================
     * ========================================================================================================
     */
















    /*
     * ========================================================================================================
     * GEO-LOCATION ===========================================================================================
     * ========================================================================================================
     */
    var geoFeatureSupported = window.navigator.geolocation && "getCurrentPosition" in window.navigator.geolocation;

    /**
     * This geolocator class will attach a handler on the page to locate the user
     * @constructor
     */
    function GeoLocator(config){

        var scope = this;
        function freezeBody(toFraze)
        {
            if(toFraze)
            {
                $("body").css('overflow','hidden');
                $("body").css('position','fixed');
            }
            else
            {
                $("body").css('overflow','');
                $("body").css('position','');
            }
        }
        this.config = $.extend({
            geoApi: "",
            rootApi: "",
            value: -1,
            allLocationsLabel: "Entire Country"
        }, config);

        this.prompt = function(success){
            if(geoFeatureSupported)
                navigator.geolocation.getCurrentPosition(function(pos){

                    var coords = pos.coords || {};

                    //some mexico city location (for testing)
                    //coords = { latitude:19.4284700, longitude:-99.1276600 };

                    var url = typeof scope.config.geoApi === "string" ? scope.config.geoApi : scope.config.geoApi(coords.latitude, coords.longitude);

                    $.getJSON(url, function(resp){
                        if(resp && resp.locationId && resp.locationName)
                            success(resp.locationId, resp.locationName.split(">").pop().replace(/^\s*/,'', "prompt"));
                    });
                });
        };


        this.select = function(success) {
            var $overlay = $("body .location-selector"),
                value;

            $overlay.removeClass("hide");
            if (!$overlay.hasClass("geo-locator-selector")) {
                $overlay.addClass("geo-locator-selector");
                $overlay.on("click", function(){
                        scope.close();
                    })
                    .on("click", "div", function(event){
                        event.stopPropagation();
                    })
                    .on("click", "a", function(){
                        var $this = $(this),
                            data = $this.data();
                        $this.addClass("active").siblings().removeClass("active");
                        $overlay.addClass("hide");
                        success(data.id, data.name);
                    })

                freezeBody(true);
            }

            value = typeof scope.config.value === "string" || typeof scope.config.value === "number" ? scope.config.value : scope.config.value();

            $overlay.find("a").each(function() {
                var $a = $(this);
                var id = $a.data("id"); 
                if(id == value) {
                    $a.addClass("active");
                }
            });
        };

        this.close = function(){
            freezeBody(false);
            $('body > .geo-locator-selector').fadeOut("fast", function(){
                $(this).remove();
            });
        };

    }

    function saveSelection(locationId, locationName, prompted) {
        Bolt.Cookie.setHardCookie("searchLocId", locationId);
        Bolt.Cookie.setHardCookie("searchLocName", encodeURIComponent(locationName));
        $locationId.val(locationId);
        $locationName.text(locationName);

        geoLocator.close();
        if (!prompted && instantSearch) {
            $searchForm.submit();
        }
    }

    var $geoLocator = $(".geo-locator");

    if ($geoLocator.is(":visible")){
            var geoLocatorData = $geoLocator.data();

            $locationId = $searchbar.find("input[name=locId]"),
            $locationName = $geoLocator.find(".label"),
            locationId = Bolt.Cookie.getHardCookie("searchLocId"),

            geoLocator = new GeoLocator({
                rootApi: geoLocatorData.rootApi,         
                geoApi: function(lat, lng){
                    return geoLocatorData.geoApi.split("{lat}").join(lat).split("{lng}").join(lng);
                },
                value: function(){
                    return $locationId.val();
                },
                allLocationsLabel: geoLocatorData.allLocations
            });


        $searchbar.on("click", ".geo-locator", function() {
            geoLocator.select(saveSelection);
        });

        if(locationId){
            $locationId.val(locationId);
        }else if(!!document.cookie && !Bolt.Cookie.getHardCookie("promptGeo")){
            geoLocator.prompt(saveSelection);
            Bolt.Cookie.setHardCookie("promptGeo", true);
        }

    }
    /*
     * ========================================================================================================
     * / GEO-LOCATION =========================================================================================
     * ========================================================================================================
     */

});


