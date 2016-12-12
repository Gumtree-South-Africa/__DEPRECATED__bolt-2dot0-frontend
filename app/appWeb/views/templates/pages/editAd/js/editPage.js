"use strict";
let photoContainer = require('app/appWeb/views/components/photoContainer/js/photoContainer.js');
let postAdFormMainDetails = require('app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js');
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let AdFeatureSelection = require('app/appWeb/views/components/adFeatureSelection/js/adFeatureSelection.js');
let AdInsertionFee = require('app/appWeb/views/components/adInsertionFee/js/adInsertionFee.js');

let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

// View model for edit ad page
class EditAd {
	constructor() {
		this.propertyChanged = new SimpleEventEmitter();
		this.adFeatureSelection = new AdFeatureSelection();
		this.adInsertionFee = new AdInsertionFee();
		this._imageUrls = [];
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		// Callback for all children components have been mounted\
		this.postAdFormMainDetails = postAdFormMainDetails.viewModel;
		this.photoContainer = photoContainer.viewModel;
		this.spinnerModal = spinnerModal;

		// Callback for old singleton components
		spinnerModal.initialize();
		photoContainer.initialize({pageType: "EditAd"});
		postAdFormMainDetails.initialize({pageType: "EditAd"});

		this._$submitButton = domElement.find('.edit-submit-button');
		this._$cancelButton = domElement.find('.cancel-button');
		this._$editAdContent = domElement.find('.edit-ad-page');
		this._$featurePromote = domElement.find("#feature-promote");
		this._$promoteWithoutInf = domElement.find("#promote-without-inf");
		this.adInsertionFee.componentDidMount(domElement);
		this.adFeatureSelection.componentDidMount(domElement);
		this.adInsertionFee.pageType = "EditAd";
		this.adFeatureSelection.pageType = "EditAd";

		this.propertyChanged.addHandler((propName/*, newValue*/) => {
			if (propName === 'imageUrls') {
				this._setSubmitButtonStatus();
			}
		});

		this.postAdFormMainDetails.propertyChanged.addHandler((propName/*, newValue*/) => {
			if (propName === 'isValid' || propName === 'isFixMode') {
				this._setSubmitButtonStatus();
			}
		});

		this._$submitButton.on('click', e => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.submit();
		});

		this._$cancelButton.click(() => {
			this.postAdFormMainDetails.isFormChangeWarning = false;
			window.BOLT.trackEvents({"event": "EditAdCancel"});
			window.location.href = '/my/ads.html';
		});

		this.photoContainer.addImageUrlsChangeHandler(() => {
			this.imageUrls = [].concat(this.photoContainer.imageUrls);
		});
		this.imageUrls = [].concat(this.photoContainer.imageUrls);

		this._setSubmitButtonStatus();

		// TBD Need to refactor follow previous convention
		photoContainer.setCategoryUpdateCallback((catId) => {
			this.postAdFormMainDetails.categoryId = catId;
		});

		this.postAdFormMainDetails.showChangeWarning = true;
		this.postAdFormMainDetails.postFormCustomAttributes.loadBaseUrl = '/api/edit/customattributes/';
	}

	_setSubmitButtonStatus() {
		let canPost = this._canSubmit();
		this._$submitButton.toggleClass('disabled', !canPost);
		this._$submitButton.prop('disabled', !canPost);
	}

	_canSubmit() {
		// Don't submit if no image or not resolve all fix problems
		return this._imageUrls && this._imageUrls.length &&
			(!this.postAdFormMainDetails.isFixMode || this.postAdFormMainDetails.isValid);
	}

	get imageUrls() {
		return this._imageUrls;
	}

	set imageUrls(newValue) {
		if (this._imageUrls === newValue) {
			return;
		}
		this._imageUrls = newValue;
		this.propertyChanged.trigger('imageUrls', newValue);
	}

	submit() {
		if (!this._canSubmit()) {
			return;
		}

		this._$submitButton.toggleClass('disabled', true);
		this._$submitButton.prop('disabled', true);

		let adPayload = this.postAdFormMainDetails.getAdPayload();
		// Copy imageUrls to avoid changing original values
		adPayload.imageUrls = [].concat(this._imageUrls);

		spinnerModal.showModal();

		$.ajax({
			url: '/api/edit/update',
			type: 'POST',
			data: JSON.stringify(adPayload),
			dataType: 'json',
			contentType: 'application/json',
			success: (response) => {
				window.BOLT.trackEvents({"event": "EditAdSuccess"});
				this._onSubmitSuccess(response, adPayload);
			},
			error: (e) => {
				window.BOLT.trackEvents({"event": "EditAdFail"});
				this._onSubmitFail(e);
			}
		});
	}

	_onSubmitSuccess(response, adInfo) {

		this.postAdFormMainDetails.isFormChangeWarning = false;
		$.ajax({
			url: '/api/promotead/features',
			data: {
				categoryId: this.postAdFormMainDetails.categoryId,
				locationId: this.postAdFormMainDetails.getLocatioinId(),
				adId: response.adId
			},
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success: (features) => {
				if (!features.length) {
					this._redirectWithoutUpselling(response);
				} else {
					spinnerModal.completeSpinner(() => {
						this._$editAdContent.toggleClass("hidden", true);
						this._$featurePromote.toggleClass("hidden", false);
						if (response.insertionFee) {
							this.adInsertionFee.updateInsertionFee(adInfo, response.insertionFee, this.postAdFormMainDetails.getCategorySelectionName(), response.redirectLink && response.redirectLink.vip);
						} else {
							this._$promoteWithoutInf.toggleClass("hidden", false);
						}
						this.adFeatureSelection.render(features, response.adId, response.insertionFee, response.redirectLink && response.redirectLink.vip);
					});
				}
			},
			error: () => {
				this._redirectWithoutUpselling(response);
			}
		});
	}

	_redirectWithoutUpselling(response) {
		spinnerModal.completeSpinner(() => {
			if (response.redirectLink.previp) {
				window.location.href = response.redirectLink.previp + '&redirectUrl=' + window.location.protocol + '//' + window.location.host + response.redirectLink.previpRedirect;
			} else {
				window.location.href = response.redirectLink.vip;
			}
		});
	}

	_onSubmitFail(error) {
		this._$submitButton.toggleClass('disabled', false);
		this._$submitButton.prop('disabled', false);
		spinnerModal.hideModal();
		// validation error
		if (error.status === 400) {
			let errorObj = JSON.parse(error.responseText || '{}');
			this.postAdFormMainDetails.setValidationError(errorObj);
		}
	}
}

module.exports = {
	initialize: function() {
		$(document).ready(() => {
			new EditAd().componentDidMount($(document.body));
		});
	},
	EditAd
};
