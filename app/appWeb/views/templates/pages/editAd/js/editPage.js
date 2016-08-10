"use strict";

let locationModal = require("app/appWeb/views/components/modal/js/locationModal.js");
let photoCarousel = require('app/appWeb/views/components/photoCarousel/js/photoCarousel.js');

let _setHiddenLocationInput = (location) => {
	$.ajax({
		method: "GET",
		url: `/api/locate/locationlatlong?latLong=${encodeURIComponent(location.lat)}ng${encodeURIComponent(location.long)}`,
		success: (data) => {
			this.$locationLink.text(data.localizedName || this.defaultLocation);
		}
	});
};

let initialize = () => {
	locationModal.initialize(_setHiddenLocationInput);

	this.$locationLink = $("#edit-location-input");
	this.defaultLocation = this.$locationLink.data("default-location");

	photoCarousel.initialize({
		slickOptions: {
			arrows: true,
			infinite: false,
			slidesToShow: 4,
			slidesToScroll: 4
		},
		showDeleteImageIcons: true
	});
};

module.exports = {
	initialize
};
