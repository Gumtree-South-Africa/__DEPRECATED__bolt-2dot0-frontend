'use strict';

let EpsUpload = require('./epsUpload.js').EpsUpload;
let UploadMessageClass = require('./epsUpload').UploadMessageClass;
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

$.prototype.doesExist = function() {
	return $(this).length > 0;
};

Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// View model for mobile upload
class MobileUploadVM {
	constructor() {
		this.propertyChanged = new SimpleEventEmitter();
		this.handleLocationRequest = null;

		this._imageUrl = null;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		this._imageUrl = domElement.find('input[name=initialImage]').val();
	}

	get imageUrl() {
		return this._imageUrl;
	}

	// Internal API which will be removed after MobileUpload has been componentized
	set imageUrl(newValue) {
		if (this._imageUrl === newValue) {
			return;
		}
		this._imageUrl = newValue;
		this.propertyChanged.trigger('imageUrl', newValue);
	}
}


class MobileUpload {
	constructor() {
		this.setupViewModel();
	}

	initialize() {
		//this.inputDisabled = false;
		this.epsData = $('#js-eps-data');
		this.uploadImageContainer = $('.upload-image-container');
		this.imageProgress = this.uploadImageContainer.find('#js-image-progress');
		this.imageHolder = this.uploadImageContainer.find('.user-image');
		this.EPS = {};
		this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
		this.EPS.token = this.epsData.data('eps-token');
		this.EPS.url = this.epsData.data('eps-url');

		this.epsUpload = new EpsUpload(this.EPS);

		this.uploadPhotoText = this.uploadImageContainer.find('.upload-photo-text');
		this.$uploadSpinner = this.uploadImageContainer.find('#js-upload-spinner');
		this.$uploadProgress = this.uploadImageContainer.find('#js-upload-progress');

		this.messageError = $('.error-message');
		this.messageModal = $('.message-modal');
		this.$errorModalClose = this.messageModal.find('#js-close-error-modal');
		this.$errorMessageTitle = $('#js-error-title');
		this.$errorModalButton = this.messageModal.find('.btn');

		this.uploadMessageClass = new UploadMessageClass(
			this.epsData,
			this.messageError,
			this.messageModal,
			this.$errorMessageTitle,
			{
				hideImage: () => {
					this.imageHolder.css("background-image", `url("")`);
					this.uploadPhotoText.toggleClass('hidden');
					this.$imageUpload.val('');
					//this.inputDisabled = false;
					this.$uploadSpinner.addClass('hidden');
					this.$uploadProgress.addClass('hidden');
				}
			}
		);

		this.$errorModalClose.click((e) => {
			e.stopImmediatePropagation();
			this.messageModal.toggleClass('hidden');
		});

		this.$errorModalButton.click((e) => {
			e.stopImmediatePropagation();
			this.messageModal.toggleClass('hidden');
			this.$imageUpload.click();
		});

		this.uploadPhotoText.on('click', (e) => {
			e.stopImmediatePropagation();
			this.$imageUpload.click();
		});

		this.$imageUpload = $("#mobileFileUpload");
		/*
		this.$imageUpload.on('click', (e) => {
			if (this.inputDisabled) {
				return e.preventDefault();
			}
		});
		*/

		this.i18n = {
			clickFeatured: this.epsData.data('i18n-clickfeatured'),
			imageFeatured: this.epsData.data('i18n-imagefeatured'),
			dragToReorder: this.epsData.data('i18n-dragtoreorder')
		};
		this.Bolt = {};
		this.Bolt._postFormMsgs = {
			selectLocationLabel: this.epsData.data('eps-selectlocationlabel'),
			selectCategoryLabel: this.epsData.data('eps-selectcategorylabel'),
			categorySearchPlaceholder: this.epsData.data('eps-categorysearchplaceholder')
		};
		// on select file
		$('#postForm').on("change", "#mobileFileUpload", (evt) => {
			this.uploadPhotoText.toggleClass('hidden');

			evt.stopImmediatePropagation();
			let file = evt.target.files[0];
			if (!file) {
				return;
			}
			if (!this.epsUpload.isSupported(file.name)) {
				this.uploadMessageClass.invalidType();
				return;
			}
			//this.inputDisabled = true;
			this.uploadPhotoText.addClass('hidden');
			this.$uploadSpinner.toggleClass('hidden');
			this.$uploadProgress.toggleClass('hidden');
			// lets only do if there is support for multiple
			this.html5Upload(evt);
		});

		/**
		 * i is always 0 for mobile, kept for consistency in callbacks between desktop/mobile
		 * response is EPS response
		 * function declared inside this function to get arrow function this binding
		 * @param i
		 * @param response
		 * @private
		 */
		this._success = (i, response) => {
			let url = this.epsUpload.extractURLClass(response);

			if (!url) {
				let error = this.epsUpload.extractEPSServerError(response);
				this.uploadMessageClass.translateErrorCodes(0, error);
				return;
			}
			window.BOLT.trackEvents({"event": "PostAdPhotoSuccess"});
			this.handleImageUrlChanged(url.normal);
		};

		/**
		 * here for this binding
		 * @param err
		 * @private
		 */
		this._failure = (err) => {
			let error = this.epsUpload.extractEPSServerError(err);
			this.$uploadSpinner.toggleClass('hidden');
			this.$uploadProgress.toggleClass('hidden');
			this.uploadMessageClass.translateErrorCodes(0, error);
			this.uploadMessageClass.failMsg(0);
		};

		// Logic for initial image
		this.viewModel.componentDidMount(this.uploadImageContainer);
		if (this.viewModel.imageUrl) {
			this.uploadPhotoText.addClass('hidden');
			this.imageHolder.css("background-image", `url("${this.viewModel.imageUrl}")`);
		}
	}

	handleImageUrlChanged(url) {
		this.imageHolder.css("background-image", `url("${url}")`);

		this.$uploadSpinner.addClass('hidden');
		this.$uploadProgress.addClass('hidden');
		this.$uploadProgress.html("0%");

		if (this.viewModel.handleLocationRequest) {
			this.viewModel.handleLocationRequest((locationType, timeout) => {
				if (timeout !== undefined) {
					clearTimeout(timeout);
				}
			});
		}

		this.viewModel.imageUrl = url;
	}

	// Common interface for all component to setup view model. In the future, we'll have a manager
	// to control the lifecycle of view model.
	setupViewModel() {
		this.viewModel = new MobileUploadVM();
	}


	/**
	 * used to handle percent complete
	 * @param i 0 always in the mobile case
	 * @param file
	 */
	loadData(i, file) {
		let _this = this;
		this.epsUpload.uploadToEps(i, file, this._success, this._failure, () => {
			let xhr = new window.XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(event) {
				let index = this.bCount;

				if (event.lengthComputable) {
					let percent = event.loaded / event.total;
					_this.$uploadProgress.html((percent * 100).toFixed() + "%");

					_this.imageProgress.attr('value', percent * 100);
				} else {
					this.uploadMessageClass.failMsg(index);
				}
			}, false);
			return xhr;
		});
	}

	prepareForImageUpload(i, file) {
		let _this = this;
		let onload = (thisFile) => {
			return function() {
				let resizedImageFile = _this.epsUpload.scaleAndCropImage(this, thisFile.type);
				let blobReader = new FileReader();
				blobReader.readAsDataURL(resizedImageFile);
				blobReader.onloadend = () => {
					_this.imageHolder.css('background-image', `url('${blobReader.result}')`);
				};
				_this.loadData(i, resizedImageFile);
			};
		};

		this.epsUpload.prepareForImageUpload(i, file, this.loadData, onload);
	}

	html5Upload(evt) {
		// drag and drop
		let uploadedFiles = evt.target.files || evt.dataTransfer.files;
		let totalFiles = uploadedFiles.length;

		// if user
		if (totalFiles === 1) {
			// create image place holders
			this.uploadMessageClass.loadingMsg(0); //this.uploadMessageClass(upDone).fail()
			this.prepareForImageUpload(0, uploadedFiles[0]);
		}
	}
}

module.exports = new MobileUpload();



