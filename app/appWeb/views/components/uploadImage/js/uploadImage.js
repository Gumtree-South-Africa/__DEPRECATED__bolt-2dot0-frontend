'use strict';

let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let EpsUpload = require('./epsUpload.js').EpsUpload;
let UploadMessageClass = require('./epsUpload').UploadMessageClass;
let uploadAd = require('./uploadAd.js');
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");

$.prototype.doesExist = function() {
	return $(this).length > 0;
};

let _this = this;

let _postAd = (url, locationType) => {

	spinnerModal.showModal();
	this.$uploadSpinner.toggleClass('hidden');
	this.$uploadProgress.toggleClass('hidden');
	this.$uploadProgress.html("0%");

	uploadAd.postAd([url], (response) => {
		this.inputDisabled = false;
		formChangeWarning.disable();
		this.epsUpload.handlePostResponse(this.$loginModal, this.$loginModalMask, response);
	}, (err) => {
		console.warn(err);
		spinnerModal.hideModal();
		formChangeWarning.enable();
		this.uploadMessageClass.failMsg(0);
	}, {
		locationType: locationType
	});
};

let _success = (i, response) => {
	let url = this.epsUpload.extractURLClass(response);

	if (!url) {
		let error = this.epsUpload.extractEPSServerError(response);
		this.uploadMessageClass.translateErrorCodes(0, error);
		return;
	}

	if (this.isMobile) {
		this.imageHolder.css("background-image", `url("${url.normal}")`);
		this.epsUpload.requestLocation((locationType, timeout) => {
			if (timeout !== undefined) {
				clearTimeout(timeout);
			}
			//Don't care if they actually gave us location, just that it finished.
			_postAd(url.normal, locationType);
		});
	}
};

let _failure = (err) => {
	let error = this.epsUpload.extractEPSServerError(err);
	this.$uploadSpinner.toggleClass('hidden');
	this.$uploadProgress.toggleClass('hidden');
	this.uploadMessageClass.translateErrorCodes(0, error);
	this.uploadMessageClass.failMsg(0);
};

let loadData = (i, file) => {
	this.epsUpload.uploadToEps(i, file, _success, _failure, () => {
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
};

let prepareForImageUpload = (i, file) => {
	let onload = (thisFile) => {
		return function() {
			let resizedImageFile = _this.epsUpload.scaleAndCropImage(this, thisFile.type);
			let blobReader = new FileReader();
			blobReader.readAsDataURL(resizedImageFile);
			blobReader.onloadend = () => {
				_this.imageHolder.css('background-image', `url('${blobReader.result}')`);
			};
			loadData(i, resizedImageFile);
		};
	};

	this.epsUpload.prepareForImageUpload(i, file, loadData, onload);
};


let html5Upload = (evt) => {
	// drag and drop
	let uploadedFiles = evt.target.files || evt.dataTransfer.files;
	let totalFiles = uploadedFiles.length;

	// if user
	if (totalFiles === 1) {
		// create image place holders
		this.uploadMessageClass.loadingMsg(0); //this.uploadMessageClass(upDone).fail()
		prepareForImageUpload(0, uploadedFiles[0]);
	}
};

Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

let initialize = () => {
	this.isMobile = true;
	this.inputDisabled = false;
	this.$loginModal = $('.login-modal');
	this.$loginModalMask = $('.login-modal-mask');
	this.epsData = $('#js-eps-data');
	this.uploadImageContainer = $('.upload-image-container');
	this.imageProgress = this.uploadImageContainer.find('#js-image-progress');
	this.imageHolder = this.uploadImageContainer.find('.user-image');
	this.EPS = {};
	this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
	this.EPS.token = this.epsData.data('eps-token');
	this.EPS.url = this.epsData.data('eps-url');
	this.epsUpload = new EpsUpload(this.EPS);
	this.isProgressEventSupport = this.epsUpload.isProgressEventSupported();

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
				this.inputDisabled = false;
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
	this.$imageUpload.on('click', (e) => {
		if (this.inputDisabled) {
			e.preventDefault();
			return;
		}
	});

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
		this.inputDisabled = true;
		this.uploadPhotoText.addClass('hidden');
		this.$uploadSpinner.toggleClass('hidden');
		this.$uploadProgress.toggleClass('hidden');
		// lets only do if there is support for multiple
		html5Upload(evt);
	});
};

module.exports = {
	initialize,
	loadData
};



