'use strict';

let _showMoreCategories = () => {
	this.$showMoreCategories.toggleClass('hide');
	this.$showMoreCategories.is(':visible') ?
		this.$viewMoreCategories.html([
			$('<span>', { 'text': this.viewLessText}),
			$('<span>', { 'class': 'no-underline', 'text': '\u00A0\u2227'})
		]) :
		this.$viewMoreCategories.html([
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
	this.$viewMoreCategories = $('.view-more-categories');
	this.$showMoreCategories = $('.show-more-categories');

	this.viewMoreText = this.$viewMoreCategories.data('view-more');
	this.viewLessText = this.$viewMoreCategories.data('view-less');

	this.$viewMoreCategories.on('click', _showMoreCategories);
};

module.exports = {
	initialize
};
