"use strict";

// priority for overwriting bundle ->
// 1) (highest) Locale and Device Specific ex: mobile-es_MX
// 2) 			Locale Generic and Device Specific ex: mobile-common
// 3) 			Locale Specific and Device Generic ex: core-es_mx
// 4) 			Locale and Device Generic ex: core-common


module.exports = {
	"bundleName": "SearchPage",
	"outputEntry": "app/appWeb/views/templates/pages/searchPage/js/searchPage",
	"common": {
		"core": { // common->core is the base of the pages bundle and has the lowest priority
			"Header": "app/appWeb/views/components/headerV2/js/header.js",
			"SearchBar": "app/appWeb/views/components/searchbarV2/js/searchbarV2.js",
			//"ModalLocation": "app/appWeb/views/components/modal/js/locationModal.js",
			"Footer": "app/appWeb/views/components/footerV2/js/footer.js",
			"PageMain": "app/appWeb/views/templates/pages/searchPage/js/searchPage.js"
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
