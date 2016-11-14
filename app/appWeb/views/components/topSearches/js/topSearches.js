'use strict';

let _showMoreSearches = () => {
	this.$showMoreSearches.toggleClass('hide');
	this.$viewMoreSearches.text(
		(this.$showMoreSearches.is(':visible'))
		? this.viewLessText : this.viewMoreText);

	if (this.$desktopSeo.is(':visible')) {
		this.$desktopSeo.css('display', 'none');
	} else {
		this.$desktopSeo.css('display', 'block');
	}
};

let _toggleTabs = () => {
	this.$topCategories.addClass('mobile-hide');
  this.$topLocations.addClass('mobile-hide');
  this.$topSearches.removeClass('mobile-hide');
  this.$categoryHeadertext.removeClass('thick-underline');
  this.$locationHeaderText.removeClass('thick-underline');
  this.$searchHeadertext.addClass('thick-underline');
};

let initialize = () => {
	this.$desktopSeo = $('.desktop-seo');
	this.$viewMoreSearches = $('.view-more-searches');
	this.$showMoreSearches = $('.show-more-searches');
	this.$topSearchesHeader = $('.top-searches-header');
	this.$topSearches = $('.top-searches');
  this.$topLocations = $('.top-locations');
  this.$topCategories = $('.top-categories');
  this.$locationHeaderText = $('.location-header-text');
  this.$searchHeadertext = $('.search-header-text');
  this.$categoryHeadertext = $('.category-header-text');

	this.viewMoreText = this.$viewMoreSearches.data('view-more');
	this.viewLessText = this.$viewMoreSearches.data('view-less');

	this.$viewMoreSearches.on('click', _showMoreSearches);
	this.$topSearchesHeader.on('click', _toggleTabs);
};

module.exports = {
	initialize
};
