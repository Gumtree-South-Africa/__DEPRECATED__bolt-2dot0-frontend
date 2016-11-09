'use strict';

let NoUIImageUploader =
	require('app/appWeb/views/components/noUIImageUploader/js/noUIImageUploader.js').NoUIImageUploader;
let WelcomeModal = require('app/appWeb/views/components/welcomeModal/js/welcomeModal.js').WelcomeModal;
let Header = require('app/appWeb/views/components/headerV2/js/header.js').Header;
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');

const FILE_SELECT_DEBOUNCE_TIMEOUT = 300;

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
		this.welcomeModal.isPostAllowed = true;
		this.header.hamburgerMenu.isPostAllowed = true;
		if (error || !resultUrlObj || !resultUrlObj.normal) {
			// TODO Error handling
			this.spinnerModal.hideModal();
			return;
		}
		this.spinnerModal.completeSpinner(() => this._redirectToPostPage(resultUrlObj.normal));
	}

	_redirectToPostPage(imageUrl) {
		window.location.assign('./post?initImage=' + encodeURIComponent(imageUrl));
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

