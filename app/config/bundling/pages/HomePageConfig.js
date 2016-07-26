"use strict";

// priority for overwriting bundle ->
// 1) (highest) Locale and Device Specific ex: mobile-es_MX
// 2) 			Locale Generic and Device Specific ex: mobile-common
// 3) 			Locale Specific and Device Generic ex: core-es_mx
// 4) 			Locale and Device Generic ex: core-common


module.exports = {
		"bundleName": "HomePage",
		"outputEntry": "app/views/templates/pages/homepageV2/js/homepageV2",
		"common": {
			"core": { // common->core is the base of the pages bundle and has the lowest priority
				"TileGrid": "app/views/components/tileGrid/js/tileGrid.js",
				"Header": "app/views/components/headerV2/js/header.js",
				"Footer": "app/views/components/footerV2/js/footer.js",
				"WelcomeModal": "app/views/components/welcomeModal/js/welcomeModal.js",
				"SearchBar": "app/views/components/searchbarV2/js/searchbarV2.js",
				"SectionMenu": "app/views/components/sectionMenu/js/sectionMenu.js",
				"ModalAutoComplete": "app/views/components/modal/js/modal_autocomplete.js",
				"ModalLocationPrompt": "app/views/components/modal/js/locationPrompt.js",
				"ProfileMenu": "app/views/components/profileMenu/js/profileMenu.js",
				"HamburgerMenu": "app/views/components/hamburgerMenu/js/hamburgerMenu.js",
				"TopLocations": "app/views/components/topLocations/js/topLocations.js",
				"TopSearches": "app/views/components/topSearches/js/topSearches.js"
			},
			"mobile": {},
			"desktop": {} // common locale and device specific has the second highest priority
		},
		"locales": {
			"es_MX": {
				"core": {}, // locale specific core modules have the third h
				"mobile": {}, // device and locale specific has the highest priority
				"desktop": {}
			}
		}
};
