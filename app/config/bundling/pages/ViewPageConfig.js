"use strict";

// priority for overwriting bundle ->
// 1) (highest) Locale and Device Specific ex: mobile-es_MX
// 2) 			Locale Generic and Device Specific ex: mobile-common
// 3) 			Locale Specific and Device Generic ex: core-es_mx
// 4) 			Locale and Device Generic ex: core-common


module.exports = {
	"bundleName": "ViewPage",
	"outputEntry": "app/appWeb/views/templates/pages/viewPage/js/viewPage",
	"common": {
		"core": { // common->core is the base of the pages bundle and has the lowest priority
			"TileGrid": "app/appWeb/views/components/tileGrid/js/tileGrid.js",
			"adTabs": "app/appWeb/views/components/adTabs/js/adTabs.js",
			"Header": "app/appWeb/views/components/headerV2/js/header.js",
			"SearchBar": "app/appWeb/views/components/searchbarV2/js/searchbarV2.js",
			"Footer": "app/appWeb/views/components/footerV2/js/footer.js",
			"PageMain": "app/appWeb/views/templates/pages/viewPage/js/viewPage.js",
			"AdDetails": "app/appWeb/views/components/adDetails/js/adDetails.js",
			"ViewPageGallery": "app/appWeb/views/components/viewPageGallery/js/viewPageGallery.js",
			"ReplyForm": "app/appWeb/views/components/replyForm/js/replyForm.js",
			//"AdReplyFileAttachment": "app/appWeb/views/components/replyForm/js/adReplyFileAttachment.js",
			"TopSearches": "app/appWeb/views/components/topSearches/js/topSearches.js",
			"FlagAd": "app/appWeb/views/components/flagAd/js/flagAd.js",
			"ModalLocation": "app/appWeb/views/components/modal/js/locationModal.js"
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
		}
	}
};
