'use strict';
require('../_tileGrid.scss');
require('app/views/components/adTile/js/adTile.js');
require('app/views/components/feedTile/js/feedTile.js');
require('app/views/components/responsiveBreakpointDetection/js/responsiveBreakpointDetection.js');
let Isotope = require('isotope-layout');

// Isotope requres document to be ready activated
$(document).ready(() => {
	window.iso = new Isotope($('.isotope-container')[0], {
		itemSelector: '.isotope-item',
		layoutMode: 'masonry',
		getSortData: {
			sortParam: '[data-sort-position]'
		},
		masonry: {
			columnWidth: 110
		},
		sortBy: 'sortParam'
	});

	$(window).on('breakpointChange', (evt, breakpoint) => {
		let $feedTiles = $('.feed-tile');
		if (breakpoint === 'mobile') {
			$feedTiles.parent().attr('data-sort-position', 1);
		} else {
			$feedTiles.parent().attr('data-sort-position', 5);
		}

		window.iso.arrange({
			sortBy: 'sortParam'
		});
		window.iso.layout();
	});
});
