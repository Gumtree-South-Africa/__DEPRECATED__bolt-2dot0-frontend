"use strict";

// priority for overwriting bundle ->
// 1) (highest) Locale and Device Specific ex: mobile-es_MX
// 2) 			Locale Generic and Device Specific ex: mobile-common
// 3) 			Locale Specific and Device Generic ex: core-es_mx
// 4) 			Locale and Device Generic ex: core-common


module.exports = {
	"bundleName": "LoginPage",
	"outputEntry": "app/appWeb/views/templates/pages/loginPage/js/loginPage",
	"common": {
		"core": { // common->core is the base of the pages bundle and has the lowest priority
			"Footer": "app/appWeb/views/components/footerV2/js/footer.js",
			"RegistrationForm": "app/appWeb/views/components/registrationForm/js/registrationForm.js",
			"PageMain": "app/appWeb/views/templates/pages/loginPage/js/loginPage.js"
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
