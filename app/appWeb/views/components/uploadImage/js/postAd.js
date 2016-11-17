"use strict";
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");
let UploadMessageClass = require('./epsUpload').UploadMessageClass;
let loginModal = require('app/appWeb/views/components/loginModal/js/loginModal.js');
let photoContainer = require('app/appWeb/views/components/photoContainer/js/photoContainer.js');
let categoryUpdateModal = require('app/appWeb/views/components/uploadImage/js/categoryUpdateModal');
let postAdFormMainDetails = require('app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js');
let mobileUpload = require('app/appWeb/views/components/uploadImage/js/mobileUpload.js');
let postAdModal = require('app/appWeb/views/components/postAdModal/js/postAdModal.js');

// View model for post ad page
class PostAdPageVM {
	constructor() {
		// True as default value to be consistent with default view
		this.valid = true;
	}

	/**
	 * Lifecycle callback which will be called when page has been loaded
	 */
	pageDidMount() {
		this.mobileUpload = mobileUpload.viewModel;
		this.postAdModal = postAdModal.viewModel;
		this.postAdFormMainDetails = postAdFormMainDetails.viewModel;
		if (!this.mobileUpload.initialImage) {
			this.postAdModal.isShown = true;
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

		this.photoCarouselVM = this.getPhotoCarouselVM();
		this.photoCarouselVM.addImageUrlsChangeHandler(() => this.updateValidStatus());
		this.updateValidStatus();
		this.viewModel.pageDidMount();
		this.viewModel.mobileUpload.handleLocationRequest = (callback) => this.requestLocation(callback);
		this.viewModel.postAdFormMainDetails.handleGetLatLngFromGeoCookie = () => this.getLatLngFromGeoCookie();

		// TBD Need to refactor follow previous convention
		photoContainer.setCategoryUpdateCallback((catId) => {
			categoryUpdateModal.updateCategory(catId);
		});
		photoContainer.setImageUrlsUpdateCallback((imgUrls) => {
			postAdFormMainDetails.setImgUrls(imgUrls);
		})
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
	 * tries to get the location from the browser, defaults to timeout after 20 seconds.
	 * @param callback callback function that takes a string and a timeout to use with clearTimeout
	 */
	requestLocation(callback) {
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
			options.locationType = 'geoIp';
			/*eslint-enable*/
		} else {
			console.warn('no geolocation provided');
		}

		return {lat: lat, lng: lng};
	}
}

module.exports = new PostAd();
