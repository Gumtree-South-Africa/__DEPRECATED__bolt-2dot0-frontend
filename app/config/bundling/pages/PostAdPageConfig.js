"use strict";

// priority for overwriting bundle ->
// 1) (highest) Locale and Device Specific ex: mobile-es_MX
// 2) 			Locale Generic and Device Specific ex: mobile-common
// 3) 			Locale Specific and Device Generic ex: core-es_mx
// 4) 			Locale and Device Generic ex: core-common


module.exports = {
	"bundleName": "PostAd",
	"outputEntry": "app/views/templates/pages/postAd/js/postAd",
	"common": {
		"core": { // common->core is the base of the pages bundle and has the lowest priority
			"Footer": "app/views/components/footerV2/js/footer.js",
			"LoginModal": "app/views/components/loginModal/js/loginModal.js",
			"UploadImage": "app/views/components/uploadImage/js/uploadImage.js"
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
