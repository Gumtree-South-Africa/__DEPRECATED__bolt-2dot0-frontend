"use strict";
let photoContainer = require('app/appWeb/views/components/photoContainer/js/photoContainer.js');
let postAdFormMainDetails = require('app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js');
let mobileUpload = require('app/appWeb/views/components/uploadImage/js/mobileUpload.js');
let postAdModal = require('app/appWeb/views/components/postAdModal/js/postAdModal.js');
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let loginModal = require('app/appWeb/views/components/loginModal/js/loginModal.js');
let AdFeatureSelection = require('app/appWeb/views/components/adFeatureSelection/js/adFeatureSelection.js');
let AdInsertionFee = require('app/appWeb/views/components/adInsertionFee/js/adInsertionFee.js');

let CookieUtils = require('public/js/common/utils/CookieUtils.js');
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

const AD_STATES = {
	AD_CREATED: "AD_CREATED",
	AD_DEFERRED: "AD_DEFERRED"
};

const INVALID_COOKIE_VALUE = 'invalid';

// View model for post ad page
class PostAd {
	constructor() {
		this.propertyChanged = new SimpleEventEmitter();
		this.adFeatureSelection = new AdFeatureSelection();
		this.adInsertionFee = new AdInsertionFee();
		this._mobileImageUrls = [];
		this._desktopImageUrls = [];
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
		photoContainer.initialize({pageType: "PostAd"});
		postAdFormMainDetails.initialize({pageType: "PostAd"});
		loginModal.initialize();

		this._$postAdContent = domElement.find(".post-ad-page");
		this._$featurePromote = domElement.find("#feature-promote");
		this._$infoTips = domElement.find(".info-tips");
		this._$mobileSubmitButton = domElement.find('#post-submit-button .btn');
		this._$desktopSubmitButton = domElement.find('#postAdBtn');
		this._$changePhoto = $(".change-photo");
		this._$promoteWithoutInf = domElement.find("#promote-without-if");
		this.adInsertionFee.componentDidMount(domElement);
		this.adFeatureSelection.componentDidMount(domElement);

		this._$changePhoto.on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": "PostAdPhotoBegin", "eventLabel": "Retake Photo"});
			// TODO Move this to mobileUpload
			$("#mobileFileUpload").click();
		});

		this.propertyChanged.addHandler((propName/*, newValue*/) => {
			if (propName === 'mobileImageUrls') {
				this._$mobileSubmitButton.toggleClass('disabled', !this._canMobileSubmit());
			} else if (propName === 'desktopImageUrls') {
				this._$desktopSubmitButton.toggleClass('disabled', !this._canDesktopSubmit());
			}
		});
		this.mobileUpload.propertyChanged.addHandler((propName, newValue) => {
			if (propName !== 'imageUrl' || !newValue) {
				return;
			}

			this._$infoTips.hide();
			this.postAdFormMainDetails.show();

			this.mobileImageUrls = [newValue];
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
			this.mobileImageUrls = [];
		} else {
			this.mobileImageUrls = [this.mobileUpload.imageUrl];
			this._$infoTips.hide();
			this.postAdFormMainDetails.show();
		}
		this._$mobileSubmitButton.on('click', e => {
			e.preventDefault();
			e.stopImmediatePropagation();
			if (!this._canMobileSubmit()) {
				return;
			}
			this.submit(true);
		});
		this._$desktopSubmitButton.on('click', e => {
			e.preventDefault();
			e.stopImmediatePropagation();
			if (!this._canDesktopSubmit()) {
				return;
			}
			this.submit(false);
		});

		this.photoContainer.addImageUrlsChangeHandler(() => {
			this.desktopImageUrls = [].concat(this.photoContainer.imageUrls);
		});
		this.desktopImageUrls = [].concat(this.photoContainer.imageUrls);

		this.postAdFormMainDetails.propertyChanged.addHandler((propName/*, newValue*/) => {
			if (propName === 'isValid' || propName === 'isFixMode') {
				this._$mobileSubmitButton.toggleClass('disabled', !this._canMobileSubmit());
				this._$desktopSubmitButton.toggleClass('disabled', !this._canDesktopSubmit());
			}
		});
		this._$mobileSubmitButton.toggleClass('disabled', !this._canMobileSubmit());
		this._$desktopSubmitButton.toggleClass('disabled', !this._canDesktopSubmit());
		this.postAdFormMainDetails.postFormCustomAttributes.loadBaseUrl = '/api/postad/customattributes/';

		// Try to get lat / lng from from the browser if no GeoId cookie, also will update GeoId cookie if not exist
		this.requestLocationFromBrowser();
		// TBD Need to refactor follow previous convention
		photoContainer.setCategoryUpdateCallback((catId) => {
			this.postAdFormMainDetails.categoryId = catId;
		});

		$('.email-login-btn').on('click', () => {
			window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdLoginWithEmail"}});
		});

		$('.facebook-button').on('click', () => {
			window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdLoginWithFacebook"}});
		});

		$('.register-link').on('click', () => {
			window.BOLT.trackEvents({"event": "UserRegisterBegin", "p": {"t": "PostAdRegister"}});
		});

		let mobilePostAd = $('.mobile-upload-image');
		if (mobilePostAd.length && window.getComputedStyle(mobilePostAd[0]).display !== 'none') {
			// In mobile view
			$('body, html').scrollTop(Math.max($('#mobileFileUpload').offset().top - 5, 0));
		}

		// Remove cookie (if exist) from other page
		// The cookies are designed to be used only once. However, ABTest prevents us from removing
		// cookie in server side. The removal of cookie has to be executed after ABTest redirect. So
		// it's added here, which is the last code run on page load
		CookieUtils.setCookie('initialImage', INVALID_COOKIE_VALUE, 1);
		CookieUtils.setCookie('backUrl', INVALID_COOKIE_VALUE, 1);
	}

	_canMobileSubmit() {
		// Don't submit if no image or not resolve all fix problems
		return this._mobileImageUrls && this._mobileImageUrls.length &&
			(!this.postAdFormMainDetails.isFixMode || this.postAdFormMainDetails.isValid);
	}

	_canDesktopSubmit() {
		// Don't submit if no image or not resolve all fix problems
		return this._desktopImageUrls && this._desktopImageUrls.length &&
			(!this.postAdFormMainDetails.isFixMode || this.postAdFormMainDetails.isValid);
	}

	get mobileImageUrls() {
		return this._mobileImageUrls;
	}

	set mobileImageUrls(newValue) {
		if (this._mobileImageUrls === newValue) {
			return;
		}
		this._mobileImageUrls = newValue;
		this.propertyChanged.trigger('mobileImageUrls', newValue);
	}

	get desktopImageUrls() {
		return this._desktopImageUrls;
	}

	set desktopImageUrls(newValue) {
		if (this._desktopImageUrls === newValue) {
			return;
		}
		this._desktopImageUrls = newValue;
		this.propertyChanged.trigger('desktopImageUrls', newValue);
	}

	submit(useMobileImages) {
		if (!this._canMobileSubmit() && !this._canDesktopSubmit()) {
			return;
		}

		window.BOLT.trackEvents({"event": "PostAdFreeAttempt"});
		this._$mobileSubmitButton.toggleClass('disabled', true);
		this._$desktopSubmitButton.toggleClass('disabled', true);

		let postAdPayload = this.postAdFormMainDetails.getAdPayload();
		// Copy imageUrls to avoid changing original values
		postAdPayload.imageUrls = [].concat(
			useMobileImages ? this._mobileImageUrls : this._desktopImageUrls);
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
				this._onSubmitSuccess(response, postAdPayload);
			},
			error: (e) => {
				this._onSubmitFail(e);
			}
		});
	}

	_onSubmitSuccess(response, adInfo) {

		this.postAdFormMainDetails.isFormChangeWarning = false;

		switch (response.state) {
			case AD_STATES.AD_CREATED:
				spinnerModal.completeSpinner(() => {
					$.ajax({
						url: '/api/promotead/features',
						data: {
							categoryId: this.postAdFormMainDetails.categoryId,
							locationId: this.postAdFormMainDetails.getLocatioinId(),
							adId: response.ad.id
						},
						type: 'GET',
						dataType: 'json',
						contentType: 'application/json',
						success: (features) => {
							spinnerModal.completeSpinner(() => {
								this._$postAdContent.toggleClass("hidden", true);
								this._$featurePromote.toggleClass("hidden", false);
								if (response.ad.insertionFee) {
									this.adInsertionFee.updateInsertionFee(adInfo, response.ad.insertionFee, this.postAdFormMainDetails.getCategorySelectionName(), response.ad.redirectLinks.vip);
								} else {
									this._$promoteWithoutInf.toggleClass("hidden", false);
								}
								this.adFeatureSelection.render(features, response.ad.id, response.ad.insertionFee, response.ad.redirectLinks.vip);
								});
						},
						error: () => {
							if (response.ad.redirectLinks.previp) {
								window.location.href = response.ad.redirectLinks.previp + '&redirectUrl=' + window.location.protocol + '//' + window.location.host + response.ad.redirectLinks.previpRedirect;
							} else if (response.ad.status === 'HOLD') {
								window.location.href = '/edit/' + response.ad.id;
							} else {
								window.location.href = response.ad.redirectLinks.vip;
							}
						}
					});
				});
				break;
			case AD_STATES.AD_DEFERRED:
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
		this._$mobileSubmitButton.toggleClass('disabled', false);
		this._$desktopSubmitButton.toggleClass('disabled', false);
		spinnerModal.hideModal();
		// validation error
		if (error.status === 400) {
			let errorObj = JSON.parse(error.responseText || '{}');
			this.postAdFormMainDetails.setValidationError(errorObj);
		}
	}

	/**
	 * Tries to get the location from the browser and setup geoId cookie when success
	 * @param callback callback function that takes a string
	 */
	requestLocationFromBrowser(callback) {
		if ("geolocation" in navigator && CookieUtils.getCookie('geoId') === '') {
			//Don't want to sit and wait forever in case geolocation isn't working
			navigator.geolocation.getCurrentPosition((position) => {
				let lat = position.coords.latitude;
				let lng = position.coords.longitude;
				document.cookie = `geoId=${lat}ng${lng}`;
				if (callback) {
					callback('geoLocation');
				}
			}, () => {
				if (callback) {
					callback('geoFailed');
				}
			}, {
				enableHighAccuracy: true,
				maximumAge: 30000,
				timeout: 27000
			});
		} else if (callback) {
			callback('cookie');
		}
	}
}

module.exports = {
	initialize: function() {
		$(document).ready(() => {
			new PostAd().componentDidMount($(document.body));
		});
	},
	PostAd
};
