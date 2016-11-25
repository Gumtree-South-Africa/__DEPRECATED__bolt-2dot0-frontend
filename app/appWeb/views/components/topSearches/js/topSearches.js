'use strict';

let _showMoreSearches = () => {
	this.$showMoreSearches.toggleClass('hide');
	this.$viewMoreSearches.text(
		(this.$showMoreSearches.is(':visible'))
		? this.viewLessText : this.viewMoreText);
};

let _toggleTabs = (event) => {
	let indexTab = $(event.currentTarget).index();

	this.$topSearches.addClass('mobile-hide');
	this.$topLocations.addClass('mobile-hide');
	if(this.$topSearches.eq(indexTab).length < 1) {
		this.$topLocations.removeClass('mobile-hide');
	} else {
		this.$topSearches.eq(indexTab).removeClass('mobile-hide');
	}
};

let initialize = () => {
	this.$viewMoreSearches = $('.view-more-searches');
	this.$showMoreSearches = $('.show-more-searches');
	this.$topSearchesHeader = $('.top-headers');
	this.$topSearchHeaderText = $('.top-headers-text');
	this.$topSearches = $('.top-searches');
	$('.top-searches').not(':eq(0)').addClass('mobile-hide');

	this.$topLocations = $('.top-locations');
	this.$locationHeaderText = $('.location-header-text');
	this.$searchHeadertext = $('.search-header-text');

	this.viewMoreText = this.$viewMoreSearches.data('view-more');
	this.viewLessText = this.$viewMoreSearches.data('view-less');

	this.$viewMoreSearches.on('click', _showMoreSearches);
	this.$topSearchesHeader.on('click', _toggleTabs);
};

module.exports = {
	initialize
};
