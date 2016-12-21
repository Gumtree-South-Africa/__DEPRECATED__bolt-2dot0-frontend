'use strict';
module.exports = {
	"preCachePaths":
	{
		"css": [
			'v2/{brand}/{country}/{locale}/Main.css',
			'{locale}/{locale}.css',
			'{locale}/fallback.css',
			'{locale}/icons.css',
			'{locale}/sprite.css'
		],
		"cssmin": [
			'v2/{brand}/{country}/{locale}/Main.min.css',
			'{locale}/{locale}.css',
			'{locale}/fallback.css',
			'{locale}/icons.css',
			'{locale}/sprite.css'
		],
		"js": [
			'jQuery.min.js',
			'MainV2.min.js'
		],
		"jsmin": [
			'jQuery.min.js',
			'MainV2.min.js'
		]
	},
	"homepageCachePaths":
	{
		"css": [
			'v2/{brand}/{country}/{locale}/HomePage.css',
			'{locale}/svg/sprite.css-*.svg'
		],
		"cssmin": [
			'v2/{brand}/{country}/{locale}/HomePage.min.css',
			'{locale}/svg/sprite.css-*.svg'
		],
		"icons": [
			'icon_call.svg',
			'icon_chat.svg',
			'icon_email.svg',
			'icon_email_{country}.svg',
			'icon_social_facebook.svg',
			'icon_social_google_plus.svg',
			'icon_social_pinterest.svg',
			'icon_social_twitter.svg',
			'icon_social_youtube.svg'
		],
		"images": [
			'{locale}/appstore.svg',
			'{locale}/googleplay.svg',
			'{locale}/logo.png',
			'{locale}/logo_v2.png',
			'{locale}/appdownload_mobile.jpg	',
			'{locale}/loading-circle-complete.gif',
			'{locale}/loading-circle.gif',
			'{locale}/shield.png',
			'{locale}/Agent01-50.jpg',
			'{locale}/Agent02-50.jpg',
			'{locale}/Agent03-50.jpg',
			'{locale}/Agent04-50.jpg',
			'{locale}/safety-tips.jpg'
		],
		"fonts": [
			'Lato-Regular.ttf',
			'Chivo-Regular.ttf',
			'Montserrat-Regular.otf'
		],
		"js": [
			'HomePageV2Legacy.min.js',
			'HomePage_mobile_{locale}.js'
		],
		"jsmin": [
			'HomePageV2Legacy.min.js',
			'HomePage_mobile_{locale}.js'
		]
	}
};
