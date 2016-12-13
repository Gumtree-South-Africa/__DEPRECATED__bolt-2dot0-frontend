//former uglify.js

var rootDir = process.cwd();


module.exports = [
	{
		"dest": rootDir + "/public/jsmin", "src": [
		rootDir + "/public/js/common/*.js",
		rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
		rootDir + "/public/bower-components/requirejs/require.js"
	], "bundleName": "my-component.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/handlebars/*.js"
		], "bundleName": "my-other-component.min.js"
	},
	{
		"dest": rootDir + "/public/jsmin", "src": [
		rootDir + "/node_modules/jquery/dist/jquery.min.js",
	], "bundleName": "jQuery.min.js"},
	{
		"dest": rootDir + "/public/jsmin", "src": [
		rootDir + "/public/js/libraries/jQuery/plugins/jquery.smartbanner.js",
		rootDir + "/public/js/common/tracking/GoogleTag.js",
		rootDir + "/public/js/common/banners/GoogleTagBanner.js",
		rootDir + "/public/js/common/tracking/Analytics.js"
	], "bundleName": "HomePageV2Legacy.min.js"
	},{
		"dest": rootDir + "/public/jsmin", "src": [
		rootDir + "/public/js/libraries/zoom/jquery.mousewheel.min.js",
		rootDir + "/public/js/libraries/zoom/hammer.min.js",
		rootDir + "/public/js/libraries/zoom/TweenMax.min.js",
		rootDir + "/public/js/libraries/zoom/jquery.pinchzoomer.min.js"
	], "bundleName": "Zoom.min.js"
	},{
		"dest": rootDir + "/public/jsmin", "src": [
		rootDir + "/public/js/common/tracking/Analytics.js"
	], "bundleName": "AnalyticsLegacyBundle.min.js"
	},{
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js",
			rootDir + "/public/js/common/widgets/SocialMedia.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js"
		], "bundleName": "Main.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/libraries/jQuery/plugins/jquery.smartbanner.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js"
		], "bundleName": "Main_es_MX.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/libraries/jQuery/plugins/jquery.smartbanner.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js"
		], "bundleName": "Main_es_AR.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js"
		], "bundleName": "Main_es_US.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/libraries/jQuery/plugins/jquery.smartbanner.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js",
		], "bundleName": "Main_en_ZA.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/public/js/common/banners/BannerCookie.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js",
		], "bundleName": "Main_en_IE.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/public/js/common/banners/BannerCookie.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js",
		], "bundleName": "Main_pl_PL.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/public/js/libraries/jQuery/jquery-2.0.0.js",
			rootDir + "/public/bower-components/requirejs/require.js",
			// rootDir + "/public/js/common/*.js",
			rootDir + "/public/js/libraries/jQuery/plugins/jquery.smartbanner.js",
			rootDir + "/public/js/common/utils/StringUtils.js",
			rootDir + "/public/js/common/utils/JQueryUtil.js",
			rootDir + "/public/js/common/device/MatchMedia.js",
			rootDir + "/public/js/common/tracking/GoogleTag.js",
			rootDir + "/public/js/common/bolt/main.js",
			rootDir + "/public/js/common/bolt/json.js",
			rootDir + "/public/js/common/bolt/cookie.js",
			rootDir + "/public/js/common/bolt/storage.js",
			rootDir + "/public/js/common/bolt/overlay.js",
			rootDir + "/public/js/common/bolt/i18n.js",
			rootDir + "/public/js/common/bolt/html5.js",
			rootDir + "/public/js/common/bolt/Search.js",
			rootDir + "/public/js/common/banners/BannerCookie.js",
			rootDir + "/app/appWeb/views/components/header/js/header.js",
			rootDir + "/public/js/common/header/searchbar.js",
			rootDir + "/public/js/common/banners/GoogleTagBanner.js",
			rootDir + "/public/js/common/tracking/Analytics.js",
		], "bundleName": "Main_en_SG.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js"
		], "bundleName": "HomePage.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/CarouselExt/modernizr.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/CarouselExt/owl.carousel.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/CarouselExt/carouselExt.js",
			rootDir + "/app/appWeb/views/components/countryMap/js/Map.js"
		], "bundleName": "HomePage_es_MX.min.js"
	}, { //light version of page JS. Example: this will be used for mobile bp, since some  components will be turned off for mobile.
		"dest": rootDir + "/public/jsmin", "src": [
            rootDir + "/app/appWeb/views/components/smartMobileBanner/js/smartMobileBanner.js",
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js"
		], "bundleName": "HomePage_es_MX_light.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/CarouselExt/modernizr.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/CarouselExt/owl.carousel.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/CarouselExt/carouselExt.js",
			rootDir + "/app/appWeb/views/components/countryMap/js/Map.js"
		], "bundleName": "HomePage_es_AR.min.js"
	}, { //light version of page JS. Example: this will be used for mobile bp, since some  components will be turned off for mobile.
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js"
		], "bundleName": "HomePage_es_AR_light.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js"
		], "bundleName": "HomePage_es_US.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js",
			rootDir + "/app/appWeb/views/components/smartMobileBanner/js/smartMobileBanner.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/adCarousel.js"
		], "bundleName": "HomePage_en_ZA.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/adCarousel.js"
		], "bundleName": "HomePage_en_IE.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/adCarousel.js"
		], "bundleName": "HomePage_pl_PL.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/categoryList/js/app.js",
			rootDir + "/app/appWeb/views/components/adCarousel/js/adCarousel.js"
		], "bundleName": "HomePage_en_SG.min.js"
	},

	{
		"dest": rootDir + "/public/jsmin", "src": [
		rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadUtil.js",
		rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageEXIF.js",
		rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadDragAndDrop.js",
		rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploader.js",
		rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
		rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/jquery.menu.min.js",
		rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/MobileItemSelector.js",
		rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
		rootDir + "/public/js/libraries/jQueryValidate/jquery.validate.min.js",
		rootDir + "/public/js/pages/quickpost/quickpost.js",
		rootDir + "/public/js/pages/quickpost/postPageValidator.js"
	], "bundleName": "QuickPost_es_MX.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadUtil.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageEXIF.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadDragAndDrop.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploader.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/jquery.menu.min.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/MobileItemSelector.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/public/js/libraries/jQueryValidate/jquery.validate.min.js",
			rootDir + "/public/js/pages/quickpost/quickpost.js",
			rootDir + "/public/js/pages/quickpost/postPageValidator.js"
		], "bundleName": "QuickPost_es_AR.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadUtil.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageEXIF.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadDragAndDrop.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploader.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/jquery.menu.min.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/MobileItemSelector.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/public/js/libraries/jQueryValidate/jquery.validate.min.js",
			rootDir + "/public/js/pages/quickpost/quickpost.js",
			rootDir + "/public/js/pages/quickpost/postPageValidator.js"
		], "bundleName": "QuickPost_es_US.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadUtil.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageEXIF.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadDragAndDrop.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploader.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/jquery.menu.min.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/MobileItemSelector.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/public/js/libraries/jQueryValidate/jquery.validate.min.js",
			rootDir + "/public/js/pages/quickpost/quickpost.js",
			rootDir + "/public/js/pages/quickpost/postPageValidator.js"
		], "bundleName": "QuickPost_en_ZA.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadUtil.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageEXIF.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadDragAndDrop.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploader.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/jquery.menu.min.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/MobileItemSelector.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/public/js/libraries/jQueryValidate/jquery.validate.min.js",
			rootDir + "/public/js/pages/quickpost/quickpost.js",
			rootDir + "/public/js/pages/quickpost/postPageValidator.js"
		], "bundleName": "QuickPost_en_IE.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadUtil.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageEXIF.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadDragAndDrop.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploader.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/jquery.menu.min.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/MobileItemSelector.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/public/js/libraries/jQueryValidate/jquery.validate.min.js",
			rootDir + "/public/js/pages/quickpost/quickpost.js",
			rootDir + "/public/js/pages/quickpost/postPageValidator.js"
		], "bundleName": "QuickPost_en_SG.min.js"
	}, {
		"dest": rootDir + "/public/jsmin", "src": [
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadUtil.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageEXIF.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploadDragAndDrop.js",
			rootDir + "/app/appWeb/views/components/mediaUpload/js/BoltImageUploader.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/jquery.menu.min.js",
			rootDir + "/app/appWeb/views/components/mobileSelectorMenu/js/MobileItemSelector.js",
			rootDir + "/app/appWeb/views/components/mapLatLong/js/mapLatLong.js",
			rootDir + "/public/js/libraries/jQueryValidate/jquery.validate.min.js",
			rootDir + "/public/js/pages/quickpost/quickpost.js",
			rootDir + "/public/js/pages/quickpost/postPageValidator.js"
		], "bundleName": "QuickPost_pl_PL.min.js"
	}


];
