'use strict';

let _toggleTabsAd = (event) => {
	let indexTab = $(event.currentTarget).index();
	this.$contentAds.addClass('ad-hide');
  this.$adtabMenu.removeClass('active');
	this.$contentAds.eq(indexTab).removeClass('ad-hide');
	this.$contentAds.eq(indexTab).addClass('ad-display');
  this.$adtabMenu.eq(indexTab).addClass('active');
};

let _loadImages = () => {
	this.$imgs.lazyload({
		'skip_invisible': true,
		'effect' : 'fadeIn',
		'effect_speed': 500
	});
};

let initialize = () => {
    this.$adtabMenu = $('.adTabs ul li');
    this.$contentAds = $('.content-ads');
		this.$imgs = $('img.lazy');
		this.$adtabMenu
			.on('click', _toggleTabsAd)
			.one('click', _loadImages);
		this.$adtabMenu.first().trigger('click');
};

module.exports = {
	initialize
};
