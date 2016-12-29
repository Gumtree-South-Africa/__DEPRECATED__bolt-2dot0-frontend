'use strict';

// View model for post ad modal
class PostAdModalVM {
	constructor() {
		this._isShown = false;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		this.$wrapper = domElement;
		this._handleIsShownChanged = (newValue) => {
			if (newValue) {
				this.$wrapper.removeClass('hidden');
			} else {
				this.$wrapper.addClass('hidden');
			}
		};
	}

	get isShown() {
		return this._isShown;
	}

	set isShown(newValue) {
		newValue = !!newValue;
		if (this._isShown === newValue) {
			return;
		}
		this._isShown = newValue;
		this._handleIsShownChanged(newValue);
	}

	hiddenModel() {
		this.$wrapper.toggleClass('hidden', true);
	}
}

class PostAdModal {
	constructor() {
		this.setupViewModel();
	}

	initialize() {
		this.$postAdWrapper = $('.post-ad-wrapper');
		this.$postAdModal = $('.post-ad-modal-wrapper', this.$postAdWrapper);
		this.$closeButton = $('#js-close-post-ad-modal', this.$postAdModal);
		this.$mobileFooter = $(".modal-footer-mobile");
		this.$desktopFooter = $(".modal-footer-desktop");
		this.$mobileFileInput = $('#mobileFileUpload');
		this.$deskptopFileInput = $('#desktopFileUpload');
		this.$mobileFooter.on('click', (e) => {
			window.BOLT.trackEvents({"event": "PostAdPhotoUpload", "p": {"t": "PostAdPhotoUpload"}});
			this._toggleModal(e, true);
			this.$mobileFileInput.click();
		});

		this.$desktopFooter.on('click', (e) => {
			this._toggleModal(e, true);
			this.$deskptopFileInput.click();
			window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
		});

		this.$postAdWrapper.on('click', (e) => {
			this._toggleModal(e);
		});

		this.viewModel.componentDidMount(this.$postAdWrapper);
	}

	// Common interface for all component to setup view model. In the future, we'll have a manager
	// to control the lifecycle of view model.
	setupViewModel() {
		this.viewModel = new PostAdModalVM();
	}

	_toggleModal(e, shouldClose) {
		if (shouldClose === undefined) {
			shouldClose = e.target === this.$closeButton[0]
				|| e.target === this.$postAdWrapper[0]
				|| e.target.parentNode === this.$closeButton[0];
		}

		if (shouldClose) {
			window.BOLT.trackEvents({
				"event": "PostAdForm", "p": {"t": "PostAdForm"}
			});
			window.BOLT.trackEvents({
				"event": "PostAdOptionModalClosed"
			});
			this.$postAdWrapper.toggleClass('hidden');
		}
	}
}

module.exports = new PostAdModal();




