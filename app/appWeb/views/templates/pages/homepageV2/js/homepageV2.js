'use strict';

let NoUIImageUploader =
	require('app/appWeb/views/components/noUIImageUploader/js/noUIImageUploader.js').NoUIImageUploader;
let WelcomeModal = require('app/appWeb/views/components/welcomeModal/js/welcomeModal.js').WelcomeModal;
let Header = require('app/appWeb/views/components/headerV2/js/header.js').Header;

// Home page
class HomePage {
	constructor() {
		// Initialize components
		this.noUIImageUploader = new NoUIImageUploader();
		this.welcomeModal = new WelcomeModal();
		this.header = new Header();
	}

	/**
	 * Lifecycle callback which will be called when page has been loaded
	 */
	pageDidMount() {
		// Callback for all components have been mounted
		this.noUIImageUploader.componentDidMount($('.no-ui-image-uploader'));
		this.welcomeModal.componentDidMount($('.welcome-wrapper'));
		this.header.componentDidMount($('.header-wrapper'));

		// Register event
		this.noUIImageUploader.imageWillUpload.addHandler(() => this._imageWillUpload());
		this.noUIImageUploader.imageDidUpload.addHandler(
			(err, resultUrlObj) => this._imageDidUpload(err, resultUrlObj));
		this.welcomeModal.postButtonClicked.addHandler(() => this.noUIImageUploader.uploadImage());
		this.header.hamburgerMenu.postButtonClicked.addHandler(() => this.noUIImageUploader.uploadImage());
	}

	_imageWillUpload() {
		this.welcomeModal.setPostButtonEnabled(false);
		this.header.hamburgerMenu.setPostButtonEnabled(false);
		// TODO Enable mask
	}

	_imageDidUpload(error, resultUrlObj) {
		this.welcomeModal.setPostButtonEnabled(true);
		this.header.hamburgerMenu.setPostButtonEnabled(true);
		// TODO Disable mask
		if (error || !resultUrlObj || !resultUrlObj.normal) {
			// TODO Error handling
			return;
		}
		this._redirectToPostPage(resultUrlObj.normal);
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

