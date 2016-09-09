'use strict';

let _showMoreSearches = () => {
	$('.show-more-searches').removeClass('hide');
	$('.view-more-searches').addClass('hide');
	$('.desktop-seo').css('display', 'none');
};

let _toggleTabs = () => {
	$('.top-searches').removeClass('mobile-hide');
	$('.top-locations').addClass('mobile-hide');
	$('.location-header-text').removeClass('thick-underline');
	$('.search-header-text').addClass('thick-underline');
};

let initialize = () => {
	$(document).ready(() => {
		$('.view-more-searches').on('click', _showMoreSearches);
		$('.top-searches-header').on('click', _toggleTabs);
	});
};

module.exports = {
	initialize
};
