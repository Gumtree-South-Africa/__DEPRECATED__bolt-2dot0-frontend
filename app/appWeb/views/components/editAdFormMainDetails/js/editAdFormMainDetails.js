'use strict';
let locationModal = require("app/appWeb/views/components/modal/js/locationModal.js");
let EpsUpload = require('app/appWeb/views/components/uploadImage/js/epsUpload');
let categorySelectionModal = require("app/appWeb/views/components/categorySelectionModal/js/categorySelectionModal.js");
let customAttributes = require("app/appWeb/views/components/editFormCustomAttributes/js/editFormCustomAttributes.js");
let formChangeWarning = require('public/js/common/utils/formChangeWarning.js');
require('public/js/common/utils/JQueryUtil.js');

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
	formChangeWarning.disableFormWarning();
	window.location.href = response.vipLink;
};

let _failureCallback = (error) => {
	console.warn(error);
	this.$submitButton.removeClass('disabled');
	this.$submitButton.attr('disabled', false);
	if (error.status === 400) {
		let schemaErrors = JSON.parse(error.responseText || '{"schemaErrors": []}')
			.schemaErrors || [];

		schemaErrors.forEach((schemaError) => {
			let selector = `[data-schema='${schemaError.field}']`;
			let $el = $(selector);
			$el.addClass('validation-error');
			$el.on('change', () => {
				$el.removeClass('validation-error');
			});
		});
	}
};

let _ajaxEditForm = () => {
	let serialized = this.$editForm.serializeForm();
	let attrs = this.$attributes.serializeForm();
	let categoryAttributes = [];
	$.each(attrs, (field, value) => {
		if (value !== '') {
			categoryAttributes.push({
				name: field,
				value: value
			});
		}
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
		//TODO: enable this once bapi gets the endpoint updated
		// "categoryAttributes": categoryAttributes,
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

let _toggleSubmitDisable = (shouldDisable) => {
	this.$submitButton.prop("disabled", shouldDisable);
};

let onReady = () => {
	this.$detailsSection = $("#main-detail-edit");

	this.epsUpload = new EpsUpload();
	this.$detailsSection = $("#js-main-detail-edit");
	this.$photoCarousel = $('.photo-carousel');
	this.$attributes = $("#edit-ad-custom-attributes-form");
	this.$categoryId = this.$detailsSection.find('#category-id');
	this.$submitButton = this.$detailsSection.find('#js-edit-submit-button');
	this.$locationLink = $("#edit-location-input");

	this.defaultLocation = this.$locationLink.data("default-location");
	this.$categoryChangeLink = this.$detailsSection.find("#category-name-display");
	this.$currentHierarchy = $("#selected-cat-hierarchy");
	this.currentHierarchy = JSON.parse(this.$currentHierarchy.text() || "[]");

	customAttributes.initialize();
	customAttributes.setCategoryId(this.currentHierarchy[this.currentHierarchy.length - 1]);

	this.$editForm = this.$detailsSection.find('#edit-form');
	this.$locationLat = this.$detailsSection.find('#location-lat');
	this.$locationLng = this.$detailsSection.find('#location-lng');
	this.$textarea = this.$detailsSection.find('#description-input');
	this.$categoryChangeLink.append(categorySelectionModal.getFullBreadCrumbText(this.currentHierarchy));

	_toggleSubmitDisable(!categorySelectionModal.isLeafCategory(this.currentHierarchy));

	this.$submitButton.on('click', (e) => {
		_toggleSubmitDisable(true);
		e.preventDefault();
		_ajaxEditForm();
	});

	this.$categoryChangeLink.click(() => {
		categorySelectionModal.openModal({
			currentHierarchy: this.currentHierarchy.slice(0),
			onSaveCb: (hierarchy, breadcrumbs) => {
				this.$categoryChangeLink.empty();
				this.$categoryChangeLink.append(breadcrumbs);
				_toggleSubmitDisable(!categorySelectionModal.isLeafCategory(this.currentHierarchy));

				let newCatId = hierarchy[hierarchy.length - 1];
				this.$categoryId.val(newCatId);
				customAttributes.setCategoryId(newCatId);
				customAttributes.updateCustomAttributes();
				this.currentHierarchy = hierarchy;
			}
		});
	});
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
