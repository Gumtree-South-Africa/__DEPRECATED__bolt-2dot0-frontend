'use strict';

let _showMoreLocations = () => {
	this.$showMoreLocations.toggleClass('hide');
	this.$viewMoreLocations.text(this.$showMoreLocations.is(':visible') ? this.viewLessText : this.viewMoreText);
};

let _toggleTabs = event => {
  let indexTab = $(event.currentTarget).index();
  
  this.$tabs.addClass('mobile-hide').eq(indexTab).removeClass('mobile-hide');
  
  this.$topHeaderTexts.removeClass('thick-underline');
  this.$locationHeaderText.addClass('thick-underline');
};

let initialize = () => {
	this.$tabs = $('.tab-content > div');
	
  this.$viewMoreLocations = $('.view-more-locations');
  this.$showMoreLocations = $('.show-more-locations');
	
  this.$topHeaderTexts = $('.top-headers-text');
  this.$locationHeaderText = $('.location-header-text');

	this.viewMoreText = this.$viewMoreLocations.data('view-more');
	this.viewLessText = this.$viewMoreLocations.data('view-less');

	this.$viewMoreLocations.on('click', _showMoreLocations);
  this.$topLocationsHeader.on('click', _toggleTabs);
};

module.exports = {
	initialize
};
