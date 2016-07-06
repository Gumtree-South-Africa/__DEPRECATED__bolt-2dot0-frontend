'use strict';

 let $ = require("jquery");

let _newTypeAhead = (currentTypingValue) => {
	if (this.currentTypeAheadAjaxMap[currentTypingValue]) {
		return; // already searching this value currently
	} else {
		// push textbox value into the queue
		this.currentTypeAheadQueue.push(currentTypingValue);

		this.currentTypeAheadAjaxMap[currentTypingValue] = $.ajax({
			url: "/server/services/mockData",
			method: "GET",
			success: () => {
				let currentQueueIndex = this.currentTypeAheadQueue.indexOf(currentTypingValue);

				for (let i = 0; i < currentQueueIndex; i++) {
					currentQueueIndex--;
					let tempOldValue = this.currentTypeAheadQueue.shift();

					// abort previous ajax requests
					this.currentTypeAheadAjaxMap[tempOldValue].abort();
					delete this.currentTypeAheadAjaxMap[tempOldValue];
				}

				// remove succeeded request from map
				delete this.currentTypeAheadAjaxMap[currentTypingValue];
			}
		});
	}
};

let _setIsTyping = (isTyping) => {
	this.$searchControls.toggleClass("is-typing", isTyping)
};

let initialize = () => {
	this.$searchControls = $("#search-controls");

	this.currentTypeAheadQueue = [];
	this.currentTypeAheadAjaxMap = {};

	this.$searchTextbox = this.$searchControls.find(".search-textbox");

	let eventName = ('oninput' in this.$searchTextbox[0]) ? 'input' : 'keyup';

	this.$searchTextbox.on(eventName, () => {
		let textBoxVal = this.$searchTextbox.val();
		_setIsTyping(textBoxVal !== "");
		// _newTypeAhead(textBoxVal);
	});

	this.$searchControls.find(".close-search").on('click', () => {
		_setIsTyping(false);
		this.$searchTextbox.val('');
		this.$searchTextbox.focus();
	});
};

module.exports = {
	// "public" functions
	initialize,
};



