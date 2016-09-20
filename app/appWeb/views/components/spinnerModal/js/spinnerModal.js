'use strict';

// let myDependency = require("../path/to/dependency");

class SpinnerModal {
	initialize() {
		this.$modal = $("#spinner-modal");
		this.$loadingSpinner = this.$modal.find(".loading-spinner");
	}

	completeSpinner(completionCb) {
		this.$loadingSpinner.addClass("complete");
		setTimeout(() => {
			completionCb();
			this.hideModal();
		}, 300);
	}

	showModal() {
		this.$modal.removeClass("hidden");
	}

	hideModal() {
		this.$modal.addClass("hidden");
		this.$loadingSpinner.removeClass("complete");
	}
}

module.exports = new SpinnerModal();
