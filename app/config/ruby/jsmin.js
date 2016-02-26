//former uglify.js 

var rootDir = process.cwd();

module.exports =
  [
    {
      "dest": rootDir + "/public/jsmin",
      "src":
      [
         rootDir + "/public/js/common/*.js",
         rootDir + "/public/js/libraries/jquery-2.0.0.js"
      ],
      "bundleName": "my-component.min.js"
    },
    {
      "dest": rootDir + "/public/jsmin",
      "src":
      [
         rootDir + "/public/js/libraries/handlebars/*.js"
      ],
      "bundleName": "my-other-component.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js",
            rootDir + "/public/js/common/widgets/SocialMedia.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js"
        ],
        "bundleName": "Main.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js"
        ],
        "bundleName": "Main_es_MX.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js"
        ],
        "bundleName": "Main_es_AR.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js"
        ],
        "bundleName": "Main_es_US.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js",
        ],
        "bundleName": "Main_en_ZA.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/public/js/common/banners/BannerCookie.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js",
        ],
        "bundleName": "Main_en_IE.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/public/js/common/banners/BannerCookie.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js",
        ],
        "bundleName": "Main_pl_PL.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/public/js/libraries/jquery-2.0.0.js",
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
            rootDir + "/public/js/common/bolt/Search.js",
            rootDir + "/public/js/common/banners/BannerCookie.js",
            rootDir + "/app/views/components/header/js/header.js",
            rootDir + "/public/js/common/header/searchbar.js",
            rootDir + "/public/js/common/banners/GoogleBanner.js",
            rootDir + "/public/js/common/tracking/Analytics.js",
        ],
        "bundleName": "Main_en_SG.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
          rootDir + "/app/views/components/categoryList/js/app.js"
        ],
        "bundleName": "HomePage.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/app/views/components/categoryList/js/app.js",
            rootDir + "/app/views/components/adCarousel/js/CarouselExt/modernizr.js",
            rootDir + "/app/views/components/adCarousel/js/CarouselExt/owl.carousel.js",
            rootDir + "/app/views/components/adCarousel/js/CarouselExt/carouselExt.js",
            rootDir + "/app/views/components/countryMap/js/Map.js"
        ],
        "bundleName": "HomePage_es_MX.min.js"
    },
    { //light version of page JS. Example: this will be used for mobile bp, since some  components will be turned off for mobile.
        "dest": rootDir + "/public/jsmin",
        "src" : [
             rootDir + "/app/views/components/categoryList/js/app.js"
        ],
        "bundleName": "HomePage_es_MX_light.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src": [
            rootDir + "/app/views/components/categoryList/js/app.js",
            rootDir + "/app/views/components/adCarousel/js/CarouselExt/modernizr.js",
            rootDir + "/app/views/components/adCarousel/js/CarouselExt/owl.carousel.js",
            rootDir + "/app/views/components/adCarousel/js/CarouselExt/carouselExt.js",
            rootDir + "/app/views/components/countryMap/js/Map.js"
        ],
        "bundleName": "HomePage_es_AR.min.js"
    },
    { //light version of page JS. Example: this will be used for mobile bp, since some  components will be turned off for mobile.
        "dest": rootDir + "/public/jsmin",
        "src" : [
             rootDir + "/app/views/components/categoryList/js/app.js"
        ],
        "bundleName": "HomePage_es_AR_light.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src" : [
             rootDir + "/app/views/components/categoryList/js/app.js"
        ],
        "bundleName": "HomePage_es_US.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src" : [
             rootDir + "/app/views/components/categoryList/js/app.js",
             rootDir + "/app/views/components/adCarousel/js/adCarousel.js"
        ],
        "bundleName": "HomePage_en_ZA.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src" : [
             rootDir + "/app/views/components/categoryList/js/app.js",
             rootDir + "/app/views/components/adCarousel/js/adCarousel.js"
        ],
        "bundleName": "HomePage_en_IE.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src" : [
             rootDir + "/app/views/components/categoryList/js/app.js",
             rootDir + "/app/views/components/adCarousel/js/adCarousel.js"
        ],
        "bundleName": "HomePage_pl_PL.min.js"
    },
    {
        "dest": rootDir + "/public/jsmin",
        "src" : [
             rootDir + "/app/views/components/categoryList/js/app.js",
             rootDir + "/app/views/components/adCarousel/js/adCarousel.js"
        ],
        "bundleName": "HomePage_en_SG.min.js"
    }
  ];
