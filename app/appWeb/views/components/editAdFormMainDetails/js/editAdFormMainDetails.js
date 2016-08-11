'use strict';
let locationModal = require("app/appWeb/views/components/modal/js/locationModal.js");

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

	this.$locationLink = $("#edit-location-input");
	this.defaultLocation = this.$locationLink.data("default-location");
};

module.exports = {
	initialize
};
