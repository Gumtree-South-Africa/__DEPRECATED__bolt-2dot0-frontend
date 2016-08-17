'use strict';
let locationModal = require("app/appWeb/views/components/modal/js/locationModal.js");
let EpsUpload = require('app/appWeb/views/components/uploadImage/js/epsUpload');
let categorySelectionModal = require("app/appWeb/views/components/categorySelectionModal/js/categorySelectionModal.js");
let customAttributes = require("app/appWeb/views/components/editFormCustomAttributes/js/editFormCustomAttributes.js");
let formChangeWarning = require('public/js/common/utils/formChangeWarning.js');

let _setHiddenLocationInput = (location) => {
	this.$locationLat.val(location.lat);
	this.$locationLng.val(location.long);
	$.ajax({
		method: "GET",
		url: `/api/locate/locationlatlong?lat=${encodeURIComponent(location.lat.toString())}&lng=${encodeURIComponent(location.long.toString())}`,
		success: (data) => {
			this.$locationLink.text(data.localizedName || this.defaultLocation);
		}
	});
};

let _successCallback = (response) => {
	window.onbeforeunload = () => {};
	window.location.href = response.vipLink;
};

let _failureCallback = (error) => {
	console.warn(error);
};

let _ajaxEditForm = () => {
	let serialized = {};
	$.each(this.$editForm.serializeArray(), (i, field) => {
		serialized[field.name] = field.value || '';
	});
	let lat = Number(serialized.locationLatitude);
	let lng = Number(serialized.locationLongitude);
	let $carouselImages = this.$photoCarousel.find('.carousel-item');
	let featured = this.$photoCarousel.find('.carousel-item.selected').data('image');
	let images = [];
	if (featured) {
		featured = this.epsUpload.convertThumbImgURL18(featured);
		images.push(featured);
	}

	$carouselImages.each((i, el) => {
		let image = $(el).data('image');
		image = this.epsUpload.convertThumbImgURL18(image);
		if (image && image !== featured) {
			images.push(image);
		}
	});

	let description = this.$textarea.val();
	let category = Number(this.$categoryId.val());

	let payload = {
		"adId": serialized.adId,
		"title": serialized.adTitle,
		"description": description,
		"categoryId": category,
		"price": {
			"currency": (serialized.currency) ? serialized.currency : 'MXN',
			"amount": Number(serialized.adPrice)
		},
		"location": {
			"latitude": lat,
			"longitude": lng
		},
		//TODO: categoryAttributes {},
		"imageUrls": images
	};
	$.ajax({
		url: '/api/edit/update',
		type: 'POST',
		data: JSON.stringify(payload),
		dataType: 'json',
		contentType: 'application/json',
		success: _successCallback,
		error: _failureCallback
	});
};

let onReady = () => {
	this.$detailsSection = $("#main-detail-edit");

	this.epsUpload = new EpsUpload();
	this.$detailsSection = $("#js-main-detail-edit");
	this.$photoCarousel = $('.photo-carousel');
	this.$categoryId = this.$detailsSection.find('#category-id');
	this.$submitButton = this.$detailsSection.find('#js-edit-submit-button');
	this.$locationLink = $("#edit-location-input");

	this.defaultLocation = this.$locationLink.data("default-location");
	this.$categoryChangeLink = this.$detailsSection.find("#category-name-display");
	this.$currentHierarchy = $("#selected-cat-hierarchy");
	this.currentHierarchy = JSON.parse(this.$currentHierarchy.text() || "[]");

	this.$editForm = this.$detailsSection.find('#edit-form');
	this.$locationLat = this.$detailsSection.find('#location-lat');
	this.$locationLng = this.$detailsSection.find('#location-lng');
	this.$textarea = this.$detailsSection.find('#description-input');
	this.$categoryChangeLink.append(categorySelectionModal.getFullBreadCrumbText(this.currentHierarchy));

	this.$submitButton.on('click', (e) => {
		e.preventDefault();
		_ajaxEditForm();
	});

	this.$categoryChangeLink.click(() => {
		categorySelectionModal.openModal({
			currentHierarchy: this.currentHierarchy,
			onSaveCb: (hierarchy, breadcrumbs) => {
				this.$categoryChangeLink.empty();
				this.$categoryChangeLink.append(breadcrumbs);

				// TODO HOOK UP ONCE WE HAVE MORE THAN ONE MOCKED DATA SET
				// customAttributes.updateCustomAttributes(hierarchy[hierarchy.length-1]);

				this.currentHierarchy = hierarchy;
			}
		});
	});

	customAttributes.initialize();
};

let initialize = () => {
	locationModal.initialize(_setHiddenLocationInput);
	categorySelectionModal.initialize();

	$(document).ready(onReady);

	formChangeWarning.initialize();
};

module.exports = {
	initialize,
	onReady
};
