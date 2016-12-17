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
			'icon_social_facebook.svg',
			'icon_social_google_plus.svg',
			'icon_social_pinterest.svg',
			'icon_social_twitter.svg',
			'icon_social_youtube.svg'
		],
		"images": [
			'carousel-arrow-right.png',
			'{locale}/appstore.svg',
			'{locale}/googleplay.svg',
			'{locale}/logo.png',
			'{locale}/rating.png',
			'{locale}/appdownload_mobile.jpg',
			'safety-tips-1.jpg',
			'Agent01.jpg',
			'Agent02.jpg',
			'Agent03.jpg'
		],
		"fonts": [
			'Lato-Regular.ttf'
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
