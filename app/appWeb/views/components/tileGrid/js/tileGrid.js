'use strict';

// http://isotope.metafizzy.co/extras.html#browserify

let Isotope = require('isotope-layout');
require('jquery-lazyload');
require('jquery-bridget');
let adTile = require('app/appWeb/views/components/adTile/js/adTile.js');
let BreakpointTileSizeMapper = require('app/appWeb/views/components/tileGrid/js/BreakpointTileSizeMapper.js');
let LocationUtils = require('public/js/common/utils/LocationUtils.js');
let TileCard = require('app/appWeb/views/components/tileGrid/js/TileCard.js');
let clientHbs = require("public/js/common/utils/clientHandlebars.js");


/**
 * redirect to the search page depending on location id received
 * @param resp
 * @private
 */
let _redirectToSearch = (resp) => {
	if (resp && resp.id) {
		window.location.href = "/search.html?locId=" + resp.id;
	} else {
		window.location.href = "/search.html";
	}
};

/**
 * get the tiles for the specified card
 * @param state
 * @return {*|jQuery} array of tiles
 * @private
 */
let _getTilesForCard = (state) => {
	return $(state.cardElement).find('.tile-item');
};


/**
 * when breakpoint changes we need to adjust tile sizes
 * @param {number} breakpoint
 */
let handleBreakpointChanged = (breakpoint) => {

	// process card instances separately
	let keys = Object.keys(this.tileCards);
	keys.forEach( (key) => {
		let tiles = _getTilesForCard(this.tileCards[key]);
		this.breakpointMapper.adjustTileSizes(breakpoint, tiles);
	});

	// adjust the outer container for this breakpoint, so it locks in the nested isotope container width
	// isotope likes to modify its own container widths, so we control it via the outer container
	this.$tileGridWidthContainer.width(breakpoint);

	this.isotopeElement.isotope('layout');
}


/**
 * show the highlight state for each ad id in the cookie
 * @param $tiles (expected to receive all tiles, regardless of which card it belongs to)
 */
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
 * Ajax gallery card items
 * @param offset (i.e. page number)
 * @param limit (i.e. page size)
 * @param success callback
 * @param error callback
 * @private
 */
let _getMoreGalleryItems = (offset, limit, success, error) => {

	let url = `/api/ads/gallery/card?offset=${offset}&limit=${limit}`;

	$.ajax({
		url: url,
		type: "GET",
		success: success,
		error: error
	});
};

// NOTE: each card can have different behaviors for View More

/**
 * allow more to be displayed up to the number rendered by the server
 * @param state
 * @private
 */
let _viewMoreTrendingCard = (state) => {

	let numTiles = _getTilesForCard(state).length;

	// allow more to be displayed up to the number rendered by the server
	if (state.currentFilterThreshold < numTiles) {
		// we have more tiles to show the user
		state.currentFilterThreshold += state.viewMoreFilterIncrement;	// move our filter threshold ahead
		this.isotopeElement.isotope('arrange');
		this.isotopeElement.trigger("scroll"); // trigger lazyload in webkit browsers
	} else {
		// nav to SRP
		// window.location.href = "/search.html?locId=" + result.location;
		LocationUtils.getLocationId(_redirectToSearch, _redirectToSearch);
	}
};

/**
 * ajax more tiles into the view until there are no more to get
 * @param state
 * @private
 */
let _viewMoreGalleryCard = (state) => {
	if (state.viewMoreAjaxOffset === -1) {
		// already at the end, ignore (shouldn't happen because we hide the link)
		return;
	}
	// ajax more data
	_getMoreGalleryItems(state.viewMoreAjaxOffset, state.viewMorePageSize ,(data) => {
			// now we need to add the tiles we received

			// create tiles from the data
			let grid = clientHbs.renderTemplate("tileGrid", data);
			let tiles = $(grid).find('.tile-item');

			// now get the container and put the tiles in
			let container = $(state.cardElement).find('.tile-container');
			container.isotope('insert', tiles);

			tiles.find('img.lazy').lazyload({
				"skip_invisible": true
			});

			container.trigger("scroll"); // trigger lazyload in webkit browsers

			// setup for more when server says we have it
			if (data.moreDataAvailable) {
				state.viewMoreAjaxOffset++;
			} else  {
				// hide the view more link
				let link = $(state.cardElement).find('.card-view-more .link');
				link.toggleClass("hidden");
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
 * Filter function used by isotope (typ. of Trending Card)
 * @param index
 * @param itemElem
 * @return {boolean} true for item to show
 * @private
 */
let _filterFunction = (index, itemElem) => {
	let state = this.tileCards[$(itemElem).closest('.card').data('card-name')];
	if (state.cardName == "galleryCard") {
		return true;
	}
	let dataIndex = $(itemElem).attr('data-index');
	let currentFilterThreshold = state.currentFilterThreshold;
	return parseInt(dataIndex) < currentFilterThreshold;
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

	// for debugging you can listen like this: <images>.on("appear", () => {
	$('img.lazy').lazyload({
		"skip_invisible": true
	});
};

/**
 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
 * @param registerOnReady
 */
let initialize = (registerOnReady = true) => {

	// setup for client templates
	this.locale = $("#client-hbs-locale").data("locale");
	clientHbs.initialize(this.locale);

	// setup the tile cards to hold our state information specific to a card
	this.tileCards = {};
	let $tileCards = $('.card');

	$tileCards.each((index, cardElement) => {
		let tileCard = new TileCard(cardElement);
		this.tileCards[tileCard.getName()] = tileCard;	// map of card state keyed by name

		// pull configuration data from data attributes laid in by HBS into the DOM
		tileCard.viewMoreAjaxOffset = 1;										// gallery
		tileCard.viewMorePageSize = $(cardElement).data('view-more-page-size');		// gallery
		tileCard.viewMoreFilterIncrement = $(cardElement).data('view-more-filter-increment');	// trending
		tileCard.currentFilterThreshold = tileCard.viewMoreFilterIncrement;		// trending - initial filter setting
	});

	this.$body = $('body');
	this.isotopeElement = $('.use-isotope-handler');
	// we clear this class since we're handling it in javascript
	this.isotopeElement.toggleClass('use-isotope-handler', false);
	this.$tileGridWidthContainer = $('.tile-grid-width-container');	// for efficiency, it is used in breakpointChanged

	// setup breakpoint behavior for formatting tiles depending on breakpoint
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

	let allCardsTiles = $('.tile-container .tile-item');	// all tiles regardless of which card
	syncFavoriteCookieWithTiles(allCardsTiles);

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
	_redirectToSearch,		// for testing
	onReady,				// for testing
	getMapper,				// for testing
	getCurrentBreakpoint,	// for testing
	initialize
};

