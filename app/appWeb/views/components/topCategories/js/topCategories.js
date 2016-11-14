'use strict';

let _showMoreCategories = () => {
  this.$showMoreCategories.toggleClass('hide');
  this.$viewMoreCategories.text(
    (this.$showMoreCategories.is(':visible'))
    ? this.viewLessText : this.viewMoreText);

  if (this.$desktopSeo.is(':visible')) {
    this.$desktopSeo.css('display', 'none');
  } else {
    this.$desktopSeo.css('display', 'block');
  }
};

let _toggleTabs = () => {
  this.$topCategories.removeClass('mobile-hide');
  this.$topLocations.addClass('mobile-hide');
  this.$topSearches.addClass('mobile-hide');
  this.$categoryHeadertext.addClass('thick-underline');
  this.$locationHeaderText.removeClass('thick-underline');
  this.$searchHeadertext.removeClass('thick-underline');
};

let initialize = () => {
  this.$desktopSeo = $('.desktop-seo');
  this.$viewMoreCategories = $('.view-more-categories');
  this.$showMoreCategories = $('.show-more-categories');
  this.$topCategoriesHeader = $('.top-categories-header');
  this.$topSearches = $('.top-searches');
  this.$topLocations = $('.top-locations');
  this.$topCategories = $('.top-categories');
  this.$locationHeaderText = $('.location-header-text');
  this.$searchHeadertext = $('.search-header-text');
  this.$categoryHeadertext = $('.category-header-text');

  this.viewMoreText = this.$viewMoreCategories.data('view-more');
  this.viewLessText = this.$viewMoreCategories.data('view-less');

  this.$viewMoreCategories.on('click', _showMoreCategories);
  this.$topCategoriesHeader.on('click', _toggleTabs);
};

module.exports = {
  initialize
};
