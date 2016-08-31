'use strict';

// http://isotope.metafizzy.co/extras.html#browserify
let $ = require('jquery');
let Isotope = require('isotope-layout');
require('jquery-bridget');
let adTile = require('app/appWeb/views/components/adTile/js/adTile.js');
let BreakpointTileSizeMapper = require('app/appWeb/views/components/tileGrid/js/BreakpointTileSizeMapper.js');
let LocationUtils = require('public/js/common/utils/LocationUtils.js');
let TileCard = require('app/appWeb/views/components/tileGrid/js/TileCard.js');



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

	// process card instances separately
	let keys = Object.keys(this.tileCards);
	keys.forEach( (key) => {
		let tiles = this.tileCards[key].tiles;
		this.breakpointMapper.adjustTileSizes(breakpoint, tiles);
	});

	// adjust the outer container for this breakpoint, so it locks in the nested isotope container width
	// isotope likes to modify its own container widths, so we control it via the outer container
	this.$tileGridWidthContainer.width(breakpoint);

	this.isotopeElement.isotope('layout');
}

let _filterFunction = (index, itemElem) => {
	let dataIndex = $(itemElem).attr('data-index');
	let filterMax = this.tileCards[$(itemElem).closest('.card').data('card-name')].filterMax;
	return parseInt(dataIndex) < filterMax;
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

let _getMoreGalleryItems = (offset, limit, success, error) => {

	let url = `/api/ads/gallery/card?offset=${offset}&limit=${limit}`;

	$.ajax({
		url: url,
		type: "GET",
		success: success,
		error: error
	});
};

// each card type can have different behaviors for View More

/**
 * allow more to be displayed up to the number rendered by the server
 * @param state
 * @private
 */
let _viewMoreTrendingCard = (state) => {

	let numTiles = state.tiles.length;

	// allow more to be displayed up to the number rendered by the server
	if (state.filterMax < numTiles) {
		// we have more tiles to show the user
		state.filterMax += state.itemsPerPage;	// move our filter threshold ahead
		this.isotopeElement.isotope();
		this.isotopeElement.trigger("scroll"); // trigger lazyload in webkit browsers
	} else {
		// nav to SRP
		// window.location.href = "/search.html?locId=" + result.location;
		LocationUtils.getLocationId(_getLocSuccess, _getLocFailure);
	}
};

/**
 * ajax more until there are no more to get
 * @param state
 * @private
 */
let _viewMoreGalleryCard = (state) => {
	if (state.viewMoreAjaxOffset === -1) {
		// already at the end, ignore
		return;
	}
	// ajax more data
	_getMoreGalleryItems(state.viewMoreAjaxOffset, state.itemsPerPage ,(data) => {
			// now we need to add them in
			console.log(data);
			if (data.nextAjaxUrl) {
				state.viewMoreAjaxOffset++;
			} else {
				// create tiles from the data

				// disable the link style-wise
				let link = $(state.cardElement).find('.card-view-more .link');
				link.toggleClass("disable");
				state.viewMoreAjaxOffset = -1;	// signal to our handler, no more data
			}
		}, (/*res*/) => {
			// there is no UX for a failure here, we just ignore any issues
		}
	);
};

/**
 * user clicked on View More link
 * @param evt
 * @private
 */
let _onViewMore  = (evt) => {
	let $target = $(evt.currentTarget);
	let cardName = $target.closest('.card').data('card-name');
	let state = this.tileCards[cardName];

	if (cardName === "trendingCard") {

		_viewMoreTrendingCard(state);

	} else if (cardName === "galleryCard") {

		_viewMoreGalleryCard(state);

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

/**
 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
 * @param registerOnReady
 */
let initialize = (registerOnReady = true) => {

	// setup the tile cards to hold our state information specific to a card
	this.tileCards = {};
	let $tileCards = $('.card');
	$tileCards.each((index, cardElement) => {
		let tileCard = new TileCard(cardElement);
		this.tileCards[tileCard.getName()] = tileCard;
		tileCard.tiles = $(cardElement).find('.tile-item');

		tileCard.filterMax = 16;		// trending
		tileCard.viewMoreAjaxOffset = 1;	// gallery
		tileCard.itemsPerPage = 16;
	});

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

	let allTiles = $('.tile-container .tile-item');	// all tiles regardless of which card
	syncFavoriteCookieWithTiles(allTiles);


	adTile.initialize();

	// 'View More' click handler
	$(".card-view-more .link").on("click", _onViewMore);

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

