'use strict';
let locationModal = require("app/appWeb/views/components/modal/js/locationModal.js");
let EpsUpload = require('app/appWeb/views/components/uploadImage/js/epsUpload');
let categorySelectionModal = require("app/appWeb/views/components/categorySelectionModal/js/categorySelectionModal.js");
let customAttributes = require("app/appWeb/views/components/editFormCustomAttributes/js/editFormCustomAttributes.js");
let formChangeWarning = require('public/js/common/utils/formChangeWarning.js');
require('public/js/common/utils/JQueryUtil.js');
require('public/js/libraries/webshims/polyfiller.js');

let _setupPolyfillForm = () => {
	// replacing jquery swap function for use by webshim
	/* eslint-disable */
	jQuery.swap = function( elem, options, callback, args ) {
		var ret, name, old = {};
		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
		return ret;
	};
	/* eslint-enable */

	let shimDefJSON = {
		debug: false,
		waitReady: false,
		types: 'date number',
		date: {
			replaceUI: 'auto',
			startView: 2,
			openOnFocus: true,
			calculateWidth: false
		},
		number : {
			"nogrouping": true,
			"calculateWidth": false
		},
		replaceUI: 'auto'
	};

	let baseJsPath = this.$editForm.data('publicjs-url');

	debugger;
	$.webshim.setOptions('basePath', `${baseJsPath}libraries/webshims/shims/`);

	$.webshims.setOptions('forms-ext', shimDefJSON);

	let locale = $("html").data("locale").replace("_", "-");
	// locale set to HTML lang in the format 'en_ZA'
	$.webshims.activeLang(locale);
	$.webshims.polyfill('forms forms-ext');
};

let _characterCountCb = ($input, $label) => {
	let count = $input.val().length;
	$label.find(".characters-available").text(`${count}/${$input.attr("maxLength")}`);
};

let _bindCharacterCountEvents = ($input, $label) => {
	$input.keyup(() => {
		_characterCountCb($input, $label);
	});

	_characterCountCb($input, $label);
};

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
	formChangeWarning.disable();
	if (response.redirectLink.previp) {
		window.location.href = response.redirectLink.previp + '&redirectUrl=' + window.location.protocol + '//' + window.location.host + response.redirectLink.previpRedirect;
	} else {
		window.location.href = response.redirectLink.vip;
	}
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
	let $dateFields = this.$editForm.find('input[type="date"]');
	let serializedDates = $dateFields.serializeForm();
	let serialized = this.$editForm.serializeForm();
	let attrs = this.$attributes.serializeForm();
	let categoryAttributes = [];

	Object.keys(serializedDates).forEach((key) => {
		let val = serializedDates[key];
		if (val) {
			attrs[key] = (new Date(val)).getTime() / 1000;
		}
	});

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
		"location": {
			"latitude": lat,
			"longitude": lng
		},
		"categoryAttributes": categoryAttributes,
		"imageUrls": images
	};

	if (!this.$priceFormField.hasClass("hidden")) {
		payload.price = {
			"currency": (serialized.currency) ? serialized.currency : 'MXN',
			"amount": Number(serialized.adPrice)
		};
	}

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

let _toggleShowPriceField = (shouldHide) => {
	this.$priceFormField.toggleClass('hidden', shouldHide);
};

let _toggleShowLeafNodeWarning = (shouldHide) => {
	this.$leafNodeWarning.toggleClass('hidden', shouldHide);
};

let _openCatSelectModal = () => {
	categorySelectionModal.openModal({
		currentHierarchy: this.currentHierarchy.slice(0),
		onSaveCb: (hierarchy, breadcrumbs) => {
			this.$categoryChangeLink.empty();
			this.$categoryChangeLink.append(breadcrumbs);

			let isLeafNode = categorySelectionModal.isLeafCategory(hierarchy);
			_toggleSubmitDisable(!isLeafNode);
			_toggleShowLeafNodeWarning(isLeafNode);

			let newCatId = hierarchy[hierarchy.length - 1];
			this.$categoryId.val(newCatId);
			customAttributes.setCategoryId(newCatId);
			customAttributes.updateCustomAttributes((data) => {
				_toggleShowPriceField(data.isPriceExcluded);
				this.$detailsSection.find("form").updatePolyfill();
			});
			this.currentHierarchy = hierarchy;
		}
	});
};

let onReady = () => {
	this.$detailsSection = $("#main-detail-edit");

	this.epsUpload = new EpsUpload();
	this.$detailsSection = $("#js-main-detail-edit");
	this.$photoCarousel = $('.photo-carousel');
	this.$attributes = $("#edit-ad-custom-attributes-form");
	this.$categoryId = this.$detailsSection.find('#category-id');
	this.$submitButton = this.$detailsSection.find('#edit-submit-button');
	this.$cancelButton = this.$detailsSection.find('#cancel-button');
	this.$locationLink = $("#edit-location-input");

	this.defaultLocation = this.$locationLink.data("default-location");
	this.$categoryChangeLink = this.$detailsSection.find("#category-name-display");
	this.$currentHierarchy = $("#selected-cat-hierarchy");
	this.currentHierarchy = JSON.parse(this.$currentHierarchy.text() || "[]");
	this.$priceFormField = this.$detailsSection.find(".form-ad-price");
	this.$leafNodeWarning = this.$detailsSection.find(".leaf-node-warning");

	customAttributes.initialize();
	customAttributes.setCategoryId(this.currentHierarchy[this.currentHierarchy.length - 1]);

	this.$editForm = this.$detailsSection.find('#edit-form');
	this.$locationLat = this.$detailsSection.find('#location-lat');
	this.$locationLng = this.$detailsSection.find('#location-lng');
	this.$textarea = this.$detailsSection.find('#description-input');
	this.$categoryChangeLink.append(categorySelectionModal.getFullBreadCrumbText(this.currentHierarchy));

	let isLeafNode = categorySelectionModal.isLeafCategory(this.currentHierarchy);
	_toggleSubmitDisable(!isLeafNode);
	_toggleShowLeafNodeWarning(isLeafNode);

	this.$submitButton.on('click', (e) => {
		let $carouselItems = $('.carousel-item');
		if ($carouselItems.length === 0) {
			$('#file-input').on('change', () => {
				$('.cover-photo').removeClass('red-border');
				$('.photos-required-msg').addClass('hidden');
			});
			$('.cover-photo').addClass('red-border');
			$('.photos-required-msg').removeClass('hidden');
			return e.preventDefault();
		}
		_toggleSubmitDisable(true);
		e.preventDefault();
		_ajaxEditForm();
	});

	_setupPolyfillForm();


	this.$cancelButton.click(() => {
		formChangeWarning.disable();
		window.location.href = "/my/promote.html";
	});

	this.$detailsSection.find(".choose-category-button").click(_openCatSelectModal);
	this.$categoryChangeLink.click(_openCatSelectModal);

	_bindCharacterCountEvents(this.$detailsSection.find('input[title="adTitle"]'), this.$detailsSection.find('label[for="adTitle"]'));
	_bindCharacterCountEvents(this.$detailsSection.find('textarea[title="adDescription"]'), this.$detailsSection.find('label[for="adDescription"]'));

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
