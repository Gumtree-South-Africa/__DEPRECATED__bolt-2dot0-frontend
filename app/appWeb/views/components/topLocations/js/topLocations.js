'use strict';

let _showMoreLocations = () => {
	this.$showMoreLocations.toggleClass('hide');
	this.$showMoreLocations.is(':visible') ?
		this.$viewMoreLocations.html([
			$('<span>', { 'text': this.viewLessText}),
			$('<span>', { 'class': 'no-underline', 'text': '\u00A0\u2227'})
		]) :
		this.$viewMoreLocations.html([
			$('<span>', { 'text': this.viewMoreText}),
			$('<span>', { 'class': 'no-underline', text: '\u00A0>'})
		]);

	if (this.$desktopSeo.is(':visible')) {
		this.$desktopSeo.css('display', 'none');
	} else {
		this.$desktopSeo.css('display', 'block');
	}
};

let initialize = () => {
	this.$desktopSeo = $('.desktop-seo');
	this.$viewMoreLocations = $('.view-more-locations');
	this.$showMoreLocations = $('.show-more-locations');

	this.viewMoreText = this.$viewMoreLocations.data('view-more');
	this.viewLessText = this.$viewMoreLocations.data('view-less');

	this.$viewMoreLocations.on('click', _showMoreLocations);
};

module.exports = {
	initialize
};
