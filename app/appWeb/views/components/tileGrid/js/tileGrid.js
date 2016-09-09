'use strict';

// http://isotope.metafizzy.co/extras.html#browserify
let $ = require('jquery');
let Isotope = require('isotope-layout');
require('jquery-bridget');
let adTile = require('app/appWeb/views/components/adTile/js/adTile.js');
let BreakpointTileSizeMapper = require('app/appWeb/views/components/tileGrid/js/BreakpointTileSizeMapper.js')
let LocationUtils = require('public/js/common/utils/LocationUtils.js');


let filterMax = 16;

let _getLocSuccess = (resp) => {
	if (resp.id) {
		window.location.href = "/search.html?locId=" + resp.id;
	} else {
		window.location.href = "/search.html";
	}
};

let _getLocFailure = (resp) => {
	window.location.href = "/search.html";
};

/**
 * when breakpoint changes we need to adjust tile sizes
 * @param {number} breakpoint
 */
let handleBreakpointChanged = (breakpoint) => {

	let tiles = this.$body.find('.tile-item');
	this.breakpointMapper.adjustTileSizes(breakpoint, tiles);

	// adjust the outer container for this breakpoint, so it locks in the nested isotope container width
	// isotope likes to modify its own container widths, so we control it via the outer container
	this.$tileGridWidthContainer.width(breakpoint);

	this.isotopeElement.isotope('layout');
};

// cannot be arrow function, scoping issue referencing 'this'
let _filterFunction = function() {
	let index = $(this).attr('data-index');
	return parseInt(index) < filterMax;
};


let syncFavoriteCookieWithTiles = ($tiles) => {
	let  favoriteIds = adTile.getCookieFavoriteIds();
	for  (let i = 0; i < favoriteIds.length; i++) {
		// lookup using short ad id because cookie must be compatible with RUI
		let selector = `[data-short-adid="${favoriteIds[i]}"]`;
		let tileElts = $tiles.find(selector);
		if (tileElts.length > 0) {
			adTile.toggleFavorite(tileElts[0]);
		}
	}
};


/**
 * onReady can be called separately when testing
 */
let onReady = () => {
	// Isotope requres document to be ready activated
	$.bridget('isotope', Isotope);	// after this you can use $().isotope()

	let isotopeOptions = {
		itemSelector: '.tile-item',
		layoutMode: 'masonry',
		masonry: {
			columnWidth: '.column-sizer',
			gutter: '.gutter-sizer-horizontal',
			fitWidth: true
		},
		filter: _filterFunction
	};

	this.isotopeElement.addClass("using-isotope");	// tag so we get configured sizes
	this.isotopeElement.isotope(isotopeOptions);
	this.$body.trigger('breakpointChanged', this.currentBreakpoint);

};

let _unbindBreakpoint = () => {
	this.$body.off('breakpointChanged');
};

/**
 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
 * @param registerOnReady
 */
let initialize = (registerOnReady = true) => {

	this.$body = $('body');
	this.isotopeElement = $('.use-isotope-handler');
	// we clear this class since we're handling it in javascript
	this.isotopeElement.toggleClass('use-isotope-handler', false);
	this.$tileGridWidthContainer = $('.tile-grid-width-container');	// for efficiency, it is used in breakpointChanged

	this.breakpointMapper = new BreakpointTileSizeMapper();
	this.currentBreakpoint = this.breakpointMapper.nearestBreakpoint(window.innerWidth);

	this.$body.on('breakpointChanged', (event, newBreakpoint, oldBreakpoint) => {
		handleBreakpointChanged(newBreakpoint);
	});

	$(window).bind('resize', () => {
		let breakpoint = this.breakpointMapper.nearestBreakpoint(window.innerWidth);
		if (breakpoint !== this.currentBreakpoint) {
			this.$body.trigger('breakpointChanged', [breakpoint, this.currentBreakpoint]);
			this.currentBreakpoint = breakpoint;
		}
	});

	let $tiles = $('.tile-container .tile-item');

	syncFavoriteCookieWithTiles($tiles);

	let numTiles = $tiles.length;

	adTile.initialize();

	// 'View More' click handler
	$(".card-view-more .link").on("click", () => {
		filterMax += 16;
		if (filterMax <= 48 && filterMax <= numTiles) {
			this.isotopeElement.isotope();
			this.isotopeElement.trigger("scroll"); // trigger lazyload in webkit browsers
		} else {
			// nav to SRP
			// window.location.href = "/search.html?locId=" + result.location;
			LocationUtils.getLocationId(_getLocSuccess, _getLocFailure);
		}
	});

	if (registerOnReady) {
		$(document).ready(onReady);
	}

};

let getMapper = () => {
	return this.breakpointMapper;
};

let getCurrentBreakpoint = () => {
	return this.currentBreakpoint;
};

module.exports = {
	_unbindBreakpoint,
	onReady,				// for testing
	getMapper,				// for testing
	getCurrentBreakpoint,	// for testing
	initialize
};

