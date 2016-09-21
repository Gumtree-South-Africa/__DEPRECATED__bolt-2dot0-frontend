'use strict';

// let myDependency = require("../path/to/dependency");

class SpinnerModal {
	initialize() {
		this.$modal = $("#spinner-modal");
		this.$loadingSpinner = this.$modal.find(".loading-spinner");
	}

	completeSpinner(completionCb) {
		if (this.$modal) {
			this.$loadingSpinner.addClass("complete");
			setTimeout(() => {
				completionCb();
				this.hideModal();
			}, 600);
		}
	}

	showModal() {
		if (this.$modal) {
			this.$modal.removeClass("hidden");
		}
	}

	hideModal() {
		if (this.$modal) {
			this.$modal.addClass("hidden");
			this.$loadingSpinner.removeClass("complete");
		}
	}
}

module.exports = new SpinnerModal();
