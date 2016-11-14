'use strict';

let _showMoreSearches = () => {
	this.$showMoreSearches.toggleClass('hide');
	this.$viewMoreSearches.text(this.$showMoreSearches.is(':visible') ? this.viewLessText : this.viewMoreText);
};

// <<<<<<< 569e42d47e2393cdeaef57ee85a403f7f3ab50d7
let _toggleTabs = (event) => {
	let indexTab = $(event.currentTarget).index();
  $('.tab-content > div').addClass('mobile-hide').eq(indexTab).removeClass('mobile-hide');

	this.$topSearches.addClass('mobile-hide');
	this.$topLocations.addClass('mobile-hide');
	if(this.$topSearches.eq(indexTab).length < 1) {
		this.$topLocations.removeClass('mobile-hide');
	} else {
		this.$topSearches.eq(indexTab).removeClass('mobile-hide');
	}
// =======
let _toggleTabs = () => {
  $('.tab-content > div').addClass('mobile-hide');
  this.$topSearches.removeClass('mobile-hide');
  this.$categoryHeadertext.removeClass('thick-underline');
  this.$locationHeaderText.removeClass('thick-underline');
  this.$searchHeadertext.addClass('thick-underline');
// >>>>>>> adding the category tree V2
};

let initialize = () => {
	this.$viewMoreSearches = $('.view-more-searches');
	this.$showMoreSearches = $('.show-more-searches');
	this.$topSearchesHeader = $('.top-searches-header');

	this.$topSearchHeaderText = $('.top-headers-text');
	this.$topSearches = $('.top-searches');
// <<<<<<< 569e42d47e2393cdeaef57ee85a403f7f3ab50d7
	$('.top-searches').not(':eq(0)').addClass('mobile-hide');

	this.$topLocations = $('.top-locations');
	this.$locationHeaderText = $('.location-header-text');
	this.$searchHeadertext = $('.search-header-text');
// =======
  this.$topLocations = $('.top-locations');
  this.$topCategories = $('.top-categories');
  this.$locationHeaderText = $('.location-header-text');
  this.$searchHeadertext = $('.search-header-text');
  this.$categoryHeadertext = $('.category-header-text');
// >>>>>>> adding the category tree V2

	this.viewMoreText = this.$viewMoreSearches.data('view-more');
	this.viewLessText = this.$viewMoreSearches.data('view-less');

	this.$viewMoreSearches.on('click', _showMoreSearches);
	this.$topSearchesHeader.on('click', _toggleTabs);
};

module.exports = {
	initialize
};
