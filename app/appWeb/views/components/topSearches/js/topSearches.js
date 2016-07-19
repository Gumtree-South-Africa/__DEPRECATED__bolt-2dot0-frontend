'use strict';

let $ = require('jquery');

let initialize = () => {

	let _showMoreSearches = (e) => {
		$('.show-more-searches').removeClass('hide');
		$('.view-more-searches').addClass('hide');
		$('.desktop-seo').css('display', 'none');
	};

	let _toggleTabs = (e) => {
		$('.top-searches').removeClass('mobile-hide');
		$('.top-locations').addClass('mobile-hide');
		$('.location-header-text').removeClass('thick-underline');
		$('.search-header-text').addClass('thick-underline');
	};

	$(document).ready(() => {
		$('.view-more-searches').on('click', (e) => {
			_showMoreSearches(e);
		});

		$('.top-searches-header').on('click', (e) => {
			_toggleTabs(e);
		});
	});
};

module.exports = {
	initialize
};
