'use strict';

let _toggleTabsAd = (event) => {
	let indexTab = $(event.currentTarget).index();
	this.$contentAds.addClass('ad-hide');
  this.$adtabMenu.removeClass('active');
	this.$contentAds.eq(indexTab).removeClass('ad-hide');
	this.$contentAds.eq(indexTab).addClass('ad-display');
  this.$adtabMenu.eq(indexTab).addClass('active');
};

let initialize = () => {
    this.$adtabMenu = $('.adTabs ul li');
    this.$contentAds = $('.content-ads');

    this.$adtabMenu.on('click', _toggleTabsAd);
};

module.exports = {
	initialize
};
