'use strict';

require("slick-carousel");
let EpsUpload = require('../../uploadImage/js/epsUpload').EpsUpload;
let UploadMessageClass = require('../../uploadImage/js/epsUpload').UploadMessageClass;
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');

$.prototype.doesExist = function() {
	return $(this).length > 0;
};

Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// View model for photo carousel
class PhotoCarouselVM {
	constructor() {
		this.imageUrls = [];
		this.imageUrlsChangeEmitter = new SimpleEventEmitter();
	}

	addImageUrlsChangeHandler(handler) {
		this.imageUrlsChangeEmitter.addHandler(handler);
	}

	updateImageUrls(newImageUrls) {
		if (newImageUrls.length !== this.imageUrls.length ||
			newImageUrls.some((imageUrl, index) => newImageUrls[index] !== this.imageUrls[index])) {
			this.imageUrls = [].concat(newImageUrls);
			this.imageUrlsChangeEmitter.trigger();
		}
	}
}

class PhotoContainer {

	constructor() {
		this.setupViewModel();
	}
	// Common interface for all component to setup view model. In the future, we'll have a manager
	// to control the lifecycle of view model.
	setupViewModel() {
		this.viewModel = new PhotoCarouselVM();
	}

	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param
	 */
	initialize() {

		this.allowedUploads = 12;
		//EPS setup
		this.epsData = $('#js-eps-data');
		this.uploadImageContainer = $('.upload-image-container');
		this.EPS = {};
		this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
		this.EPS.token = this.epsData.data('eps-token');
		this.EPS.url = this.epsData.data('eps-url');
		this.epsUpload = new EpsUpload(this.EPS);
		this.$postAdButton = $('#postAdBtn');
		this.imgUrls = [];
		this.imageCount = 0;
		this.latestPosition = 0;
		this.haveTryUploadBefore = false;

		this.messageError = $('.error-message');
		this.messageModal = $('.message-modal');
		this.$errorModalClose = this.messageModal.find('#js-close-error-modal');
		this.$errorMessageTitle = $('#js-error-title');
		this.$errorModalButton = this.messageModal.find('.btn');
		this.$errorModalClose.click(() => {
			this.messageModal.toggleClass('hidden');
		});

		this.$imageUpload = $(".file-input-wrapper").find('input[name="pic"]');
		//listen for file uploads
		this.$imageUpload.on("change", (event) => {
			$($('#photo-0').find('.add-photo-text')).addClass('spinner');
			this._uploadImageShowSpinner();
			this.fileInputChange(event);
		});

		this.$errorModalButton.click(() => {
			this.messageModal.toggleClass('hidden');
			this.$imageUpload.click();
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

		this.uploadMessageClass = new UploadMessageClass(
			this.epsData,
			this.messageError,
			this.messageModal,
			this.$errorMessageTitle,
			{
				hideImage: () => {
					this.$imageUpload.val('');
					this.imageCount--;
				}
			}
		);

		// Clicking empty cover photo OR 'add photo' carousel item should open file selector
		$("#photo-0").on('click', () => {
			this.clickFileInput();
		});

		// Listen for file drag and drop uploads
		let photoSwitcher = $(".photo-switcher");
		photoSwitcher.on('drop dragover', (event) => {
			// stop browser from opening dropped file(s)
			event.preventDefault();
			event.stopPropagation();

			// trigger change on file input to start upload flow
			let files = event.originalEvent.dataTransfer.files;
			this.fileInputChange({
				target: {
					files: files
				}
			});
		});

		/**
		 * failure case for eps upload, in the initialize function to get arrow function this binding
		 * @param i
		 * @param epsError
		 * @private
		 */
		this._failure = (i, epsError) => {
			let error = this.epsUpload.extractEPSServerError(epsError);
			let toRemove = $(".carousel-item[data-item='" + i + "']");
			toRemove.find('.spinner').toggleClass('hidden');

			this.uploadMessageClass.translateErrorCodes(i, error);
			return epsError;
		};



		/**
		 * success case for eps upload, in the initialize function to get arrow function this binding
		 * @param i
		 * @param response
		 * @private
		 */
		this._success = (i, response) => {

			if (response.indexOf('ERROR') !== -1) {
				console.error("EPS error!");
				return this._failure(i, response);
			}
			// For the first time, update the photo layout
			if (!this.haveTryUploadBefore) {
				this._updatePhotoContainerLayout();
				this.haveTryUploadBefore = true;
			}

			// try to extract the url and figure out if it looks like to be valid
			let url = this.epsUpload.extractURLClass(response);
			// any errors don't do anything after display error msg
			if (!url) {
				console.error("Failed to extract url class!");
				return this._failure(i, response);
			}
			let normalUrl = this.transformEpsUrl(url.normal);
			this._uploadImageHideSpinner();
			if (this.latestPosition === 0) {
				// Recognize the first image category
				spinnerModal.showModal();
				$.ajax({
					url: '/api/postad/imagerecognition',
					type: 'POST',
					data: JSON.stringify({"url" : normalUrl}),
					dataType: 'json',
					contentType: "application/json",
					success: (result) => spinnerModal.completeSpinner(() => {
						if (this.categoryUpdateCallback) {
							this.categoryUpdateCallback(result.categoryId);
						}
					}),
					error: (err) => {
						console.warn(err);
						spinnerModal.hideModal();
					}
				});
			}
			this._updatePhotoDivBackgroundImg(normalUrl);
			// Enable post button when image upload success
			this.$postAdButton.removeClass("disabled");
			window.BOLT.trackEvents({"event": "PostAdPhotoSuccess"});
		};
	}

	_updatePhotoDivBackgroundImg(imagUrl) {
		// Switch from single layout to multiple layout, need to update location
		this.latestPosition = this.latestPosition === 0 ? 1 : this.latestPosition;
		let coverPhoto = $('#photo-' + this.latestPosition);
		coverPhoto.css("background-image", "url('" + imagUrl + "')");
		coverPhoto.removeClass("no-photo");
		this.imgUrls[this.latestPosition] = imagUrl;
		if (this.imageUrlsUpdateCallback) {
			this.imageUrlsUpdateCallback(this.imgUrls);
		}
		this.viewModel.updateImageUrls(this.imgUrls);
		// Find next position for image upload
		for (let i=1; i<=this.allowedUploads; i++) {
			if ($('#photo-' + i).css("background-image") === "none") {
				this.latestPosition = i;
				break;
			}
		}
	}

	/**
	 * Change photo container layout when upload first image
	 */
	_updatePhotoContainerLayout() {
		// 1.Using the first camera photo div as template
		let newDiv = $("#photo-0").clone();
		// 2.Adjust style for multiple photo laylout
		newDiv.removeClass("cover-photo-big");
		newDiv.addClass("cover-photo-small");
		newDiv.find(".add-photo-text").css("font-size", "15px");
		$(newDiv.find(".add-photo-text")).removeClass('spinner');
		// 3.Hide the first camera photo div
		$("#photo-0").hide();
		// 4.Create multiple photo upload layout
		for (let j = 1; j <= this.allowedUploads; j++) {
			newDiv.attr("id", "photo-" + j);
			this._bindEventToNewPhotoUploadDiv(newDiv);
			$("#photo-0").parent().append(newDiv);
			newDiv=newDiv.clone();
		}
	}

	_bindEventToNewPhotoUploadDiv(newDiv) {
		newDiv.on('click', () => {
			this.$imageUpload.click();
		});
		newDiv.find(".delete-wrapper").on('click', (e) => {
			e.stopImmediatePropagation();
			let imageDiv = $(e.target.parentNode.parentNode);
			let imageUrl = imageDiv.css("background-image").split('"');
			if (imageUrl[1]) {
				let position = this.imgUrls.indexOf(imageUrl[1]);
				if (position !== -1) {
					this.imgUrls[position] = null;
					if (this.imageUrlsUpdateCallback) {
						this.imageUrlsUpdateCallback(this.imgUrls);
					}
					this.viewModel.updateImageUrls(this.imgUrls);
				}
			}
			imageDiv.css("background-image", "");
			imageDiv.addClass("no-photo");

			this.imageCount--;
			if (this.imageCount === 0) {
				this.$postAdButton.addClass("disabled");
			}

		});
	}

	_uploadImageShowSpinner() {
		for (let i=1; i<=this.allowedUploads; i++) {
			if ($('#photo-' + i).css("background-image") === "none") {
				$($('#photo-' + i).find('.add-photo-text')).addClass('spinner');
				this.latestPosition = i;
				break;
			}
		}
	}

	_uploadImageHideSpinner() {
		$($('#photo-' + this.latestPosition).find('.add-photo-text')).removeClass('spinner');
	}

	/**
	 * fires when the file input has a new image, triggers eps upload
	 * @param evt
	 */
	fileInputChange(evt) {
		if (evt.stopImmediatePropagation) {
			evt.stopImmediatePropagation();
		}
		// parse file(s)
		let files = evt.target.files;
		for (let i = 0; i < files.length; i++) {
			this.parseFile(files[i]);
		}
	}

	/**
	 * prevent the user from repeatedly clicking the file input field and triggering a file selection window
	 * 	repeatedly
	 * 	also triggers the file selection window
	 */
	clickFileInput() {
		if (!this.disableImageSelection) {
			// prevent re-opening of file selector
			this.disableImageSelection = true;
			setTimeout(() => {
				this.disableImageSelection = false;
			}, 3000);
			this.$imageUpload.click();
		}
	}

	/**
	 * reads the file in then kicks off the events for eps upload
	 * @param file
	 */
	//TODO: rewrite this to be more testable.
	parseFile(file) {
		let reader = new FileReader();

		if (!this.epsUpload.isSupported(file.name)) {
			this.uploadMessageClass.invalidType(0);
			console.error("Invalid File Type");
			return;
		}

		reader.onloadend = () => {
			if (this.imageCount < this.allowedUploads) {
				// disable post while image uploads
				this.$postAdButton.addClass("disabled");
				// create image place holders
				this.imageCount++;
				this.uploadMessageClass.loadingMsg(this.imageCount - 1);
				this.prepareForImageUpload(this.imageCount - 1, file);
				this.$imageUpload.val('');
			} else {
				console.warn('No more than 12 images can be uploaded');
			}
		};
		if (file) {
			reader.readAsDataURL(file);
		}
	}


	prepareForImageUpload(i, file) {
		let _this = this;
		let onload = (thisFile) => {
			return function() {
				let resizedImageFile = _this.epsUpload.scaleAndCropImage(this, thisFile.type);
				_this.loadData(i, resizedImageFile);
			};
		};
		this.epsUpload.prepareForImageUpload(i, file, this.loadData, onload);
	}

	loadData(i, file) {
		let _this = this;
		this.epsUpload.uploadToEps(i, file, this._success, this._failure, () => {
			let xhr = new window.XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(event) {
				let index = this.bCount;

				if (!event.lengthComputable) {
					_this.uploadMessageClass.failMsg(index);
				}
			}, false);
			return xhr;
		});
	}

	//this needs to be removed when HTTPS for EPS gets a certificate
	transformEpsUrl(url) {
		let newUrl = url.replace('i.ebayimg.sandbox.ebay.com', 'i.sandbox.ebayimg.com');
		return newUrl;
	}

	setCategoryUpdateCallback(func) {
		this.categoryUpdateCallback = func;
	}

	setImageUrlsUpdateCallback(func) {
		this.imageUrlsUpdateCallback = func;
	}

}

module.exports = new PhotoContainer();
