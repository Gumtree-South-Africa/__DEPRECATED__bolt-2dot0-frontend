'use strict';

let NoUIImageUploader =
	require('app/appWeb/views/components/noUIImageUploader/js/noUIImageUploader.js').NoUIImageUploader;
let WelcomeModal = require('app/appWeb/views/components/welcomeModal/js/welcomeModal.js');
let Header = require('app/appWeb/views/components/headerV2/js/header.js').Header;
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let EPS_CLIENT_ERROR_CODES = require('app/appWeb/views/components/uploadImage/js/epsUpload.js').EPS_CLIENT_ERROR_CODES;

const FILE_SELECT_DEBOUNCE_TIMEOUT = 1000;

// Home page
class HomePage {
	constructor() {
		// Initialize components
		this.noUIImageUploader = new NoUIImageUploader();
		this.welcomeModal = new WelcomeModal();
		this.header = new Header();
		// Initialize singleton components
		this.spinnerModal = spinnerModal;

		// This flag is to work around the problem that cancel in file dialog can not be detected and
		// we need to prevent user from clicking multiple times. So we'll disable the button for a while for
		// user to choose. However, we don't want to apply disable style to button because it will be weird
		// for user to find button is enabled during the file dialog is opening. So we'll use this "hidden"
		// flag to control. It will be set to true when post button is clicked and will be set to false after
		// FILE_SELECT_DEBOUNCE_TIMEOUT or a file is selected.
		this._isFileSelectBlocking = false;
	}

	/**
	 * Lifecycle callback which will be called when page has been loaded
	 */
	pageDidMount() {
		// Callback for all components have been mounted
		this.noUIImageUploader.componentDidMount($('.no-ui-image-uploader'));
		this.welcomeModal.componentDidMount($('.welcome-wrapper'));
		this.header.componentDidMount($('.header-wrapper'));

		// Callback for singleton components
		this.spinnerModal.initialize();

		// Initialize self
		let $uploadFailureMessages = $('#uploadFailureMessages');
		this._errorMessages = {};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.INVALID_DIMENSION] = {
			title: $uploadFailureMessages.data('invalid-dimension-title'),
			message: $uploadFailureMessages.data('invalid-dimension-message')
		};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.INVALID_SIZE] = {
			title: $uploadFailureMessages.data('invalid-size-title'),
			message: $uploadFailureMessages.data('invalid-size-message')
		};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.INVALID_TYPE] = {
			title: $uploadFailureMessages.data('invalid-type-title'),
			message: $uploadFailureMessages.data('invalid-type-message')
		};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.COLOR_SPACE] = {
			title: $uploadFailureMessages.data('colorspace-title'),
			message: $uploadFailureMessages.data('colorspace-message')
		};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.FIREWALL] = {
			title: $uploadFailureMessages.data('firewall-title'),
			message: $uploadFailureMessages.data('firewall-message')
		};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.PICTURE_SRV] = {
			title: $uploadFailureMessages.data('picturesrv-title'),
			message: $uploadFailureMessages.data('picturesrv-message')
		};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.CORRUPT] = {
			title: $uploadFailureMessages.data('corrupt-title'),
			message: $uploadFailureMessages.data('corrupt-message')
		};
		this._errorMessages[EPS_CLIENT_ERROR_CODES.UNKNOWN] = {
			title: $uploadFailureMessages.data('unknown-title'),
			message: $uploadFailureMessages.data('unknown-message')
		};

		// Register event
		this.noUIImageUploader.imageWillUpload.addHandler(() => this._imageWillUpload());
		this.noUIImageUploader.imageDidUpload.addHandler(
			(err, resultUrlObj) => this._imageDidUpload(err, resultUrlObj));
		this.welcomeModal.postButtonClicked.addHandler(() => this._startUploading());
		this.header.hamburgerMenu.postButtonClicked.addHandler(() => this._startUploading());
	}

	_startUploading() {
		if (this._isFileSelectBlocking) {
			return;
		}

		this._isFileSelectBlocking = true;
		this.header.hamburgerMenu.isOpened = false;
		this.noUIImageUploader.uploadImage();
		setTimeout(() => {
			this._isFileSelectBlocking = false;
		}, FILE_SELECT_DEBOUNCE_TIMEOUT);
	}

	_imageWillUpload() {
		this._isFileSelectBlocking = false;
		this.welcomeModal.isPostAllowed = false;
		this.header.hamburgerMenu.isPostAllowed = false;
		this.spinnerModal.showModal();
	}

	_imageDidUpload(error, resultUrlObj) {
		if (error || !resultUrlObj || !resultUrlObj.normal) {
			// TODO Error handling
			this.welcomeModal.isPostAllowed = true;
			this.header.hamburgerMenu.isPostAllowed = true;
			this.spinnerModal.hideModal();

			let errorMessage = this._errorMessages[error.errorCode] ||
				this._errorMessages[EPS_CLIENT_ERROR_CODES.UNKNOWN];
			this.welcomeModal.title = errorMessage.title;
			this.welcomeModal.message = errorMessage.message;
			this.welcomeModal.isOpened = true;
			return;
		}
		this.spinnerModal.completeSpinner(() => this._redirectToPostPage(resultUrlObj.normal));
	}

	_redirectToPostPage(imageUrl) {
		window.location.assign('./post?initialImage=' + encodeURIComponent(imageUrl));
	}
}

// this is where we require what the page needs, so we can bundle per-page


let initialize = () => {
	// prime window with jquery object for use by inline scripts and legacy code
	// window.$ = window.jQuery = $;
	$(document).ready(() => {
		new HomePage().pageDidMount();
	});
};

module.exports = {
	initialize
};

