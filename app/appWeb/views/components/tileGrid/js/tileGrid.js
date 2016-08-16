'use strict';

// http://isotope.metafizzy.co/extras.html#browserify
let $ = require('jquery');
let Isotope = require('isotope-layout');
require('jquery-bridget');
let adTile = require('app/appWeb/views/components/adTile/js/adTile.js');
let LocationUtils = require('public/js/common/utils/LocationUtils.js');

let filterMax = 16;
// cannot be arrow function, scoping issue referencing 'this'
let _filterFunction = function() {
	let index = $(this).attr('data-index');
	return parseInt(index) < filterMax;
};

let _getLocSuccess = (resp) => {
	if (resp.id) {
		window.location.href = "/search.html?locId=" + resp.id;
	} else {
		window.location.href = "/search.html";
	}
};

let _getLocFailure = (resp) => {
	console.log(resp);
	window.location.href = "/search.html";
};

let initialize = () => {
	let isotopeHandler = $('.use-isotope-handler');
	let isotopeOptions = {
		itemSelector: '.tile-item',
		layoutMode: 'masonry',
		masonry: {
			columnWidth: '.column-sizer',
			gutter: '.gutter-sizer-horizontal',
			isFitWidth: true
		},
		filter: _filterFunction
	};

	adTile.initialize();
	// Isotope requires document to be ready activated
	$(document).ready(() => {
		$.bridget('isotope', Isotope);	// after this you can use $().isotope()
		isotopeHandler.addClass("using-isotope");	// tag so we get configured sizes
		isotopeHandler.isotope(isotopeOptions);
	});

	// 'View More' click handler
	$(".card-view-more .link").on("click", () => {
		filterMax += 16;
		console.log(filterMax);
		if (filterMax <= 48) {
			isotopeHandler.isotope(isotopeOptions);
			isotopeHandler.trigger("scroll"); // trigger lazyload in webkit browsers
		} else {
			// nav to SRP
			// window.location.href = "/search.html?locId=" + result.location;
			LocationUtils.getLocationId(_getLocSuccess, _getLocFailure);
		}
	});
};

module.exports = {
	initialize
};

