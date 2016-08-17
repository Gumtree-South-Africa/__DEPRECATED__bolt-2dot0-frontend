'use strict';

// http://isotope.metafizzy.co/extras.html#browserify
let $ = require('jquery');
let Isotope = require('isotope-layout');
require('jquery-bridget');
let adTile = require('app/appWeb/views/components/adTile/js/adTile.js');
let BreakpointMap = require('app/appWeb/views/components/tileGrid/js/BreakpointMap.js')

// let filterFunction = function() {
// 	let index = $(this).attr('data-index');
// 	return parseInt(index) < filterMax;
// };

let resetSizeClasses = (tiles) => {
	// ex: sizeClasses = ['one-by-one', ...
	let sizeClasses = this.breakpointMap.getSizeClasses();
	// ex: sizes = 'ABCDABCD...'
	let sizes = this.breakpointMap.breakpointToSizeMap[this.currentBreakpoint];
	// ex: sizeToClassMap = { 'A': 'one-by-one', ...
	let sizeToClassMap = this.breakpointMap.TILE_SIZE_CLASSES_MAP;

	for (let index = 0; index < tiles.length; index++) {

		// lookup our size in terms of A,B,C,D - wrap index to repeat the pattern for more tiles than we have in the map
		let  sizeMapIndex = index % (sizes.length-1);
		let className = sizeToClassMap[sizes.charAt(index)];

		let tile = tiles[index];
		for (let i = 0; i < sizeClasses.length; i++) {
			$(tile).toggleClass(sizeClasses[i], false);
		}
		$(tile).toggleClass(className, true);
	}
};




let handleBreakpointChanged = (breakpoint) => {
	console.log(`handle breakpoint changed ${breakpoint}`);

	let tiles = this.$body.find('.tile-item');
	resetSizeClasses(tiles);

	console.log("j");
}

// onReady separated out for easy testing
let onReady = () => {
	// Isotope requres document to be ready activated
	$.bridget('isotope', Isotope);	// after this you can use $().isotope()

	$('.use-isotope-handler').addClass("using-isotope");	// tag so we get configured sizes

	$('.use-isotope-handler').isotope({
		itemSelector: '.tile-item',
		layoutMode: 'masonry',
		masonry: {
			columnWidth: '.column-sizer',
			gutter: '.gutter-sizer-horizontal',
			isFitWidth: true
		}
	});
}

// Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
let initialize = (registerOnReady = true) => {

	adTile.initialize();
	this.breakpointMap = new BreakpointMap();

	this.$body = $('body');

	this.currentBreakpoint = this.breakpointMap.nearestBreakpoint(window.innerWidth);

	this.$body.on('breakpointChanged', (event, newBreakpoint, oldBreakpoint) => {
		console.log(`breakpoint changed ${newBreakpoint} ${oldBreakpoint}`);
		handleBreakpointChanged(newBreakpoint);
	});

	this.$body.trigger('breakpointChanged', this.currentBreakpoint);

	$(window).bind('resize', () => {
		let breakpoint = this.breakpointMap.nearestBreakpoint(window.innerWidth);
		if (breakpoint !== this.currentBreakpoint) {
			this.$body.trigger('breakpointChanged', [breakpoint, this.currentBreakpoint]);
			this.currentBreakpoint = breakpoint;
		}
	});

	if (registerOnReady) {
		$(document).ready(onReady);
	}

};

module.exports = {
	initialize
};

