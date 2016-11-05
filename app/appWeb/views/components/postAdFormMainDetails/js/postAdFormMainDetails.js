'use strict';
let locationModal = require("app/appWeb/views/components/locationSelection/js/locationSelection.js");
let EpsUpload = require('app/appWeb/views/components/uploadImage/js/epsUpload').EpsUpload;
let postAd = require('app/appWeb/views/components/uploadImage/js/postAd.js');
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let formChangeWarning = require('public/js/common/utils/formChangeWarning.js');
let loginModal = require('app/appWeb/views/components/loginModal/js/loginModal.js');
let postFormCustomAttributes = require("app/appWeb/views/components/postFormCustomAttributes/js/postFormCustomAttributes.js");

require('public/js/common/utils/JQueryUtil.js');
require('public/js/libraries/webshims/polyfiller.js');

class PostAdFormMainDetails {

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

		let baseJsPath = this.$postForm.data('publicjs-url');

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
		$label.find(".characters-available").text(`${Math.min(count, maxLength)}/${maxLength}`);
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
		this.$locationLink.text(location.localizedName);
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
		switch (response.state) {
			case this.AD_STATES.AD_CREATED:
				spinnerModal.completeSpinner(() => {
					if (response.ad.redirectLinks.previp) {
						window.location.href = response.ad.redirectLinks.previp + '&redirectUrl=' + window.location.protocol + '//' + window.location.host + response.ad.redirectLinks.previpRedirect;
					} else if (response.ad.status === 'HOLD') {
						window.location.href = '/edit/' + response.ad.id;
					} else {
						window.location.href = response.ad.redirectLinks.vip;
					}
				});
				break;
			case this.AD_STATES.AD_DEFERRED:
				spinnerModal.completeSpinner(() => {
					loginModal.openModal({
						submitCb: () => {
							window.location.href = response.defferedLink;
						},
						fbRedirectUrl: response.defferedLink,
						links: response.links
					});
				});
				break;
			default:
				break;
		}
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
	 * ajax the post ad up to the server
	 * @private
	 */
	_ajaxPostForm() {
		let $dateFields = this.$postForm.find('input[type="date"]');
		let serializedDates = $dateFields.serializeForm();
		let serialized = this.$postForm.serializeForm();
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

		// No location input, get lat,lng from geoIp cookie
		if (!lat || !lng) {
			let latLng = postAd.getLatLngFromGeoCookie();
			lat = latLng.lat;
			lng = latLng.lng;
		}

		let description = this.$textarea.val();
		let payload = {
			"ads": [
				{
					"title": serialized.Title,
					"description": description,
					"categoryId": this.categoryId,
					"location": {
						"latitude": lat,
						"longitude": lng
					},
					"categoryAttributes": categoryAttributes,
					"imageUrls": this.imgUrls
				}
			]
		};

		if (!this.$priceFormField.hasClass("hidden")) {
			payload.ads[0].price = {
				"currency": (serialized.currency) ? serialized.currency : 'MXN',
				"amount": Number(serialized.amount)
			};
		}

		spinnerModal.showModal();

		$.ajax({
			url: '/api/postad/create',
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
	 * sets the imgUrl for the singleton instance
	 * @param imgUrl
	 */
	setImgUrl(imgUrl) {
		this.imgUrls.push(imgUrl);
	}

	/**
	 * sets the category id for the singleton instance
	 * @param categoryId
	 */
	setCategoryId(categoryId) {
		this.categoryId = categoryId;
		postFormCustomAttributes.updateCustomAttributes((data) => {
			// toggle price field based on if its excluded from new category
			this._toggleShowPriceField(data.isPriceExcluded);
		}, categoryId);
	}

	/**
	 * Show add detail form for post
	 */
	showModal() {
		this.$detailsSection.removeClass("hidden");
	}

	onReady() {
		this.AD_STATES = {
			AD_CREATED: "AD_CREATED",
			AD_DEFERRED: "AD_DEFERRED"
		};
		this.epsUpload = new EpsUpload();
		this.$detailsSection = $("#js-main-detail-post");
		this.$attributes = $("#post-ad-custom-attributes-form");
		this.$categorySelection = this.$detailsSection.find('#category-selection');
		this.$submitButton = this.$detailsSection.find('#post-submit-button');
		this.$locationLink = $("#post-location-input");
		this.$addDetail = $(".post-add-detail");

		this.$priceFormField = this.$detailsSection.find(".form-ad-price");

		this.$postForm = this.$detailsSection.find('#post-form');
		this.$locationLat = this.$detailsSection.find('#location-lat');
		this.$locationLng = this.$detailsSection.find('#location-lng');

		this.imgUrls = [];
		this.$textarea = this.$detailsSection.find('#description-input');

		this.$submitButton.on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this._toggleSubmitDisable(true);
			this.$postForm.toggleClass('hidden', true);
			this._ajaxPostForm();
		});

		this.$addDetail.on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.$postForm.toggleClass('hidden');
		});

		this._setupPolyfillForm();

		this._bindCharacterCountEvents(this.$detailsSection.find('input[title="Title"]'), this.$detailsSection.find('label[for="Title"]'));
		this._bindCharacterCountEvents(this.$textarea, this.$detailsSection.find('label[for="description"]'));

		this._setupScrollTo();
	}

	initialize(registerOnReady = true) {
		locationModal.initialize((data) => {
			this._setHiddenLocationInput(data);
		});

		if (registerOnReady) {
			$(document).ready(() => {
				this.onReady();
			});
		}

		formChangeWarning.initialize();
		spinnerModal.initialize();
		postFormCustomAttributes.initialize();
	}
}

module.exports = new PostAdFormMainDetails();
