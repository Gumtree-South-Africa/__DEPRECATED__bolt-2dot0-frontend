'use strict';
let locationModal = require("app/appWeb/views/components/modal/js/locationModal.js");
let categorySelectionModal = require("app/appWeb/views/components/categorySelectionModal/js/categorySelectionModal.js");

let _setHiddenLocationInput = (location) => {
	$.ajax({
		method: "GET",
		url: "/api/locate/locationlatlong?latLong=" + location.lat.toString() + "ng" + location.long.toString(),
		success: (data) => {
			this.$locationLink.text(data.localizedName || this.defaultLocation);
		}
	});
};

let initialize = () => {
	locationModal.initialize(_setHiddenLocationInput);
	categorySelectionModal.initialize();

	this.$detailsSection = $("#main-detail-edit");

	this.$locationLink = $("#edit-location-input");
	this.defaultLocation = this.$locationLink.data("default-location");
	this.$categoryChangeLink = this.$detailsSection.find(".category-name-display");

	this.$categoryChangeLink.click(categorySelectionModal.openModal);
};

module.exports = {
	initialize
};
