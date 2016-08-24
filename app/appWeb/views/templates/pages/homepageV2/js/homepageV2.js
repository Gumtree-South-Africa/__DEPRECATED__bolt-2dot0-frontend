'use strict';

module.exports.initialize = () => {
	window.$  = $; // assign jquery to the window for use by other files and inline scripts
	require('public/js/common/banners/GoogleTagBanner.js');
	require('public/js/common/banners/BannerCookie.js');
};


