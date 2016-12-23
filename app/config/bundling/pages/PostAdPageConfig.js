"use strict";

// priority for overwriting bundle ->
// 1) (highest) Locale and Device Specific ex: mobile-es_MX
// 2) 			Locale Generic and Device Specific ex: mobile-common
// 3) 			Locale Specific and Device Generic ex: core-es_mx
// 4) 			Locale and Device Generic ex: core-common


module.exports = {
	"bundleName": "PostAd",
	"outputEntry": "app/appWeb/views/templates/pages/postAd/js/postAd",
	"common": {
		"core": { // common->core is the base of the pages bundle and has the lowest priority
			"Footer": "app/appWeb/views/components/footerV2/js/footer.js",
			"PostAd": "app/appWeb/views/templates/pages/postAd/js/postAd.js",
			"FormMap": "app/appWeb/views/components/formMap/js/formMap.js"
		},
		"mobile": {},
		"desktop": {} // common locale and device specific has the second highest priority
	},
	"locales": {
		"es_MX": {
			"core": {}, // locale specific core modules have the third h
			"mobile": {}, // device and locale specific has the highest priority
			"desktop": {}
		},
		"en_ZA": {
			"core": {}, // locale specific core modules have the third h
			"mobile": {}, // device and locale specific has the highest priority
			"desktop": {}
		},
		"en_SG": {
			"core": {}, // locale specific core modules have the third h
			"mobile": {}, // device and locale specific has the highest priority
			"desktop": {}
		}
	}
};
