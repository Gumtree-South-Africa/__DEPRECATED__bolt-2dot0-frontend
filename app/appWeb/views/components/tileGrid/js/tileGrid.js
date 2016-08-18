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
	console.log(resp);
	window.location.href = "/search.html";
};

/**
 * when breakpoint changes we need to adjust tile sizes
 * @param {number} breakpoint
 */
let handleBreakpointChanged = (breakpoint) => {
	// console.log(`handle breakpoint changed ${breakpoint}`);

	let tiles = this.$body.find('.tile-item');
	this.breakpointMapper.adjustTileSizes(breakpoint, tiles);

	// adjust the outer container for this breakpoint, so it locks in the nested isotope container width
	// isotope likes to modify its own container widths, so we control it via the outer container
	$('.tile-grid-width-container').width(breakpoint);

	this.isotopeElement.isotope('layout');
}

// cannot be arrow function, scoping issue referencing 'this'
let _filterFunction = function() {
	let index = $(this).attr('data-index');
	return parseInt(index) < filterMax;
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
	window.temp = this.isotopeElement;
	this.$body.trigger('breakpointChanged', this.currentBreakpoint);

}

/**
 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
 * @param registerOnReady
 */
let initialize = (registerOnReady = true) => {

	this.$body = $('body');
	this.isotopeElement = $('.use-isotope-handler');
	// we clear this class since we're handling it in javascript
	this.isotopeElement.toggleClass('use-isotope-handler', false);

	this.breakpointMapper = new BreakpointTileSizeMapper();
	this.currentBreakpoint = this.breakpointMapper.nearestBreakpoint(window.innerWidth);

	this.$body.on('breakpointChanged', (event, newBreakpoint, oldBreakpoint) => {
		// console.log(`breakpoint changed ${oldBreakpoint} => ${newBreakpoint}`);
		handleBreakpointChanged(newBreakpoint);
	});

	$(window).bind('resize', () => {
		let breakpoint = this.breakpointMapper.nearestBreakpoint(window.innerWidth);
		if (breakpoint !== this.currentBreakpoint) {
			this.$body.trigger('breakpointChanged', [breakpoint, this.currentBreakpoint]);
			this.currentBreakpoint = breakpoint;
		}
	});

	let numTiles = $('.trending-card .tile-item').length;

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
	onReady,				// for testing
	getMapper,				// for testing
	getCurrentBreakpoint,	// for testing
	initialize
};

