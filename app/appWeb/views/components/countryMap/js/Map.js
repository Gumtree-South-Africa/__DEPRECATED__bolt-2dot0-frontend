"use strict";

/**
 * @description This module handles the rendering of a Map that can be used to select a predefined location (state/region)
 *     to enhance user interaction in making such selection.
 * @namespace  BOLT.HOME
 * @class Map
 * @author Ulises Robles (uroblesmellin@)
 */
var BOLT = BOLT || {};
BOLT.HOME = BOLT.HOME || {};

/**
 * @description A singleton class that implements the handling of the predefined Map (image) module functionality
 * @namespace BOLT.HOME
 * @class Map
 */
BOLT.HOME.Map = (function() {

	// Vars. to be used to refer DOM elements that matter in this class
	var $completeMap, $areasContainer, $listStates, $listAreas;

	var imgFileExt = ".gif";

	// Stores the base location directory for the images used in this class
	var baseLocMapDir = null;

	// JSON with the special state names for img such as ("Distrito Federal" ==> "df")
	var specialStateNames = null;

	// Map with the Foreign letter with accents to plain ASCII letter.
	var latin_map = {
		"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u"
	};

	// Private Methods
	var _PM = {
		/**
		 * @method latinise
		 * @description Convert a string with Latin (Spanish) chars into ASCII chars.
		 * @private
		 * @param {String} str String to latinise.
		 */
		latinise: function(str) {
			return str.replace(/[^A-Za-z0-9]/g, function(x) {
				return latin_map[x] || x;
			});
		},

		/**
		 * @method getCanonicalName
		 * @description Gets the canonical name of a State (statename without special chars or whitespaces)
		 * @private
		 * @param {String} stateName Name of the state
		 * @return {String}
		 */
		getCanonicalName: function(stateName) {
			// Handles special state name cases
			if (specialStateNames && specialStateNames[stateName]) {
				stateName = specialStateNames[stateName];
			}

			// Replacing spaces with "_"
			stateName = stateName.replace(/\s/g, "_");

			// Convert from accent to ASCII
			return _PM.latinise(stateName);
		},

		/**
		 * @method mapRollOver
		 * @description Method called when there the user is doing a mouse over a region in the map.
		 * @private
		 * @param {String} stateName Name of the state
		 * @return {String}
		 */
		mapRollOver: function(stateName) {
			var t;

			if ($completeMap && stateName) {
				t = baseLocMapDir + stateName + imgFileExt;
				// $completeMap.css("background", "url(" + t + ") no-repeat top center");
				$completeMap.addClass("focusState");
				$completeMap.addClass(stateName);

				// Highlight the State Label
				$("#state_" + stateName).addClass("locHighlight");
			}
		},

		/**
		 * @method mapRollOut
		 * @description Method called when there the user is doing a mouse out  a region in the map.
		 * @private
		 * @param {String} stateName Name of the state
		 * @return {String}
		 */
		mapRollOut: function(stateName) {
			if ($completeMap && stateName) {
				// $completeMap.css("background-image", "none");
				$completeMap.removeClass("focusState");
				$completeMap.removeClass(stateName);
			}
			// Highlight the State Image
			$("#state_" + stateName).removeClass("locHighlight");
			return true;
		},

		/**
		 * @method syncUI
		 * @description Handles the initial event manipulations for this class
		 * @private
		 */
		syncUI: function() {
			var $anchorObj, $stateInMap, anchorUrl, stateName, canonStateName;

			// Attach the events for the list <li> of states.
			$listStates.each(function(idx) {
				$anchorObj = $(this).find("a");
				anchorUrl = $anchorObj.attr("href");
				stateName = $anchorObj.text();
				$stateInMap = $areasContainer.find("area[title=\"" + stateName + "\"]");

				// Adding the href from the anchor to the map image (for a given state)
				if ($stateInMap.length > 0) {
					$stateInMap.attr("href", anchorUrl);
				}

				// Get the State canonical name
				canonStateName = _PM.getCanonicalName(stateName);
				$anchorObj.attr({"id": "state_" + canonStateName});
				(function(name) {
					$anchorObj.mouseover(function() {
						// @urobles: Todo. Fix this logic
						// if (!matchMedia("mobile") && !matchMedia("tablet") && !matchMedia("desktop")) {
						_PM.mapRollOver(name);
						// }
						return false;
					});
					$anchorObj.mouseout(function() {
						// @urobles: Todo. Fix this logic
						// if (!matchMedia("mobile") && !matchMedia("tablet") && !matchMedia("desktop")) {
						_PM.mapRollOut(name);
						// }
						return false;
					});
				}(canonStateName));
			});

			// Attach the events for the list of map areas
			$listAreas.each(function(idx) {
				var $areaObj = $(this);
				stateName = $areaObj.attr("title");
				// Get the State canonical name
				canonStateName = _PM.getCanonicalName(stateName);
				(function(name) {
					$areaObj.click(function(e) {
						// @urobles: Todo. Fix this logic
						// if (matchMedia("mobile") || matchMedia("tablet") ||  matchMedia("desktop")) {
						//if (!matchMedia("largeScr"))
						e.stopPropagation();
						//  e.preventDefault();
						// }
					});

					$areaObj.mouseover(function() {
						// @urobles: Todo. Fix this logic
						// if (!matchMedia("mobile") && !matchMedia("tablet") && !matchMedia("desktop")) {
						_PM.mapRollOver(name);
						// }
						return false;
					});
					$areaObj.mouseout(function() {
						// // @urobles: Todo. Fix this logic
						/// if (!matchMedia("mobile") && !matchMedia("tablet") && !matchMedia("desktop")) {
						_PM.mapRollOut(name);
						// }
						return false;
					});
					/*
					 $areaObj.click(function () {
					 if (!matchMedia("mobile") && !matchMedia("tablet")) {
					 // if (matchMedia("largeScr")) {
					 window.blur();
					 }
					 });
					 */
					$areaObj.focus(function() {
						if (!matchMedia("mobile") && !matchMedia("tablet")) {
							// if (matchMedia("largeScr")) {
							// navigator.appName == 'Microsoft Internet Explorer' ? window.blur() : null;
						}
					});
				}(canonStateName));

			}); // each loop
		}
	};

	// Public methods
	return {
		/**
		 * @method init
		 * @description Initializes the Map module
		 * @public
		 * @param {String} baseDir Str. with the image dir. base.
		 * @param {Object|JSON} mapDOMJSON JSON with DOM elements needed for the map hovering
		 * @param {Object|JSON} specialStateNameJSON JSON with the special name mappings, if any.
		 * @param {String} imgFileExtension Extension of the image files (.gif, .png, etc)
		 */
		init: function(baseDir, mapDOMJSON, specialStateNameJSON, imgFileExtension) {
			// Assign private var values.
			baseLocMapDir = baseDir;
			imgFileExt = imgFileExtension || ".gif"; // By default the img. extension is gif.

			if (mapDOMJSON) {
				$completeMap = mapDOMJSON.completeMap;
				$areasContainer = mapDOMJSON.areasContainer;
				$listStates = mapDOMJSON.liStates;
				$listAreas = $areasContainer.find("area");
			} else {
				return false;
			}

			if (typeof specialStateNameJSON !== "undefined") {
				specialStateNames = specialStateNameJSON;
			}

			// Initialize event handling
			_PM.syncUI();
		}
	};

})();
