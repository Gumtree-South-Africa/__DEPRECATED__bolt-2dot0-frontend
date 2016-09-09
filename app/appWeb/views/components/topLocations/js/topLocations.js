'use strict';

let _showMoreLocations = () => {
	$('.show-more-locations').removeClass('hide');
	$('.view-more-locations').addClass('hide');
	$('.desktop-seo').css('display', 'none');
};

let _toggleTabs = () => {
	$('.top-searches').addClass('mobile-hide');
	$('.top-locations').removeClass('mobile-hide');
	$('.search-header-text').removeClass('thick-underline');
	$('.location-header-text').addClass('thick-underline');
};

let initialize = () => {
	$(document).ready(() => {
		$('.view-more-locations').on('click', _showMoreLocations);
		$('.top-locations-header').on('click', _toggleTabs);
	});
};

module.exports = {
	initialize
};
