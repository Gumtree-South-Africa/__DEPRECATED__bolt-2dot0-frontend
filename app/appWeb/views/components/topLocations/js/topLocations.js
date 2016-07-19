'use strict';

let $ = require('jquery');

let initialize = () => {

	let _showMoreLocations = (e) => {
		$('.show-more-locations').removeClass('hide');
		$('.view-more-locations').addClass('hide');
		$('.desktop-seo').css('display', 'none');
	};

	let _toggleTabs = (e) => {
		$('.top-searches').addClass('mobile-hide');
		$('.top-locations').removeClass('mobile-hide');
		$('.search-header-text').removeClass('thick-underline');
		$('.location-header-text').addClass('thick-underline');
	};

	$(document).ready(() => {
		$('.view-more-locations').on('click', (e) => {
			_showMoreLocations(e);
		});
		$('.top-locations-header').on('click', (e) => {
			_toggleTabs(e);
		});
	});
};

module.exports = {
	initialize
};
