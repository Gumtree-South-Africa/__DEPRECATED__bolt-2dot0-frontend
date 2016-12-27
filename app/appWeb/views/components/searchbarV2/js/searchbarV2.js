'use strict';

let CookieUtils = require("public/js/common/utils/CookieUtils.js");
// Commenting out for lint
// /**
//  * abort and remove an ajax request from the currentTypeAheadAjaxMap
//  * @param {string} key - search term for ajax request to be removed
//  * @private
//  */
// let _removeFromAjaxMap = (key) => {
//
// 	let tempAjax = this.currentTypeAheadAjaxMap[key];
//
// 	if (tempAjax) {
// 		// abort the current running ajax request to free open the browser port
// 		this.currentTypeAheadAjaxMap[key].abort();
// 		// remove instance from the map
// 		delete this.currentTypeAheadAjaxMap[key];
// 	}
// };

class SearchBar {
	/**
	 * sets the is typing class on the search controls so while typing styles can be applied
	 * @param {boolean} isTyping
	 * @private
	 */
	_setIsTyping(isTyping) {
		this.$searchControls.toggleClass("is-typing", isTyping);
		this.$searchMask.toggleClass("is-typing", isTyping);
		$("body").toggleClass("disable-scroll-mobile", isTyping);
	}

	_unbindTypeAheadResultsEvents() {
		this.$typeAheadResults.find(".type-ahead-results-row").off();
	}

	_bindTypeAheadResultsEvents() {
		let $resultsRows = this.$typeAheadResults.find(".type-ahead-results-row");

		$resultsRows.on('mouseenter', (evt) => {
			let $active = this.$typeAheadResults.find(".active");

			// they have mouse entered after having selected one via arrow keys
			// clear out the old selection
			if ($active.length !== 0) {
				$active.removeClass("active");
			}

			$(evt.currentTarget).addClass("active");
		});

		$resultsRows.on('mouseleave', (evt) => {
			$(evt.currentTarget).removeClass("active");
		});
	}

	/**
	 * Display results of type ahead search in the type ahead container
	 * @param {obj} results - results of the type ahead ajax request
	 * @private
	 */
	_displayTypeAheadResults(results) {
		let hasResults = results.items.length > 0;
		let $ul = this.$typeAheadResults.find("ul");

		$ul.empty();

		if (hasResults) {
			this._unbindTypeAheadResultsEvents();

			// insert new results into the results container
			results.items.forEach((result) => {
				console.warn(result);
				// removing locationId per https://jira.corp.ebay.com/browse/BOLT-23578
				// &locId=${result.location}
				// as part of this change, the location is going to be passed into the ajax query for type-ahead search terms (via searchLocId cookie)
				// so the terms should all be in preferred location anyway
				// if we don't have a cookie, we might get terms back from other locations, but we aren't going to pass them along to the SRP
				let templateString = `<li class="type-ahead-results-row"><a class="type-ahead-link" href="/search.html?q=${result.keyword}&locId=${result.location}&catId=${result.category}">${result.keyword}</a></li>`;
				$ul.append(templateString);
			});

			// handler to update search bar text with clicked link
			$('.type-ahead-link').on('click', (evt) => {
				this.$searchTextbox.val(evt.target.text);
			});

			this._bindTypeAheadResultsEvents();
		}
	}

	/**
	 * Makes new TypeAheadAjax request and pushes the results onto the currentTypeAheadQueue
	 * @param {string} currentSearchTerm - search term to begin type ahead search
	 * @private
	 */
	_newTypeAhead(currentSearchTerm) {

		// // already searching this value currently, make it the last in the queue so it doesnt get overwritten
		// if (this.currentTypeAheadAjaxMap[currentSearchTerm]) {
		// 	let index = this.currentTypeAheadQueue.indexOf(currentSearchTerm);
		//
		// 	while (this.currentTypeAheadQueue.length > index + 1) {
		// 		let searchedVal = this.currentTypeAheadQueue.pop();
		// 		_removeFromAjaxMap(searchedVal);
		// 	}
		// } else if (this.currentTypeAheadQueue.length > 2) {
		// 	// keep the queue at or below 3 requests so we don't hog all the browser ports
		// 	while(this.currentTypeAheadQueue.length > 2) {
		// 		let searchedVal = this.currentTypeAheadQueue.shift();
		// 		_removeFromAjaxMap(searchedVal);
		// 	}
		// } else {
		// 	// push textbox value into the queue
		// 	this.currentTypeAheadQueue.push(currentSearchTerm);
		//
		// 	// make the ajax request and save it in the AjaxMap
		// 	this.currentTypeAheadAjaxMap[currentSearchTerm] =
		// $.ajax({
		// 	url: "/api/search/autocomplete",
		// 	method: "POST",
		// 	data: {searchterm: currentSearchTerm},
		// 	dataType: 'json',
		// 	success: (results) => {
		// 		let currentQueueIndex = this.currentTypeAheadQueue.indexOf(currentSearchTerm);
		//
		// 		// base case, first request in queue skip the cleaning
		// 		if (currentQueueIndex > 0) {
		// 			for (let i = 0; i < currentQueueIndex; i++) {
		// 				let tempOldValue = this.currentTypeAheadQueue.shift();
		//
		// 				// abort previous ajax requests
		// 				_removeFromAjaxMap(tempOldValue);
		// 			}
		// 		}
		//
		// 		// remove succeeded request from map
		// 		delete this.currentTypeAheadAjaxMap[currentSearchTerm];
		//
		// 		_displayTypeAheadResults(results);
		// 	}
		// });

		//}

		if (this.currentTypeAheadRequest) {
			this.currentTypeAheadRequest.abort(); // aborting old request
		}

		let postData = {
			searchterm: currentSearchTerm
		};
		// also add the location if we have one, this will narrow down results to only the cookied location
		let locId = CookieUtils.getCookie('searchLocId');
		if (locId) {
			postData.location = locId;
		}
		if (currentSearchTerm !== "") {
			this.currentTypeAheadRequest = $.ajax({
				url: "/api/search/autocomplete",
				method: "POST",
				data: postData,
				dataType: 'json',
				success: (results) => {
					this.currentTypeAheadRequest = null;
					this._displayTypeAheadResults(results);
				}
			});
		}
	}

	_selectItem() {
		let $active = this.$typeAheadResults.find(".active");
		if ($active.length === 0) {
			this.$searchButton.click();
		} else {
			$active.find("a")[0].click();
		}
	}

	_highlightPrevItem() {
		let $active = this.$typeAheadResults.find(".active");
		if ($active.length === 0) {
			this.$typeAheadResults.find(".type-ahead-results-row").last().addClass("active");
		} else {
			$active.removeClass("active").prev(".type-ahead-results-row").addClass("active");
		}
	}

	_highlightNextItem() {
		let $active = this.$typeAheadResults.find(".active");
		if ($active.length === 0) {
			this.$typeAheadResults.find(".type-ahead-results-row").first().addClass("active");
		} else {
			$active.removeClass("active").next(".type-ahead-results-row").addClass("active");
		}
	}

	isOnPage() {
		return this.$searchControls && this.$searchControls.length > 0;
	}

	closeAutoComplete(dontClearText, dontFocusTextbox) {
		if (!this.$searchTextbox.val()) {
			this._setIsTyping(false);
		} else {
			if (!dontClearText) {
				this.$searchTextbox.val('');
			}
			if (!dontFocusTextbox) {
				this.$searchTextbox.focus();
			}
		}
	}

	/**
	 * Sets up module for use and binds events to the dom
	 */
	initialize() {
		this.$searchControls = $("#search-controls");

		this.currentTypeAheadQueue = [];
		this.currentTypeAheadAjaxMap = {};
		this.$searchMask = $('#search-mask');

		this.$searchTextbox = this.$searchControls.find("input.search-textbox");
		this.$typeAheadResults = this.$searchControls.find("#type-ahead-results");
		this.$searchButton = this.$searchControls.find(".search-button");

		if (this.$searchTextbox.length > 0) {
			let eventName = ('oninput' in this.$searchTextbox[0]) ? 'input' : 'keyup';


			this.$searchTextbox.on(eventName, () => {
				let textBoxVal = this.$searchTextbox.val();
				// _setIsTyping(textBoxVal !== "");
				this._newTypeAhead(textBoxVal);
			});

			this.$searchTextbox.on('focus', () => {
				this._setIsTyping(true);
			});

			this.$searchMask.on('click', () => {
				this.closeAutoComplete(true, true);
			});

			this.$searchTextbox.on('keyup', (evt) => {
				switch (evt.keyCode) {
					case 38:
						this._highlightPrevItem();
						evt.preventDefault();
						break;
					case 40:
						this._highlightNextItem();
						evt.preventDefault();
						break;
					case 13:
						this._selectItem();
						evt.preventDefault();
						break;
					case 27:
						this.closeAutoComplete(true);
						evt.preventDefault();
						break;
					default:
						break;
				}

			});

			this.$searchControls.find(".close-search").on('click', () => {
				this.closeAutoComplete();
			});
		}

	}
}


module.exports = new SearchBar();
