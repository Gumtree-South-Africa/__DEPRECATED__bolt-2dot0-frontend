"use strict";
let UploadMessageClass = require('./epsUpload').UploadMessageClass;
let photoContainer = require('app/appWeb/views/components/photoContainer/js/photoContainer.js');
let postAdFormMainDetails = require('app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js');
let mobileUpload = require('app/appWeb/views/components/uploadImage/js/mobileUpload.js');
let postAdModal = require('app/appWeb/views/components/postAdModal/js/postAdModal.js');
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');

// View model for post ad page
class PostAdPageVM {
	constructor() {
		// True as default value to be consistent with default view
		this.valid = true;

		// Initialize old singleton components
		this.spinnerModal = spinnerModal;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		this.mobileUpload = mobileUpload.viewModel;
		this.postAdModal = postAdModal.viewModel;
		this.postAdFormMainDetails = postAdFormMainDetails.viewModel;
		this.$infoTips = domElement.find(".info-tips");

		// Callback for old singleton components
		this.spinnerModal.initialize();

		this.mobileUpload.propertyChanged.addHandler((propName, newValue) => {
			if (propName !== 'imageUrl' || !newValue) {
				return;
			}

			this.$infoTips.hide();
			this.postAdFormMainDetails.show();

			this.postAdFormMainDetails.imageUrls = [newValue];
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
		} else {
			this.postAdFormMainDetails.imageUrls = [this.mobileUpload.imageUrl];
			this.postAdFormMainDetails.show();
		}
	}
}

class PostAd {
	constructor() {
		this.setupViewModel();
	}

	initialize() {
		// Ignore button click if it's disabled
		this.AD_STATES = {
			AD_CREATED: "AD_CREATED",
			AD_DEFERRED: "AD_DEFERRED"
		};

		this.$postAdButton = $('#postAdBtn');
		this.$postAdButton.on('click', (e) => {
			this.preventDisabledButtonClick(e);
		});
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
		$("#postAdBtn .link-text").on("click", (e) => {
			this.preventDisabledButtonClick(e);
		});

		$(document).ready(() => {
			this.photoCarouselVM = this.getPhotoCarouselVM();
			this.photoCarouselVM.addImageUrlsChangeHandler(() => this.updateValidStatus());
			this.updateValidStatus();
			this.viewModel.componentDidMount($(document.body));
			this.viewModel.postAdFormMainDetails.handleGetLatLngFromGeoCookie = () => this.getLatLngFromGeoCookie();
			this.viewModel.postAdFormMainDetails.propertyChanged.addHandler((propName, newValue) => {
				if ((propName === 'isFixMode' || propName === 'isValid') && newValue) {
						photoContainer.setFormValid(!this.viewModel.postAdFormMainDetails.isFixMode ||
							this.viewModel.postAdFormMainDetails.isValid);
				}
			});
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
			photoContainer.setImageUrlsUpdateCallback((imgUrls) => {
				this.viewModel.postAdFormMainDetails.imageUrls = [].concat(imgUrls);
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

	// Get children view models. Should change to use DI in the future
	getPhotoCarouselVM() {
		// Currently photo carousel is a singleton.
		return photoContainer.viewModel;
	}

	updateValidStatus() {
		let newValidStatus = !!this.photoCarouselVM.imageUrls.length;
		if (this.viewModel.valid !== newValidStatus) {
			this.viewModel.valid = newValidStatus;
			if (newValidStatus) {
				this.$postAdButton.removeClass('disabled');
			} else {
				this.$postAdButton.addClass('disabled');
			}
		}
	}

	hasImagesForUpload() {
		// add red border to photo carousel if no photos
		return $('.carousel-item').length !== 0;
	}

	getCookie(cname) {
		let name = cname + "=";
		let ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	/**
	 * Tries to get the location from the browser, defaults to timeout after 20 seconds, will setup geoId cookie when success
	 * @param callback callback function that takes a string and a timeout to use with clearTimeout
	 */
	requestLocationFromBrowser(callback) {
		let timeout;
		if ("geolocation" in navigator && this.getCookie('geoId') === '') {
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

	/**
	 * this is the click handler for posting, checks to see if they can upload first before calling postAdDesktop
	 * desktop only.
	 * @param event
	 */
	preventDisabledButtonClick(event) {
		if (this.$postAdButton.hasClass("disabled")) {
			event.preventDefault();
		} else {
			this.$postAdButton.addClass('disabled');
			postAdFormMainDetails._ajaxPostForm();
		}
	}

	/**
	 * Tries to get the location from geoId, will setup geoId cookie when success
	 */
	getLatLngFromGeoCookie() {
		let geoCookie = this.getCookie('geoId');
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
}

module.exports = new PostAd();
