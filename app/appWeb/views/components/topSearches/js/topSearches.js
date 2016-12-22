'use strict';

let _showMoreSearches = () => {
	this.$showMoreSearches.toggleClass('hide');
	this.$showMoreSearches.is(':visible') ?
		this.$viewMoreSearches.html([
			$('<span>', { 'text': this.viewLessText}),
			$('<span>', { 'class': 'no-underline', 'text': '\u00A0\u2227'})
		]) :
		this.$viewMoreSearches.html([
			$('<span>', { 'text': this.viewMoreText}),
			$('<span>', { 'class': 'no-underline', text: '\u00A0>'})
		]);

	if (this.$desktopSeo.is(':visible')) {
		this.$desktopSeo.css('display', 'none');
	} else {
		this.$desktopSeo.css('display', 'block');
	}
};

let _toggleTabs = (event) => {
	console.log('neto');
	let indexTab = $(event.currentTarget).index();
	this.$tabs.addClass('mobile-hide');
	this.$tabs.eq(indexTab).removeClass('mobile-hide');
};

let initialize = () => {
	this.$desktopSeo = $('.desktop-seo');
	this.$viewMoreSearches = $('.view-more-searches');
	this.$showMoreSearches = $('.show-more-searches');
	this.$topSearchesHeader = $('.top-headers');
	this.$topSearchHeaderText = $('.top-headers-text');

	this.$tabs = $('.tab-content > div');

	this.$topSearches = $('.top-searches');
	this.$topLocations = $('.top-locations');
	this.$topCategories = $('.top-categories');

	$('.top-searches').not(':eq(0)').addClass('mobile-hide');


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
