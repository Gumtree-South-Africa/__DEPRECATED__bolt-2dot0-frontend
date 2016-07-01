var rootDir = process.cwd();


module.exports = [
	{
		"dest": rootDir + "/public/jsmin", "src": [
		"libraries/jQuery/jquery-2.0.0.min.js",
		"libraries/jQuery/plugins/jquery.smartbanner.js",
		"common/utils/StringUtils.js",
		"common/utils/JQueryUtil.js",
		"common/device/MatchMedia.js",
		"common/tracking/GoogleTag.js",
		"common/bolt/main.js",
		"common/bolt/json.js",
		"common/bolt/cookie.js",
		"common/bolt/storage.js",
		"common/bolt/overlay.js",
		"common/bolt/i18n.js",
		"common/bolt/html5.js",
		"common/bolt/Search.js",
		"common/banners/GoogleTagBanner.js",
		"common/banners/BannerCookie.js",
		"common/tracking/Analytics.js",
		"common/header/searchbar.js"
	], "bundleName": "common.min.js"
	}
]
