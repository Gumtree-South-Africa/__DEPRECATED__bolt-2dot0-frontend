"use strict";
let UploadMessageClass = require('./epsUpload').UploadMessageClass;
let photoContainer = require('app/appWeb/views/components/photoContainer/js/photoContainer.js');
let postAdFormMainDetails = require('app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js');
let mobileUpload = require('app/appWeb/views/components/uploadImage/js/mobileUpload.js');
let postAdModal = require('app/appWeb/views/components/postAdModal/js/postAdModal.js');
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let loginModal = require('app/appWeb/views/components/loginModal/js/loginModal.js');

let CookieUtils = require('public/js/common/utils/CookieUtils.js');
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

// View model for post ad page
class PostAdPageVM {
	constructor() {
		this.propertyChanged = new SimpleEventEmitter();

		this._imageUrls = [];
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		// Callback for all children components have been mounted
		this.mobileUpload = mobileUpload.viewModel;
		this.postAdModal = postAdModal.viewModel;
		this.postAdFormMainDetails = postAdFormMainDetails.viewModel;
		this.photoContainer = photoContainer.viewModel;
		this.spinnerModal = spinnerModal;

		// Callback for old singleton components
		spinnerModal.initialize();
		mobileUpload.initialize();
		postAdModal.initialize();
		photoContainer.initialize();
		postAdFormMainDetails.initialize();
		loginModal.initialize();

		this._$infoTips = domElement.find(".info-tips");
		this._$submitButton = domElement.find('#post-submit-button .btn, #postAdBtn');

		this.propertyChanged.addHandler((propName/*, newValue*/) => {
			if (propName !== 'imageUrls') {
				this._$submitButton.toggleClass('disabled', !this._canPost());
			}
		});
		this.mobileUpload.propertyChanged.addHandler((propName, newValue) => {
			if (propName !== 'imageUrl' || !newValue) {
				return;
			}

			this._$infoTips.hide();
			this.postAdFormMainDetails.show();

			this.imageUrls = [newValue];
			this.spinnerModal.showModal();

			$.ajax({
				url: '/api/postad/imagerecognition',
				type: 'POST',
				data: JSON.stringify({"url" : newValue}),
				dataType: 'json',
				contentType: "application/json",
				success: (result) => spinnerModal.completeSpinner(() => {
					this.postAdFormMainDetails.categoryId = result.categoryId;
				}),
				error: (err) => {
					console.warn(err);
					this.spinnerModal.hideModal();
				}
			});
		});

		if (!this.mobileUpload.imageUrl) {
			this.postAdModal.isShown = true;
			this.imageUrls = [];
		} else {
			this.imageUrls = [this.mobileUpload.imageUrl];
			this.postAdFormMainDetails.show();
		}

		this.postAdFormMainDetails.propertyChanged.addHandler((propName/*, newValue*/) => {
			if (propName === 'isValid' || propName === 'isFixMode') {
				this._$submitButton.toggleClass('disabled', !this._canPost());
			}
		});
		this._$submitButton.toggleClass('disabled', !this._canPost());

		this._$submitButton.on('click', e => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.submit();
		});

		this.photoContainer.addImageUrlsChangeHandler(() => {
			this.imageUrls = [].concat(this.photoContainer.imageUrls);
		});
	}

	_canPost() {
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
		if (!this._canPost()) {
			return;
		}

		window.BOLT.trackEvents({"event": "PostAdFreeAttempt"});
		this._$submitButton.toggleClass('disabled', true);

		let postAdPayload = this.postAdFormMainDetails.getAdPayload();
		// Copy imageUrls to avoid changing original values
		postAdPayload.imageUrls = [].concat(this._imageUrls);
		let payload = {
			ads: [postAdPayload]
		};

		spinnerModal.showModal();

		$.ajax({
			url: '/api/postad/create',
			type: 'POST',
			data: JSON.stringify(payload),
			dataType: 'json',
			contentType: 'application/json',
			success: (response) => {
				this._onSubmitSuccess(response);
			},
			error: (e) => {
				this._onSubmitFail(e);
			}
		});
	}

	_onSubmitSuccess(response) {
		this.viewModel.isFormChangeWarning = false;
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
				window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdLoginModal"}});
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

	_onSubmitFail(error) {
		this._$submitButton.toggleClass('disabled', false);
		spinnerModal.hideModal();
		// validation error
		if (error.status === 400) {
			let errorObj = JSON.parse(error.responseText || '{}');
			this.postAdFormMainDetails.setValidationError(errorObj);
		}
	}
}

class PostAd {
	constructor() {
		this.setupViewModel();
	}

	initialize() {
		this.messageError = $('.error-message');
		this.messageModal = $('.message-modal');
		this.inputDisabled = false;
		this.uploadImageContainer = $('.upload-image-container');
		this.$uploadSpinner = this.uploadImageContainer.find('#js-upload-spinner');
		this.$uploadProgress = this.uploadImageContainer.find('#js-upload-progress');
		this.epsData = $('#js-eps-data');

		this.$errorMessageTitle = $('#js-error-title');
		this.uploadMessageClass = new UploadMessageClass(
			//For error messages
			this.epsData,
			this.messageError,
			this.messageModal,
			this.$errorMessageTitle,
			{}
		);

		$(document).ready(() => {
			this.viewModel.componentDidMount($(document.body));
			this.viewModel.postAdFormMainDetails.handleGetLatLngFromGeoCookie = () => this.getLatLngFromGeoCookie();
			// Try to get lat / lng from from the browser if no GeoId cookie, also will update GeoId cookie if not exist
			this.requestLocationFromBrowser((locationType, timeout) => {
					if (timeout !== undefined) {
						clearTimeout(timeout);
					}
			});
			// TBD Need to refactor follow previous convention
			photoContainer.setCategoryUpdateCallback((catId) => {
				this.viewModel.postAdFormMainDetails.categoryId = catId;
			});

			let mobilePostAd = $('.mobile-upload-image');
			if (mobilePostAd.length && window.getComputedStyle(mobilePostAd[0]).display !== 'none') {
				// In mobile view
				$('body, html').scrollTop(Math.max($('#mobileFileUpload').offset().top - 5, 0));
			}
		});
	}

	// Common interface for all component to setup view model. In the future, we'll have a manager
	// to control the lifecycle of view model.
	setupViewModel() {
		this.viewModel = new PostAdPageVM();
	}

	/**
	 * Tries to get the location from the browser, defaults to timeout after 20 seconds, will setup geoId cookie when success
	 * @param callback callback function that takes a string and a timeout to use with clearTimeout
	 */
	requestLocationFromBrowser(callback) {
		let timeout;
		if ("geolocation" in navigator && CookieUtils.getCookie('geoId') === '') {
			//Don't want to sit and wait forever in case geolocation isn't working
			timeout = setTimeout(callback, 20000);
			navigator.geolocation.getCurrentPosition((position) => {
					let lat = position.coords.latitude;
					let lng = position.coords.longitude;
					document.cookie = `geoId=${lat}ng${lng}`;
					callback('geoLocation', timeout);
				}, () => {
					callback('geoFailed', timeout);
				},
				{
					enableHighAccuracy: true,
					maximumAge: 30000,
					timeout: 27000
				});
		} else {
			callback('cookie', timeout);
		}
	}
}

module.exports = new PostAd();
