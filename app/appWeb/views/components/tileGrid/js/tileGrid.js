'use strict';

// http://isotope.metafizzy.co/extras.html#browserify
let $ = require('jquery');
let Isotope = require('isotope-layout');
require('jquery-bridget');
let adTile = require('app/appWeb/views/components/adTile/js/adTile.js');

let initialize = () => {
	adTile.initialize();
	// Isotope requres document to be ready activated
	$(document).ready(() => {

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
	});
};

module.exports = {
	initialize
};

