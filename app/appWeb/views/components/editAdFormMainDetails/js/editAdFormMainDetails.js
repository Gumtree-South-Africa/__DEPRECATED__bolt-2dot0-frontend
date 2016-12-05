'use strict';
let locationModal = require("app/appWeb/views/components/modal/js/locationModal.js");
let EpsUpload = require('app/appWeb/views/components/uploadImage/js/epsUpload').EpsUpload;
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let categorySelectionModal = require("app/appWeb/views/components/categorySelectionModal/js/categorySelectionModal.js");
let CategoryDropdownSelection = require('app/appWeb/views/components/categoryDropdownSelection/js/categoryDropdownSelection.js');
let customAttributes = require("app/appWeb/views/components/editFormCustomAttributes/js/editFormCustomAttributes.js");
let formChangeWarning = require('public/js/common/utils/formChangeWarning.js');
require('public/js/common/utils/JQueryUtil.js');
require('public/js/libraries/webshims/polyfiller.js');

class EditAdFormMainDetails {
	constructor() {
		this._categoryDropdownSelection = new CategoryDropdownSelection();
	}

	/**
	 * setup scroll to functionality for validation failure
	 * @private
	 */
	_setupScrollTo() {
		// this ads a prototype function closestToOffset to jquery which gives me the closest dom element
		// in the current selector that closest to the passed in offset { x: x, y: y}
		jQuery.fn.extend({
			closestToOffset: function(offset) {
				let el = null, elOffset, x = offset.left, y = offset.top, distance, dx, dy, minDistance;
				this.each(function() {
					elOffset = $(this).offset();

					if (
						(x >= elOffset.left) && (x <= elOffset.right) &&
						(y >= elOffset.top) && (y <= elOffset.bottom)
					) {
						el = $(this);
						return false;
					}

					let offsets = [
						[
							elOffset.left,
							elOffset.top
						],
						[
							elOffset.right,
							elOffset.top
						],
						[
							elOffset.left,
							elOffset.bottom
						],
						[
							elOffset.right,
							elOffset.bottom
						]
					];
					/* eslint-disable */
					for (let off in offsets) {
						dx = offsets[off][0] - x;
						dy = offsets[off][1] - y;
						distance = Math.sqrt((dx * dx) + (dy * dy));
						if (minDistance === undefined || distance < minDistance) {
							minDistance = distance;
							el = $(this);
						}
					}
					/* eslint-enable */
				});
				return el;
			}
		});
	}

	_setupPolyfillForm() {
		// replacing jquery swap function for use by webshim
		/* eslint-disable */
		jQuery.swap = function(elem, options, callback, args) {
			var ret, name, old = {};
			// Remember the old values, and insert the new ones
			for (name in options) {
				old[name] = elem.style[name];
				elem.style[name] = options[name];
			}

			ret = callback.apply(elem, args || []);

			// Revert the old values
			for (name in options) {
				elem.style[name] = old[name];
			}
			return ret;
		};
		/* eslint-enable */

		let shimDefJSON = {
			debug: false,
			waitReady: false,
			types: 'date',
			date: {
				replaceUI: 'auto',
				startView: 2,
				openOnFocus: true,
				calculateWidth: false
			},
			number: {
				"nogrouping": true,
				"calculateWidth": false
			},
			replaceUI: 'auto'
		};

		let baseJsPath = this.$editForm.data('publicjs-url');

		$.webshim.setOptions('basePath', `${baseJsPath}libraries/webshims/shims/`);

		$.webshims.setOptions('forms-ext', shimDefJSON);

		let locale = $("html").data("locale").replace("_", "-");
		// locale set to HTML lang in the format 'en_ZA'
		$.webshims.activeLang(locale);
		$.webshims.polyfill('forms forms-ext');
	}

	/**
	 * update the character count values
	 * @param $input
	 * @param $label
	 * @private
	 */
	_characterCountCb($input, $label) {
		let val = $input.val();

		// Using HTML5 maxLength, chrome counts new lines as 2 characters (\r\n)
		// regardless of whether the browser is on unix or windows while other browser use the OS to decide
		// Thus we count as if all new lines are two characters so keep the same accross all browsers
		// replacing all two character line breaks (\r\n) with single line breaks (\n), then replacing all \n
		// including any that were originally just \n to \r\n and counting.
		// this is not placed back into the text area it is only for counting purposes
		val = val.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
		let count = val.length;
		let maxLength = $input.attr("maxLength");
		$label.find(".characters-available").text(`${maxLength - count}/${maxLength}`);
	}

	/**
	 * bind character count events to a passed in input
	 * @param $input
	 * @param $label
	 * @private
	 */
	_bindCharacterCountEvents($input, $label) {
		$input.keyup(() => {
			this._characterCountCb($input, $label);
		});

		this._characterCountCb($input, $label);
	}

	/**
	 * set the hidden location input for saving the location of the ad
	 * @param location
	 * @private
	 */
	_setHiddenLocationInput(location) {
		this.$locationLat.val(location.lat);
		this.$locationLng.val(location.long);
		this.$locationLink.text(location.localizedName || this.defaultLocation);
	}

	/**
	 * mark the validation errors
	 * @param $input
	 * @param $accumlator
	 * @returns {*}
	 * @private
	 */
	_markValidationError($input, $accumlator) {
		// add the validation error class to the input
		$input.addClass('validation-error');
		// set up click event to remove validation border
		$input.on('click', () => {
			$input.removeClass('validation-error');
			// unbind event
			$input.off('click');
		});

		// if an $accumulator is passed in then add the dom input it,
		// else create a new $accumulator
		if (!$accumlator) {
			$accumlator = $input;
		} else {
			$accumlator.add($input);
		}

		return $accumlator;
	}


	/**
	 * success callback for saving the edited ad
	 * @param response
	 * @private
	 */
	_successCallback(response) {
		formChangeWarning.disable();
		spinnerModal.completeSpinner(() => {
			if (response.redirectLink.previp) {
				window.location.href = response.redirectLink.previp + '&redirectUrl=' + window.location.protocol + '//' + window.location.host + response.redirectLink.previpRedirect;
			} else {
				window.location.href = response.redirectLink.vip;
			}
		});
	}

	/**
	 * failure callback for edit ad failing
	 * @param error
	 * @private
	 */
	_failureCallback(error) {
		let $failedFields, $highestFailure, scrollTo;
		this.$submitButton.removeClass('disabled');
		this.$submitButton.attr('disabled', false);
		spinnerModal.hideModal();
		// validation error
		if (error.status === 400) {
			let responseText = JSON.parse(error.responseText || '{}');

			// node layer validation based on schema checking
			if (responseText.hasOwnProperty("schemaErrors")) {
				responseText.schemaErrors.forEach((schemaError) => {
					let $input = $(`[data-schema="${schemaError.field}"]`);
					let siblings = $input.siblings("input");
					if (siblings.length === 1) {
						$input = siblings;
					}
					// filtering out collision with meta tags
					$input = $input.not("meta");
					$failedFields = this._markValidationError($input, $failedFields);
				});
			} else if (responseText.hasOwnProperty("bapiValidationFields")) {
				// bapi validation errors
				responseText.bapiValidationFields.forEach((attrName) => {
					let $input = $(`[name="${attrName}"]`);
					let siblings = $input.siblings("input");
					if (siblings.length === 1) {
						$input = siblings;
					}
					// filtering out collision with meta tags
					$input = $input.not("meta");
					$failedFields = this._markValidationError($input, $failedFields);
				});
			}

			// if we have a failed field, scroll to 50px above the highest element on the page
			if ($failedFields && $failedFields.length > 0) {
				$highestFailure = $failedFields.closestToOffset(0, 0);
				scrollTo = Math.max($highestFailure.offset().top - 50, 0); // get scroll value, or zero
				window.scrollTo(0, scrollTo);
			}
		}
	}

	/**
	 * ajax the edited ad up to the server
	 * @private
	 */
	_ajaxEditForm() {
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
			"title": serialized.Title,
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
				"amount": Number(serialized.amount)
			};
		}

		spinnerModal.showModal();

		$.ajax({
			url: '/api/edit/update',
			type: 'POST',
			data: JSON.stringify(payload),
			dataType: 'json',
			contentType: 'application/json',
			success: (evt) => {
				this._successCallback(evt);
			},
			error: (e) => {
				this._failureCallback(e);
			}
		});
	}

	/**
	 * toggle the submit button disable
	 * @param shouldDisable
	 * @private
	 */
	_toggleSubmitDisable(shouldDisable) {
		this.$submitButton.prop("disabled", shouldDisable);
	}

	/**
	 * toggle showing the price field
	 * @param shouldHide
	 * @private
	 */
	_toggleShowPriceField(shouldHide) {
		this.$priceFormField.toggleClass('hidden', shouldHide);
	}

	/**
	 * toggle the leaf node warning
	 * @param shouldHide
	 * @private
	 */
	_toggleShowLeafNodeWarning(shouldHide) {
		this.$leafNodeWarning.toggleClass('hidden', shouldHide);
	}

	/**
	 * open the category selection modal
	 * @private
	 */
	_openCatSelectModal() {
		categorySelectionModal.openModal({
			currentHierarchy: this.currentHierarchy.slice(0), // clone the hierachy and pass it in
			onSaveCb: (hierarchy) => {

				// check to make sure we saved a leaf node
				let isLeafNode = categorySelectionModal.isLeafCategory(hierarchy);

				// toggle submit button and the leaf node warning
				this._toggleSubmitDisable(!isLeafNode);
				this._toggleShowLeafNodeWarning(isLeafNode);

				// get the last item from the hierarchy as its the selected category
				let newCatId = hierarchy[hierarchy.length - 1];
				// update the form value
				this.$categoryId.val(newCatId);
				// render the new category custom attributes area
				customAttributes.updateCustomAttributes((data) => {
					// toggle price field based on if its excluded from new category
					this._toggleShowPriceField(data.isPriceExcluded);

					// toggle required-field for title and description
					this.$detailsSection.find('.form-ad-title').toggleClass('required-field', !!data.verticalCategory);
					this.$detailsSection.find('.form-ad-description').toggleClass('required-field', !!data.verticalCategory);

					// polyfill the form to get date pickers
					this.$detailsSection.find("form").updatePolyfill();
				}, newCatId);

				// remove validation-error in title and description
				this.$detailsSection.find('[name=Title]').removeClass('validation-error');
				this.$detailsSection.find('[name=description]').removeClass('validation-error');

				// save the current hierarchy that was returned
				this.currentHierarchy = hierarchy;
			}
		});
	}

	_validatePhotoCarousel() {
		let $carouselItems = $('.carousel-item');
		if ($carouselItems.length === 0) {
			$('#file-input').on('change', () => {
				$('.cover-photo').removeClass('red-border');
				$('.photos-required-msg').addClass('hidden');
			});
			$('.cover-photo').addClass('red-border');
			$('.photos-required-msg').removeClass('hidden');
			return false;
		}

		return true;
	}

	onReady() {
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
		this.$currentHierarchy = $("#selected-cat-hierarchy");
		this.currentHierarchy = JSON.parse(this.$currentHierarchy.text() || "[]");
		this.$priceFormField = this.$detailsSection.find(".form-ad-price");
		this.$leafNodeWarning = this.$detailsSection.find(".leaf-node-warning");

		// initialize the custom attributes section
		customAttributes.initialize();
		// set the initial cateogry id
		customAttributes.setCategoryId(this.currentHierarchy[this.currentHierarchy.length - 1]);

		this.$editForm = this.$detailsSection.find('#edit-form');
		this.$locationLat = this.$detailsSection.find('#location-lat');
		this.$locationLng = this.$detailsSection.find('#location-lng');
		this.$textarea = this.$detailsSection.find('#description-input');

		this._categoryDropdownSelection.componentDidMound(this.$detailsSection.find('.category-component'));

		let isLeafNode = this._categoryDropdownSelection.isLeaf;
		this._toggleSubmitDisable(!isLeafNode);
		this._toggleShowLeafNodeWarning(isLeafNode);

		this.$submitButton.on('click', (e) => {
			e.preventDefault();
			if (this._validatePhotoCarousel()) {
				this._toggleSubmitDisable(true);
				this._ajaxEditForm();
			}
		});

		this.$cancelButton.click(() => {
			formChangeWarning.disable();
			window.location.href = "/my/ads.html";
		});

		this._setupPolyfillForm();

		this.$detailsSection.find(".choose-category-button").click(() => {
			this._openCatSelectModal();
		});


		this._bindCharacterCountEvents(this.$detailsSection.find('input[title="Title"]'), this.$detailsSection.find('label[for="Title"]'));
		this._bindCharacterCountEvents(this.$textarea, this.$detailsSection.find('label[for="description"]'));

		this._setupScrollTo();
	}

	initialize(registerOnReady = true) {
		locationModal.initialize((data) => {
			this._setHiddenLocationInput(data);
		});
		categorySelectionModal.initialize(); // TBD need to rmv
		if (registerOnReady) {
			$(document).ready(() => {
				this.onReady();
			});
		}

		formChangeWarning.initialize();
		spinnerModal.initialize();
	}
}

module.exports = new EditAdFormMainDetails();
