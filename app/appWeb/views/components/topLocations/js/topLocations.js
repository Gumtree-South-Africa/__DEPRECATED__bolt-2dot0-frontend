'use strict';

let _showMoreLocations = () => {
	this.$showMoreLocations.toggleClass('hide');
	this.$viewMoreLocations.text(
		(this.$showMoreLocations.is(':visible'))
		? this.viewLessText : this.viewMoreText);

	if (this.$desktopSeo.is(':visible')) {
		this.$desktopSeo.css('display', 'none');
	} else {
		this.$desktopSeo.css('display', 'block');
	}
};

let _toggleTabs = () => {
	this.$topCategories.addClass('mobile-hide');
  this.$topLocations.removeClass('mobile-hide');
  this.$topSearches.addClass('mobile-hide');
  this.$categoryHeadertext.removeClass('thick-underline');
  this.$locationHeaderText.addClass('thick-underline');
  this.$searchHeadertext.removeClass('thick-underline');
};

let initialize = () => {
	this.$desktopSeo = $('.desktop-seo');
	this.$viewMoreLocations = $('.view-more-locations');
	this.$showMoreLocations = $('.show-more-locations');
	this.$topLocationsHeader = $('.top-locations-header');
	this.$topSearches = $('.top-searches');
  this.$topLocations = $('.top-locations');
  this.$topCategories = $('.top-categories');
  this.$locationHeaderText = $('.location-header-text');
  this.$searchHeadertext = $('.search-header-text');
  this.$categoryHeadertext = $('.category-header-text');

	this.viewMoreText = this.$viewMoreLocations.data('view-more');
	this.viewLessText = this.$viewMoreLocations.data('view-less');

	this.$viewMoreLocations.on('click', _showMoreLocations);
	this.$topLocationsHeader.on('click', _toggleTabs);
};

module.exports = {
	initialize
};
