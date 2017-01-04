'use strict';
let formChangeWarning = require('public/js/common/utils/formChangeWarning.js');
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');
let CategoryDropdownSelection = require(
	'app/appWeb/views/components/categoryDropdownSelection/js/categoryDropdownSelection.js');
let PostFormCustomAttributes = require(
	'app/appWeb/views/components/postFormCustomAttributes/js/postFormCustomAttributes.js');
let CookieUtils = require('public/js/common/utils/CookieUtils.js');
let locationSelection = require("app/appWeb/views/components/locationSelection/js/locationSelection.js");
let formMap = require("app/appWeb/views/components/formMap/js/formMap.js");

require('public/js/common/utils/JQueryUtil.js');
require('public/js/libraries/webshims/polyfiller.js');

let getUrlParameter = (sParam) => {
	let sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

let inputNumericCheck = function(e) {
	if ((e.keyCode > 57 || e.keyCode < 48)) {
		switch (e.keyCode) {
			case 8://backspace
			case 9://tab
			case 13://delete
			case 37://left arrow
			case 39://right arrow
			case 189: //negative
				break;
			default:
				e.preventDefault();
				break;
		}
	} else if (e.ctrlKey) {
		switch (e.keyCode) {
			case 65: //Ctrl-a
			case 67: // ctrl-c
			case 86: // ctrl-v
				break;
			default:
				e.preventDefault();
				break;
		}
	} else if (e.shiftKey) {
		//Prevent special characters (shift + number: !**@#%)
		e.preventDefault();
	}
};

const DEFAULT_PRICE_TYPE = 'FIXED';

// View model for post ad form main details
class PostAdFormMainDetailsVM {
	constructor() {
		this.propertyChanged = new SimpleEventEmitter();
		this._categoryDropdownSelection = new CategoryDropdownSelection();
		this.postFormCustomAttributes = new PostFormCustomAttributes();

		this._priceType = DEFAULT_PRICE_TYPE;
		// Default priceAttribute from server is null, so we use undefined here to be different from it.
		// Otherwise if original category has price but new category doesn't, property changed event will
		// not be triggered.
		this._priceAttribute = undefined;
		this._isShown = false;
		this._isFixMode = false;
		this._isRequiredTitleAndDescription = false;
		this._isValid = true;
		this._isFormValid = true;
		this._isFormChangeWarning = true;
		this._isMustLeaf = false;

		this._isVerticalCategory = false;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {

		// Callback for all children components have been mounted
		this._categoryDropdownSelection.componentDidMound(domElement.find('.category-component'));
		this.postFormCustomAttributes.componentDidMount(domElement.find('.post-ad-custom-attributes-form'));

		// Callback for old singleton components
		formChangeWarning.initialize();

		// Register event or update property according to children components
		this._categoryDropdownSelection.propertyChanged.addHandler((propName, newValue) => {
			if (propName === 'categoryId') {
				this.categoryId = newValue;
				// Return to normal mode when category is changed
				this.isFixMode = false;
				this.isFormValid = true;
			} else if (propName === 'isValid') {
				this._refreshIsValid();
			}
		});
		this.postFormCustomAttributes.propertyChanged.addHandler((propName, newValue) => {
			if (propName === 'customAttributeMetadata') {
				if (newValue) {
					this.priceAttribute = newValue.priceAttribute;
					if (newValue.priceAttribute && newValue.priceAttribute.priceTypeAllowedValues) {
						let priceTypeAllowedValues = newValue.priceAttribute.priceTypeAllowedValues;
						let needResetPriceType = false;
						// Hide unsupported price type
						let notSupportMakeOffer = priceTypeAllowedValues.indexOf('MAKE_OFFER') < 0;
						domElement.find('[for="price-choose-make-offer"]').toggleClass('hidden', notSupportMakeOffer);
						if (this.priceType === 'MAKE_OFFER' && notSupportMakeOffer) {
							needResetPriceType = true;
						}
						let notSupportContactMe = priceTypeAllowedValues.indexOf('CONTACT_ME') < 0;
						domElement.find('[for="price-choose-contact-me"]').toggleClass('hidden', notSupportContactMe);
						if (this.priceType === 'CONTACT_ME' && notSupportContactMe) {
							needResetPriceType = true;
						}

						// Reset default value
						if (needResetPriceType) {
							domElement.find('#price-choose-fixed').click();
							domElement.find('[name="amount"]').val('0');
						}
					}

					this._isVerticalCategory = !!(newValue.verticalCategory && newValue.verticalCategory.id);
					this.isRequiredTitleAndDescription = this._isVerticalCategory;
					this._categoryDropdownSelection.isMustLeaf = this._isMustLeaf || this._isVerticalCategory;
				}
			} else if (propName === 'isValid') {
				this._refreshIsValid();
			}
		});

		// Initialize self properties from DOM, usually done after mounting all children components.
		this.$postAdForm = domElement;
		this.$priceFormField = domElement.find(".form-ad-price");
		this.$priceAmountField = domElement.find('.price-amount');
		$(domElement.find(".price-input")).on('keydown', (e) => inputNumericCheck(e));
		this.propertyChanged.addHandler((propName, newValue) => {
			if (propName === 'priceAttribute') {
				this.$priceFormField.toggleClass('hidden', !newValue);
			} else if (propName === 'isFixMode') {
				this._categoryDropdownSelection.isFixMode = newValue;
			} else if (propName === 'isFormValid') {
				this._refreshIsValid();
			} else if (propName === 'isRequiredTitleAndDescription') {
				domElement.find('.form-ad-title').toggleClass('required-field', newValue)
					.toggleClass('optional-field', !newValue);
				domElement.find('.form-ad-description').toggleClass('required-field', newValue)
					.toggleClass('optional-field', !newValue);
			} else if (propName === 'isFormChangeWarning') {
				if (newValue) {
					formChangeWarning.enable();
				} else {
					formChangeWarning.disable();
				}
			} else if (propName === 'isMustLeaf') {
				this._categoryDropdownSelection.isMustLeaf = newValue || this._isVerticalCategory;
			} else if (propName === 'priceType') {
				this.$priceAmountField.toggleClass('hidden', newValue === 'CONTACT_ME');
			}
		});
		this._$postForm = domElement.find('.post-form');
		this._$attributeForm = domElement.find('.post-ad-custom-attributes-form');
		this._$descriptionField = domElement.find('.form-ad-description textarea');
		domElement.find('input[name=pricetype]').on('change', (e) => {
			let currentElement = $(e.currentTarget);
			if (currentElement.prop('checked')) {
				this.priceType = currentElement.val();
			}
		});
		this.priceType = domElement.find('input[name=pricetype]:checked').val() || DEFAULT_PRICE_TYPE;
		let priceAttrStr = domElement.find('.price-attribute-info').text();
		if (priceAttrStr) {
			try {
				this.priceAttribute = JSON.parse(priceAttrStr);
			} catch (e) {
				// Do nothing for JSON parse error
			}
		}

		// Initialize self properties from children
		this._categoryId = this._categoryDropdownSelection.categoryId;
		// TODO Solve this ugly code
		this.postFormCustomAttributes._categoryId = this._categoryId;
	}

	get categoryId() {
		return this._categoryDropdownSelection.categoryId;
	}

	set categoryId(newValue) {
		this._categoryDropdownSelection.categoryId = newValue;
		this.postFormCustomAttributes.categoryId = newValue;
	}

	get priceType() {
		return this._priceType;
	}

	set priceType(newValue) {
		if (this._priceType === newValue) {
			return;
		}
		this._priceType = newValue;
		this.propertyChanged.trigger('priceType', newValue);
	}

	get priceAttribute() {
		return this._priceAttribute;
	}

	set priceAttribute(newValue) {
		if (this._priceAttribute === newValue) {
			return;
		}
		this._priceAttribute = newValue;
		this.propertyChanged.trigger('priceAttribute', newValue);
	}

	get isFixMode() {
		return this._isFixMode;
	}

	set isFixMode(newValue) {
		newValue = !!newValue;
		if (this._isFixMode === newValue) {
			return;
		}
		this._isFixMode = newValue;
		this.propertyChanged.trigger('isFixMode', newValue);
	}


	get isRequiredTitleAndDescription() {
		return this._isRequiredTitleAndDescription;
	}

	set isRequiredTitleAndDescription(newValue) {
		newValue = !!newValue;
		if (this._isRequiredTitleAndDescription === newValue) {
			return;
		}
		this._isRequiredTitleAndDescription = newValue;
		this.propertyChanged.trigger('isRequiredTitleAndDescription', newValue);
	}

	get isValid() {
		return this._isValid;
	}

	set isValid(newValue) {
		newValue = !!newValue;
		if (this._isValid === newValue) {
			return;
		}
		this._isValid = newValue;
		this.propertyChanged.trigger('isValid', newValue);
	}

	get isFormValid() {
		return this._isFormValid;
	}

	set isFormValid(newValue) {
		newValue = !!newValue;
		if (this._isFormValid === newValue) {
			return;
		}
		this._isFormValid = newValue;
		this.propertyChanged.trigger('isFormValid', newValue);
	}

	_refreshIsValid() {
		this.isValid = this._categoryDropdownSelection.isValid && this._isFormValid;
	}

	show() {
		this.$postAdForm.show();
		// TODO Move below line out of this class
		$('.viewport').addClass('covered');
	}

	get isFormChangeWarning() {
		return this._isFormChangeWarning;
	}

	set isFormChangeWarning(newValue) {
		newValue = !!newValue;
		if (this._isFormChangeWarning === newValue) {
			return;
		}
		this._isFormChangeWarning = newValue;
		this.propertyChanged.trigger('isFormChangeWarning', newValue);
	}

	get showChangeWarning() {
		return this._categoryDropdownSelection._showChangeWarning;
	}

	set showChangeWarning(newValue) {
		this._categoryDropdownSelection._showChangeWarning = newValue;
	}

	get isMustLeaf() {
		return this._isMustLeaf;
	}

	set isMustLeaf(newValue) {
		newValue = !!newValue;
		if (this._isMustLeaf === newValue) {
			return;
		}
		this._isMustLeaf = newValue;
		this.propertyChanged.trigger('isMustLeaf', newValue);
	}

	/**
	 * Tries to get the location from geoId, will setup geoId cookie when success
	 */
	_getLatLngFromGeoCookie() {
		let geoCookie = CookieUtils.getCookie('geoId');
		let lat, lng;
		/*eslint-disable */
		if (geoCookie !== "") {
			let latLng = geoCookie.split('ng');
			lat = Number(latLng[0]);
			lng = Number(latLng[1]);
		} else if (window.google && window.google.loader.ClientLocation) {
			lat = Number(google.loader.ClientLocation.latitude);
			lng = Number(google.loader.ClientLocation.longitude);
			document.cookie = `geoId=${lat}ng${lng}`;
			/*eslint-enable*/
		} else {
			console.warn('no geolocation provided');
		}

		return {lat: lat, lng: lng};
	}

	/**
 	 * Get location id from location selection modal
 	 */
 	getLocatioinId() {
 		return locationSelection.getLocationId();
 	}
	getCategorySelectionName() {
		return this._categoryDropdownSelection.getCategorySelectionName();
	}

	getAdPayload() {
		let $dateFields = this._$postForm.find('input[type="date"]');
		let serializedDates = $dateFields.serializeForm();
		let serialized = this._$postForm.serializeForm();
		let attrs = this._$attributeForm.serializeForm();
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

		/* Location Resolving start */
		// 1. Try to get lat / lng from user selected location, base on google map auto complete
		let lat = Number(serialized.locationLatitude);
		let lng = Number(serialized.locationLongitude);
		// 2. No location input, get lat / lng by default
		if (!lat || !lng) {
			//Try to get lat / lng from geoId cookie, if not exist will call google client location
			let latLng = this._getLatLngFromGeoCookie();
			lat = latLng.lat;
			lng = latLng.lng;
		}
		/* Location Resolving end */

		// get position selecte on formMap component
		let position = { lat: lat, lng: lng };
		if(window.formMap) {
			position = window.formMap.getPosition();
		}

		let description = this._$descriptionField.val();
		let payload = {
			title: serialized.Title,
			description: description,
			phone: serialized.Phone,
			categoryId: this.categoryId,
			location: {
				"latitude": position.lat,
				"longitude": position.lng
			},
			categoryAttributes: categoryAttributes
		};
		if (serialized.adId) {
			// Used in edit workflow
			payload.adId = serialized.adId;
		}

		if (this.priceAttribute) {
			payload.price = {
				priceType: serialized.pricetype
			};
			if (serialized.currency) {
				payload.price.currency = serialized.currency;
			} else {
				if (this.priceAttribute.currencyAllowedValues && this.priceAttribute.currencyAllowedValues.length) {
					payload.price.currency = this.priceAttribute.currencyAllowedValues[0];
				}
				payload.price.currency = payload.price.currency || 'USD';
			}
			if (serialized.amount) {
				payload.price.amount = Number(serialized.amount);
			}
		}

		return payload;
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
		$input.one('click', () => {
			$input.removeClass('validation-error');
			this.isFormValid = !this.$postAdForm.find('.validation-error').length;
		});
		$input.one('change', () => {
			// If clicking on a dropdown after editing a textbox, the scroll animation will start
			// after dropdown is expanded, which will make the dropdown list away from the select
			// box. So we should wait for a short time to ensure no input is focused on
			setTimeout(() => {
				let focusedElement = $(document.activeElement);
				// Change but still focus on same element will trigger refocus
				if ((focusedElement.length && focusedElement[0] === $input[0]) ||
					(!focusedElement.is('input, select, textarea') &&
					!focusedElement.parents('input, select, textarea').length)) {
					this._focusFirstValidationError();
				}
			}, 100);
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

	_focusFirstValidationError() {
		if (this.isFixMode) {
			let errorElements = this.$postAdForm.find('.validation-error');
			if (errorElements.length) {
				let $highestFailure = errorElements.closestToOffset(0, 0);
				let scrollTo = $highestFailure.offset().top - 50;
				let bodyElement = $('body, html');
				bodyElement.animate({ scrollTop: Math.max(scrollTo + bodyElement.scrollTop(), 0) }, 200);
			}
		}
	}

	setValidationError(error) {
		let $failedFields, scrollTo;
		let isLocationMarked = false;
		// node layer validation based on schema checking
		if (error.hasOwnProperty("schemaErrors")) {
			error.schemaErrors.forEach((schemaError) => {
				// To be consistent with edit page
				schemaError.field = schemaError.field.replace('data.ads.0', 'data');
				let $input;
				if (schemaError.field === 'data.location.latitude' ||
					schemaError.field === 'data.location.longitude') {
					// Handle latitude and longitue specially because the UI for them
					// has been combined
					if (isLocationMarked) {
						return;
					}
					$input = $('[data-schema="data.location"]');
				} else {
					$input = $(`[data-schema="${schemaError.field}"]`);
				}
				let siblings = $input.siblings("input");
				if (siblings.length === 1) {
					$input = siblings;
				}
				// filtering out collision with meta tags
				$input = $input.not("meta");
				$failedFields = this._markValidationError($input, $failedFields);
			});
		} else if (error.hasOwnProperty("bapiValidationFields")) {
			// bapi validation errors
			error.bapiValidationFields.forEach((attrName) => {
				if (attrName === 'Category') {
					// Error for category should be handled by category dropdown selection
					this._categoryDropdownSelection.isValid = false;
					return;
				}
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

		this.isFormValid = false;
		// This should happen after all error fields been marked
		this.isFixMode = true;

		// if we have a failed field, scroll to 50px above the highest element on the page
		let errorElements = this.$postAdForm.find('.validation-error');
		if (errorElements.length) {
			let $highestFailure = errorElements.closestToOffset(0, 0);
			scrollTo = $highestFailure.offset().top - 50;
			let bodyElement = $('body, html');
			bodyElement.animate({ scrollTop: Math.max(scrollTo + bodyElement.scrollTop(), 0) }, 200);
		}
	}
}

class PostAdFormMainDetails {
	constructor() {
		this.setupViewModel();
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

	// Common interface for all component to setup view model. In the future, we'll have a manager
	// to control the lifecycle of view model.
	setupViewModel() {
		this.viewModel = new PostAdFormMainDetailsVM();
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
		let val = $input.val() || '';

		// Using HTML5 maxLength, chrome counts new lines as 2 characters (\r\n)
		// regardless of whether the browser is on unix or windows while other browser use the OS to decide
		// Thus we count as if all new lines are two characters so keep the same accross all browsers
		// replacing all two character line breaks (\r\n) with single line breaks (\n), then replacing all \n
		// including any that were originally just \n to \r\n and counting.
		// this is not placed back into the text area it is only for counting purposes
		val = val.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
		let count = val.length;
		let maxLength = $input.attr("maxLength");
		$label.find(".characters-available").text(`${Math.max(maxLength - count, 0)}/${maxLength}`);
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

	onReady() {
		this.$detailsSection = $("#js-main-detail-post");
		this.$locationLink = $("#post-location-input");
		this.$addDetail = $(".post-add-detail");

		this.$postForm = this.$detailsSection.find('.post-form');
		this.$downIcon = this.$detailsSection.find('.icon-down');
		this.$upIcon = this.$detailsSection.find('.icon-up');
		this.$locationLat = this.$detailsSection.find('#location-lat');
		this.$locationLng = this.$detailsSection.find('#location-lng');

		this.$titleField = this.$detailsSection.find('input[name="Title"]');
		this.$textarea = this.$detailsSection.find('#description-input');
		this.$priceFormField = this.$detailsSection.find(".form-ad-price");
		$(this.$priceFormField).on('change', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": this.pageType + "Price"});
		});
		this.$addDetail.on('click', (e) => {
			if (this.$downIcon.css('display') === 'none' && this.$upIcon.css('display') === 'none') {
				return; // Don't fold up when no arrow icon display
			}
			e.preventDefault();
			e.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": this.pageType + "FormFullDetail"});
			this.$postForm.toggleClass('hidden');
			this.$downIcon.toggleClass('hidden');
			this.$upIcon.toggleClass('hidden');
		});

		this._setupPolyfillForm();

		this._setupScrollTo();

		this.viewModel.componentDidMount($("#js-main-detail-post"));
		this.$titleField.on('change', () => {
			window.BOLT.trackEvents({"event": this.pageType + "Title"});
		});
		this.$textarea.on('change', () => {
			window.BOLT.trackEvents({"event": this.pageType + "Description"});
		});
		this.viewModel.propertyChanged.addHandler((propName, newValue) => {
			if (propName === 'isFixMode' && !newValue) {
				this.$postForm.find('.validation-error').removeClass('validation-error');
			}
		});
	}

	initialize(options) {
		this.pageType = options ? options.pageType : "";
		let validator = getUrlParameter('BOLT24748');
		if(!validator) {
			locationSelection.initialize((data) => {
				this._setHiddenLocationInput(data);
			}, {pageType: this.pageType});
		} else {
			formMap.initialize();
		}
		this.viewModel._categoryDropdownSelection.pageType = this.pageType;
		this.viewModel.postFormCustomAttributes.pageType = this.pageType;
		this.onReady();
	}
}

module.exports = new PostAdFormMainDetails();
