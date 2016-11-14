'use strict';


let Isotope = require('isotope-layout');
require('jquery-lazyload');
require('jquery-bridget');
let adTile = require('app/appWeb/views/components/adTile/js/adTile.js');
let BreakpointTileSizeMapper = require('app/appWeb/views/components/tileGrid/js/BreakpointTileSizeMapper.js');
let LocationUtils = require('public/js/common/utils/LocationUtils.js');
let TileCard = require('app/appWeb/views/components/tileGrid/js/TileCard.js');
let clientHbs = require("public/js/common/utils/clientHandlebars.js");

class TileGrid {


	constructor() {
		this.pendingServerSync = false;		// used when getting watchlist cookie async (typ. after logout)
	}

	/**
	 * redirect to the search page depending on location id received
	 * @param resp
	 * @private
	 */
	_redirectToSearch(resp){
		if (resp && resp.id) {
			window.location.href = "/search.html?locId=" + resp.id;
		} else {
			window.location.href = "/search";
		}
	}

	/**
	 * get the tiles for the specified card
	 * @param state
	 * @return {*|jQuery} array of tiles
	 * @private
	 */
	_getTilesForCard(state) {
		return $(state.cardElement).find('.tile-item');
	}


	/**
	 * when breakpoint changes we need to adjust tile sizes
	 * @param {number} breakpoint
	 */
	_handleBreakpointChanged(breakpoint) {

		// process card instances separately
		let keys = Object.keys(this.tileCards);
		keys.forEach((key) => {
			let tiles = this._getTilesForCard(this.tileCards[key]);
			this.breakpointMapper.adjustTileSizes(breakpoint, tiles);
		});

		// adjust the outer container for this breakpoint, so it locks in the nested isotope container width
		// isotope likes to modify its own container widths, so we control it via the outer container
		this.$tileGridWidthContainer.width(breakpoint);

		this.isotopeElement.isotope('layout');
	}

	/**
	 * sets the watchlist cookie by calling the server
	 * RUI based API call, this is intentionally NOT a node API, only RUI currently supports this function
	 * uses flag pendingServerSync to prevent recursion
	 * @param success function to be called async
	 * @param $tiles the collection of tiles to be sync'd
	 * @private
	 */
	_serverSyncFavorites(success, $tiles) {
		//
		$.ajax({
			url: `/rui-api/synchwatchlist/model/synch/${$('html').data('locale')}`,
			type: 'GET',
			success: () => {
				success($tiles)
			},
			error: () => {
				// when running locally but without RUI, we expect a 404
				console.warn('failed to sync favorites with server');
				this.pendingServerSync = false;
			}
		});
	}

	/**
	 * show the highlight state for each ad id in the cookie
	 * transparently will ajax to server when there are no ids (logout clears watchlist cookie,
	 * this assumes user subsequently logged in, to get a fresh cookie we sync from server)
	 * @param $tiles (typ. expects to receive all tiles, regardless of which card it belongs to,
	 * can also receive tiles that have been newly ajaxed in)
	 */
	_syncFavoriteCookieWithTiles($tiles) {
		let favoriteIds = adTile.getCookieFavoriteIds();
		if (favoriteIds.length === 0 && !this.pendingServerSync) {
			// lets call sync with the server, we may be in a freshly logged in scenario
			console.warn('no favorites cookie, going to try sync favorites with server');
			this.pendingServerSync = true;
			// when the server sync finished, we're going to come back here, use pending flag to prevent infinite recursion
			this._serverSyncFavorites(this._syncFavoriteCookieWithTiles.bind(this), $tiles)
			return;
		}
		for (let i = 0; i < favoriteIds.length; i++) {
			adTile.toggleFavoriteById(favoriteIds[i], $tiles);
		}
		this.pendingServerSync = false;
	}

	/**
	 * Ajax gallery card items
	 * @param offset (i.e. page number)
	 * @param limit (i.e. page size)
	 * @param success callback
	 * @param error callback
	 * @private
	 */
	_getMoreGalleryItems(offset, limit, success, error) {

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
	_viewMoreTrendingCard(state) {

		let numTiles = this._getTilesForCard(state).length;

		// allow more to be displayed up to the number rendered by the server
		if (state.currentFilterThreshold < numTiles) {
			// we have more tiles to show the user
			state.currentFilterThreshold += state.viewMoreFilterIncrement;	// move our filter threshold ahead
			this.isotopeElement.isotope('arrange');	// raises arrangeComplete, we use to help with lazy load
		} else {
			// nav to SRP
			// window.location.href = "/search.html?locId=" + result.location;
			LocationUtils.getLocationId(this._redirectToSearch, this._redirectToSearch);
		}
	};

	/**
	 * ajax more tiles into the view until there are no more to get
	 * @param state
	 * @private
	 */
	_viewMoreGalleryCard(state) {
		if (state.viewMoreAjaxOffset === -1) {
			// already at the end, ignore (shouldn't happen because we hide the link)
			return;
		}
		// ajax more data
		this._getMoreGalleryItems(state.viewMoreAjaxOffset, state.viewMorePageSize, (data) => {
				// now we need to add the tiles we received

				// create tiles from the data
				let grid = clientHbs.renderTemplate("tileGrid", { tileGrid: data });
				let $tiles = $(grid).find('.tile-item');

				// now get the container and put the tiles in
				let container = $(state.cardElement).find('.tile-container');
				container.isotope('insert', $tiles);
				adTile.tilesAdded($tiles);
				this._syncFavoriteCookieWithTiles($tiles);

				// now we need to give the new tiles their appropriate size, but we need all the card's tiles
				this.breakpointMapper.adjustTileSizes(this.currentBreakpoint, this._getTilesForCard(state));
				container.isotope('layout');	// since sizes have changed, need to layout

				$tiles.find('img.lazy').lazyload({
					"skip_invisible": true,
					"effect" : "fadeIn",
					"effect_speed": 1000
				});

				// setup for more when server says we have it
				if (data.moreDataAvailable) {
					state.viewMoreAjaxOffset++;
				} else {
					// hide the view more link
					let link = $(state.cardElement).find('.card-view-more .link');
					link.toggleClass("hidden");
					state.viewMoreAjaxOffset = -1;	// signal to our handler, no more data
				}

			}, (/*res*/) => {
				// there is no UX for a failure here, we just ignore any issues
			}
		);
	}

	/**
	 * user clicked on View More link
	 * @param evt
	 * @private
	 */
	_onViewMore(evt) {
		let $target = $(evt.currentTarget);
		let cardName = $target.closest('.card').data('card-name');
		let state = this.tileCards[cardName];

		if (cardName === "trendingCard") {

			this._viewMoreTrendingCard(state);

		} else if (cardName === "galleryCard") {

			this._viewMoreGalleryCard(state);

		}
	}

	/**
	 * Filter function used by isotope (typ. of Trending Card)
	 * @param index
	 * @param itemElem
	 * @return {boolean} true for item to show
	 * @private
	 */
	_filterFunction(index, itemElem) {
		let state = this.tileCards[$(itemElem).closest('.card').data('card-name')];
		if (state.cardName == "galleryCard") {
			return true;
		}
		let dataIndex = $(itemElem).attr('data-index');
		let currentFilterThreshold = state.currentFilterThreshold;
		return parseInt(dataIndex) < currentFilterThreshold;
	}

	/**
	 * onReady can be called separately when testing
	 */
	onReady() {
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
			filter: this._filterFunction.bind(this)
		};

		this.isotopeElement.addClass("using-isotope");	// tag so we get configured sizes
		this.isotopeElement.isotope(isotopeOptions);
		this.isotopeElement.on('arrangeComplete', (event, filteredItems) => {
			// we are called twice per 'arrange', because there are 2 cards - trending and gallery,
			// but that wont matter for what we need to do
			// trigger the scroll event so lazy load takes a look at its items
			this.isotopeElement.trigger("scroll"); // trigger lazyload to take a look
		});

		this.$body.trigger('breakpointChanged', this.currentBreakpoint);

		// for debugging you can listen like this: <images>.on("appear", () => {
		$('img.lazy').lazyload({
			"skip_invisible": true,
			"effect": "fadeIn",
			"effect_speed": 1000
		});
	}

	/**
	 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
	 * @param registerOnReady
	 */
	initialize(registerOnReady = true) {

		// setup for client templates
		clientHbs.initialize();

		// setup the tile cards to hold our state information specific to a card
		this.tileCards = {};
		let $tileCards = $('.card');

		$tileCards.each((index, cardElement) => {
			let tileCard = new TileCard(cardElement);
			this.tileCards[tileCard.getName()] = tileCard;	// map of card state keyed by name

			// pull configuration data from data attributes laid in by HBS into the DOM
			tileCard.viewMoreAjaxOffset = 2;										// gallery
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
			this._handleBreakpointChanged(newBreakpoint);
		});

		$(window).bind('resize', () => {
			let breakpoint = this.breakpointMapper.nearestBreakpoint(window.innerWidth);
			if (breakpoint !== this.currentBreakpoint) {
				this.$body.trigger('breakpointChanged', [breakpoint, this.currentBreakpoint]);
				this.currentBreakpoint = breakpoint;
			}
		});

		let $allCardsTiles = $('.tile-container .tile-item');	// all tiles regardless of which card
		this._syncFavoriteCookieWithTiles($allCardsTiles);

		adTile.initialize();

		// 'View More' click handler
		$(".card-view-more .link").on("click", this._onViewMore.bind(this));

		if (registerOnReady) {
			$(document).ready(this.onReady.bind(this));
		}
	}

	getMapper() {
		return this.breakpointMapper;
	}

	getCurrentBreakpoint() {
		return this.currentBreakpoint;
	}
}

module.exports = new TileGrid();
