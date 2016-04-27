// jshint ignore: start

/**** ********************  BOLT.POSTAD.MobileItemSelector *******************
 /**
 * @description Definition a Singleton implementing the selector of an item from a list following the Mobile design pattern
 *     To be used as follows: BOLT.POSTAD.MobileItemSelector.<methodName>();
 * @namespace BOLT.POSTAD
 * @class MobileItemSelector
 * @author uroblesmellin@
 */

var BOLT = BOLT || {};
BOLT.POSTAD = BOLT.POSTAD || {};

// Mini jQuery plugin to  add an "X" to clear out the field contents in a text field.
(function ($, undefined) {
    $.fn.clearable = function () {
        var $txtField = this, $clearObj;
        $txtField.wrap('<div class="clear-holder" />');
        $clearObj = $('<span class="clear-entry icon-close-autocomp"></span>');
        $txtField.parent().append($clearObj);

        // Handles clicking on "x"
        $clearObj.click(function() {
            $txtField.val("").change().removeClass("x");
            $clearObj.hide();
        });

        // Handles entering anything in the text field
        $txtField.on('input', function () {
            if (this.value !== "") {
                $(this).addClass("x");
                $(this).removeClass("icon-search-autocomp");
                $clearObj.show();
            } else {
                $clearObj.hide();
                $(this).removeClass("x");
                $(this).addClass("icon-search-autocomp");
            }
        });
    };
})(jQuery);

/**
 * @description An object with various methods that work to make a list of items mobile friendly.
 * @namespace BOLT.POSTAD
 * @class MobileItemSelector
 * @public
 * @type Object|JSON
 */
(function (PA) {  // BOLT.POSTAD
    /**
     * @description A singleton class that implements handling the Mobile Rendering of a List of Items
     * @namespace BOLT.POSTAD
     * @class MobileItemSelector
     */
   (function () {
        var currentItemPathLabel = "";
        var currentItemId = -1;
        var currentInstance = null;

        // Structure to keep a reference of all instances of this class
        var classInstances = {};

        // @todo: change
        var defaultMenuHtml =
                 '<nav id="mmenu-template-list">'
               + '    <div>'
               + '        <div class="base-panel-container">'
               + '            <ul>'
               + '                <li><span class="mm-arrow base-panel" href="#"><span>TEMPLATE</span></span></li>'
               + '            </ul>'
               + '        </div>'
               + '    </div>'
               + '    <div class="item-list Panel"></div>'
               + '</nav>';

       var removeLastFromBreadcrumb = function(origStr, delimiter) {
           var arr = origStr.split(delimiter), newStr = "";
           arr.pop();
           arr.pop();
           newStr = arr.join(delimiter);
           if (newStr !== "") {
               newStr = arr.join(delimiter) + " &gt; ";
           }
           return newStr;
       };


       // ****************
        // Private Methods
        // ****************
        var _PrivateObj = function () {
            // Get a hold of the current object instance
            var pubscope = this;

            // A private set of methods that can have access to public instance vars.
            return {
                /**
                 * @method openPanel
                 * @description Opens the next panel.
                 * @private
                 */
                openPanel: function () {
                    $(".viewport .header").hide();
                    $(".viewport .footer").hide();
                    $(pubscope.mobileContainerSel).addClass("active");
                    $panel = $(pubscope.mobileItemListSel);

                    pubscope.api.openPanel($panel);
                    $panel.find("li").removeClass("hide");
                    $panel.find("li a").removeClass("hide");
                    $panel.find("li a[data-target]").remove();
                    $panel.find("a").removeClass("highlight");

                    this.highlightCurrentSelItem();
                    pubscope.hasMenuRendered = true;

                    pubscope.panelTitles = [ (pubscope.config.title || "")];
                    $(pubscope.mobileContainerSel).find(".mm-navbar-top-1 a.mm-title").text(pubscope.panelTitles[pubscope.panelTitles.length - 1]);
                },

                /**
                 * @method openSpecificPanel
                 * @description Opens a specific panel.
                 * @param {Object} $panel The panel object to oppen
                 * @param {Boolean} addtitleToQueue Determines if the title should be added to the lists of titles (for the breadcrumb)
                 * @private
                 */
                openSpecificPanel: function ($panel, addTitleToQueue) {
                    $(pubscope.mobileContainerSel).addClass("active");

                    pubscope.api.openPanel($panel);
                    $panel.find("li").removeClass("hide");
                    $panel.find("li a").removeClass("hide");
                    $panel.find("li a[data-target]").remove();

                    pubscope.$lastOpenedPanel = $panel;
                    if (addTitleToQueue) {
                        pubscope.panelTitles.push($(pubscope.mobileContainerSel).find(".mm-navbar-top-1 a.mm-title").text());
                    }
                },

                /**
                 * @method closePanel
                 * @description Closes all the panels, goes back to default mode
                 * @private
                 */
                closePanel: function () {
                    pubscope.api.closeAllPanels();
                    pubscope.api.update();
                    $(pubscope.mobileContainerSel).removeClass("active");
                    $(".viewport .header").show();
                    $(".viewport .footer").show();

                    if (pubscope.breadCrumbSel) {
                        $(pubscope.breadCrumbSel).html(pubscope.currentItemPathLabel);
                    }
                },

                /**
                 * @method highlightCurrentSelItem
                 * @description Highlights the current active row
                 * @private
                 */
                highlightCurrentSelItem: function () {
                    var $currentRow = null;
                    if (pubscope.currentItemId !== -1) {
                        window.setTimeout(function () {
                            if (pubscope.$rowFocused) {
                                pubscope.$rowFocused.removeClass("highlight");
                            }

                            $currentRow = $("li.nav-item[data-id='" + pubscope.currentItemId + "'] a");
                            $currentRow.addClass("highlight");
                            pubscope.$rowFocused = $currentRow;

                            if ($currentRow && $currentRow.length > 0) {
                                $('html, body').animate({
                                    scrollTop: $currentRow.offset().top - 50
                                }, 1000);
                            }

                        }, 500);
                    }
                },

                /**
                 * @method unhighlightAllItems
                 * @description Un-highlights all selected items.
                 * @private
                 */
                unhighlightAllItems : function () {
                    $(pubscope.mobileItemListSel).nextAll().remove();
                    $(pubscope.mobileItemListSel).find("li a").removeClass("hide");
                    $(pubscope.mobileItemListSel).find("li a[data-target]").remove();
                },

                /**
                 * @method initialize
                 * @description  Initializes building the widget
                 * @private
                 */
                initialize: function () {
                    //  this.selectors = $.extend(true, this.selectors, config.selectors);
                    this.renderUI();
                    this.syncUI();
                },

                /**
                 * @method resetPanelLinks
                 * @description Resets all the links inside all the panels.
                 * @private
                 */
                resetPanelLinks : function () {
                        $(pubscope.mobileItemListSel).find("ul.selMenu").addClass("mm-listview").addClass("mm-first");
                        $(pubscope.mobileItemListSel).find('span.item-text').replaceWith(function () {
                            var id = $(this).parent().data("id");
                            // var isLeaf = $(this).parent().data("leaf");
                            var parentId =  $(this).parent().closest("li").data("id");
                            var text = $.trim($(this).text()), iconHTML = "";
                            if ($(this).find('.icon').length > 0 && $(this).find('.icon')[0]) {
                                iconHTML = $(this).find('.icon')[0].outerHTML || "";
                            }
                            /*
                            if (isLeaf) {
                                return '<a href="#" class="' + (iconHTML !== "" ? ' item-icon' : '') + '">' + iconHTML + text + '</a>';
                            }
                            */
                            return '<a href="#" class="mm-arrow' + (iconHTML !== "" ? ' item-icon' : '') + '">' + iconHTML + text + '</a>';
                        });
                },

                /**
                 * @method renderUI
                 * @description Handles the initial DOM manipulations for this class
                 * @private
                 */
                renderUI: function () {
                    this.resetPanelLinks();

                    var navBars = [
                        {
                            content: ["prev", "title", "next"]
                        }
                    ];

                    var isSearchPresent = (typeof pubscope.config.search === "undefined" || pubscope.config.search === true);
                    // Modigy the navigation bars if the search field should be present
                    if (isSearchPresent) {
                        navBars.push({
                            content: [ "searchfield" ]
                        });
                    }

                    // Create the actual menu object
                    pubscope.menuObj = $(pubscope.menuContainerSel)
                        .mmenu({
                            offCanvas: false,

                            extensions: ["effect-slide-menu", "theme-white"],

                            navbar: {
                                title: pubscope.config.title,
                                titleLink: "none"
                            },

                            navbars: navBars,

                            searchfield: {
                                add: isSearchPresent,
                                addTo: pubscope.mobileItemListSel,
                                placeholder: pubscope.config.searchPlaceholder || "",
                                // noResults: pubscope.config.noResultsLabel || "",
                                showSubPanels: false,
                                showTextItems: false
                            },

                            onClick: {
                                setSelected: true
                            }
                        });

                    // Get a hold to the mmenu plugin API object.
                    pubscope.api = $(pubscope.menuContainerSel).data("mmenu");
                },

                /**
                 * @method syncUI
                 * @description Handles the initial event manipulations for this class
                 * @private
                 */
                syncUI: function () {
                    var scope = this;
                    var $menuItems = $(pubscope.menuContainerSel).find('li.nav-item[data-id] a');
                    var $Mmenu, newMenuHTML, panelTitle;

                    $(pubscope.menuContainerSel).find(".mm-prev").click(function (e) {
                        e.stopPropagation();

                        try {
                            // $(pubscope.menuContainerSel).find(".mm-panel a").removeClass("highlight");
                            $(pubscope.menuContainerSel).find(".mm-panel li").removeClass("hide");
                            $(pubscope.menuContainerSel).find(".mm-panel li a").removeClass("hide");
                            $(pubscope.menuContainerSel).find(".mm-panel li a[data-target]").remove();

                            // Delete all the following panels.
                            if (pubscope.$lastOpenedPanel) {
                                $prevPanel = pubscope.$lastOpenedPanel.prev(".mm-panel");

                                $prevPanel.nextAll().each(function () {
                                    pubscope.api.closePanel($(this));
                                    $(this).remove();
                                });

                                pubscope.panelTitles.pop();
                                scope.openSpecificPanel($prevPanel, false);
                                pubscope.currentItemPathLabel = removeLastFromBreadcrumb(pubscope.currentItemPathLabel, "&gt;");
                                $(pubscope.breadCrumbSel).html(pubscope.currentItemPathLabel);

                                pubscope.$lastOpenedPanel = $prevPanel;
                                pubscope.$lastOpenedPanel.find("a").removeClass("highlight");
                            } else {
                                // Remove the last panel title
                                pubscope.panelTitles.pop();
                            }

                        } catch (e) {
                            console.log("ERROR DETECTED CLICKING PREV!: ");
                            console.log(e)
                        }

                        window.setTimeout(function () {
                            $(pubscope.mobileContainerSel).find(".mm-navbar-top-1 a.mm-title").text(pubscope.panelTitles[pubscope.panelTitles.length-1]);
                        }, 10);
                    });

                    $(pubscope.menuContainerSel).unbind("RefreshMobileList");
                    $(pubscope.menuContainerSel).bind("RefreshMobileList", function (e) {
                        var $currentItem;
                        $(pubscope.mobileItemListSel).removeAttr("id").find("li").removeClass("hide");
                        $(pubscope.mobileItemListSel).find("a").removeClass("mm-next");

                        $(pubscope.mobileItemListSel).find(".nav-cont").removeClass("listview")
                            .removeClass("mm-listview").removeClass("mm-first");

                        // Go to the highest level menu, get the html
                        $Mmenu =  $(pubscope.menuContainerSel).find('.item-list ul.nav-cont').first();
                        $MmenuAux = $Mmenu;

                        // $currentItem = $Mmenu.find("a.mm-arrow.highlight").first();
                        $currentItem = $Mmenu.find("a.highlight").first();
                        if (!$currentItem.length) {
                            $currentItem = pubscope.$rowFocused;
                        }

                        try {
                            $nextElem = $MmenuAux.parent().next();
                            $MmenuAux = $nextElem.find("ul.nav-cont").first();
                            if ($currentItem && $currentItem.length) {
                                $currentItem.after($MmenuAux);
                            }

                            $nextElem.remove();
                            newMenuHTML = $Mmenu.html();
                            $Mmenu.remove();

                            // Reset the container for the menu with the template
                            $(pubscope.mobileContainerSel).find(".body").html(defaultMenuHtml);

                            // Change the DOM ID of the menu template to the correct one.
                            $(pubscope.mobileContainerSel).find("#mmenu-template-list").attr("id", pubscope.menuContainerSel.substring(1));

                            // Change the default menu title (label)
                            $(pubscope.mobileContainerSel).find(".mm-arrow base-panel > span").text(pubscope.config.title);

                            $(pubscope.mobileItemListSel).html('<ul class="nav-cont selMenu">' + newMenuHTML + '</ul>');

                            scope.renderUI();
                            scope.syncUI();

                            $panelToOpen = $(pubscope.menuContainerSel).find("div.mm-panel").last();

                            if ($panelToOpen.length) {
                                scope.openSpecificPanel($panelToOpen, true);
                            }


                        } catch (e) {
                            console.log("ERROR DETECTED in RefreshMobileList!: ");
                            console.log(e);
                        }
                    });

                    $(pubscope.menuContainerSel).bind("UpdateMobileListInstance", function (e, itemObj) {
                        e.stopPropagation();
                        pubscope.currentItemPathLabel = itemObj.label;
                        pubscope.currentItemId = itemObj.id;
                    });

                    $(pubscope.menuContainerSel).bind("MobileListViewOpen", function (e) {
                        e.stopPropagation();

                        if (pubscope.config.highlightItemOnNewPanel) {
                            scope.highlightCurrentSelItem();
                        } else {
                            scope.unhighlightAllItems();
                            scope.renderUI();
                            scope.syncUI();
                        }
                    });

                    $(pubscope.menuContainerSel).bind("MobileListNodesReady", function (e) {
                        e.stopPropagation();
                        scope.openPanel();
                    });

                    $(pubscope.menuContainerSel).on('click', pubscope.basePanelSel, function (e) {
                        e.stopPropagation();
                        scope.openPanel();
                    });

                    $(pubscope.menuContainerSel).on('click', 'li.nav-item[data-id] a', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        var $this = $(this);
                        var id = $this.parent().data("id");
                        var isLeaf = $this.parent().data("leaf");
                        var parentId =  $this.parent().closest("li").data("id");
                        var text = $.trim($this.text());

                        if (pubscope.$rowFocused) {
                            pubscope.$rowFocused.removeClass("highlight");
                        }
                        $this.addClass("highlight");
                        pubscope.$rowFocused = $this;

                        if (isLeaf && isLeaf !== "false") {
                            $(document).trigger("MobileLeafReached", {
                                id : id,
                                label: text,
                                currentInstance : currentInstance
                            });

                            // @Nacer, Videep, this is the place to change the speed of closing
                            // the category sel. overlay on top of the post page.
                            window.setTimeout(function () {
                                scope.closePanel();
                            }, 400);
                        }

                    });

                    $(pubscope.menuContainerSel).on('touchend', 'li.nav-item[data-id] a', function () {
                        $(this).removeClass("highlight");
                    });
                }
            };
        };

        // Code to be executed right away when this class code is loaded.
        (function () {
            $(document).bind("UpdateMobileList", function (e, itemObj) {
                currentItemPathLabel = itemObj.label;
                currentItemId = itemObj.id;

                if (e.target && e.target.id && classInstances["#" + e.target.id]) {
                     $("#" + e.target.id).trigger("UpdateMobileListInstance", [itemObj]);
                }
            });

            // Shows the header and footer back again
            $(document).bind("CloseMobileSelector", function (e) {
                $(".viewport .header").show();
                $(".viewport .footer").show();
            });
        })();

        // ***************
        // Public Methods
        // ***************
        PA.MobileItemSelector = function () {};

        PA.MobileItemSelector.prototype = {
        /**
             * @method init
             * @description Initializes the object
             * @public
             */
            init: function (configObj, pageMode, dataModel) {
                var _PM;

                // Keep track of the last instance created (as a static variable).
                currentInstance = this;

                this.config = $.extend(true, {}, configObj);

                // Aliases
                this.breadCrumbSel = this.config.selectors.breadCrumb || "";
                this.mobileContainerSel = this.config.selectors.mobileContainer || "";
                this.menuContainerSel = this.config.selectors.menuContainer || "";
                this.basePanelSel = this.config.selectors.basePanel || "";
                this.mobileItemListSel = this.mobileContainerSel + " " + this.config.selectors.itemListPanel; //   mobileContainerSel + " .item-list";
                this.searchContainerSel = this.mobileContainerSel + " .mm-search";

                this.currentItemPathLabel = (currentItemPathLabel != "") ? currentItemPathLabel :  "";
                this.currentItemId = (currentItemId > 0) ? currentItemId : -1;

                // Reset these values
                currentItemPathLabel = "";
                currentItemId = -1;

                // Keep a pointer to this instance:
                if (this.menuContainerSel) {
                    classInstances[this.menuContainerSel] = this;
                }

                this.api = {};
                this.hasMenuRendered = false;
                this.$rowFocused = null;
                this.$lastOpenedPanel = null;
                this.panelTitles = [];

                // Set HTML, if it is passed as a param.
                if (dataModel) {
                    $(this.mobileItemListSel).html(dataModel);
                }
                _PM = _PrivateObj.call(this);
                _PM.initialize();

                $(this.searchContainerSel).find("input[type=text]").addClass("clearable icon-search-autocomp").clearable();
                $(this.mobileContainerSel).show();

                if ((pageMode.isEdit || pageMode.isPreview || pageMode.isSimilarAd) && !this.hasMenuRendered) {
                    $(this.menuContainerSel).trigger("MobileListNodesReady");
                }
            },

            /**
             * @method hasRendered
             * @description Checks if the list of elements has been rendered.
             * @public
             */
            hasRendered : function () {
                return this.hasMenuRendered;
            }
        };

    })();
})(BOLT.POSTAD);
