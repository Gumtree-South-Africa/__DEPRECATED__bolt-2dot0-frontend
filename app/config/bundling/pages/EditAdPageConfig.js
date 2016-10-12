"use strict";

// priority for overwriting bundle ->
// 1) (highest) Locale and Device Specific ex: mobile-es_MX
// 2) 			Locale Generic and Device Specific ex: mobile-common
// 3) 			Locale Specific and Device Generic ex: core-es_mx
// 4) 			Locale and Device Generic ex: core-common


module.exports = {
	"bundleName": "EditAd",
	"outputEntry": "app/appWeb/views/templates/pages/editAd/js/editAd",
	"common": {
		"core": { // common->core is the base of the pages bundle and has the lowest priority
			"Footer": "app/appWeb/views/components/footerV2/js/footer.js",
			"Header": "app/appWeb/views/components/headerV2/js/header.js",
			"UploadSuccessModal": "app/appWeb/views/components/uploadSuccessModal/js/uploadSuccessModal.js",
			"PageMain": "app/appWeb/views/templates/pages/editAd/js/editPage.js",
			"EditAdFormMainDetails": "app/appWeb/views/components/editAdFormMainDetails/js/editAdFormMainDetails.js"
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
