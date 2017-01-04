'use strict';

let EpsUpload = require('../../uploadImage/js/epsUpload').EpsUpload;
let UploadMessageClass = require('../../uploadImage/js/epsUpload').UploadMessageClass;
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

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

	getPhotoDivSelect() {
		throw new Error("Need to implement!");
	}

	/**
	 * Update photo container div image background
	 * @param urlNormal
	 */
	updatePhotoDivBackgroundImg(urlNormal) {
		this._setPhotoDivBackgroundImg(urlNormal);
		this.$imageUrls.click();
	}

	/**
	 * Update photo container div images background when layout size change
	 * @param urlNormal
	 */
	syncImages(urls) {
		this.latestPosition = 0;
		let photoDiv = $(this.$docElement.find(this.getPhotoDivSelect()));
		photoDiv.css("background-image", "");
		this.updatePhotoContainerLayout();
		urls.forEach((imageUrl) => {
			this._setPhotoDivBackgroundImg(imageUrl);
		});
	}

	/**
	 * Update photo container div image background
	 * @param urlNormal
	 * @private
	 */
	_setPhotoDivBackgroundImg(urlNormal) {
		let photoDiv = $(this.$docElement.find(this.getPhotoDivSelect()));
		let coverPhoto = $(photoDiv[this.latestPosition]);
		coverPhoto.css("background-image", "url('" + urlNormal + "')").attr("data-image", urlNormal).toggleClass('no-photo',false);
		let imgUrls = JSON.parse(this.$imageUrls.text() || "[]");
		imgUrls[this.latestPosition] = urlNormal;
		this._updateLatestPhotoPosition();
		this.$imageUrls.html(JSON.stringify(imgUrls));
	}

	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param
	 */
	initialize(options, docElement) {
		this.$docElement = docElement;
		this.allowedUploads = 12;
		this.pageType = options ? options.pageType : "";
		this.$imageUrls = $(docElement.find(".imgUrls"));
		//EPS setup
		this.epsData = $('#js-eps-data');
		this.uploadImageContainer = $('.upload-image-container');
		this.EPS = {};
		this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
		this.EPS.token = this.epsData.data('eps-token');
		this.EPS.url = this.epsData.data('eps-url');
		this.epsUpload = new EpsUpload(this.EPS);
		this.$postAdButton = $('#postAdBtn');
		this.imageCount = 0;
		this.latestPosition = 0;

		this.messageError = $('.error-message');
		this.messageModal = $('.message-modal');
		this.$errorModalClose = this.messageModal.find('#js-close-error-modal');
		this.$errorMessageTitle = $('#js-error-title');

		this.$imageUrls.on("click", () => {
			let imgUrls = JSON.parse(this.$imageUrls.text() || "[]");
			let validUrls = [];
			for (let img of imgUrls) {
				if (img) {
					validUrls.push(img);
				}
			}
			this.viewModel.updateImageUrls(validUrls);
		});
		this.$imageUpload = $($(docElement.find(".file-input-wrapper")).find('input[name="pic"]'));
		//listen for file uploads
		this.$imageUpload.on("change", (event) => {
			this.uploadImageShowSpinner();
			this.fileInputChange(event);
		});

		// If server has initial image to render
		this.$initialImages = JSON.parse($("#initialImages").text() || '{"sizeUrls": []}').sizeUrls;
		if (this.$initialImages.length > 0) {
			this.updatePhotoContainerLayout();
			this.$initialImages.forEach((imageUrl) => {
				let url = null;
				if (imageUrl.SMALL) {
					url = imageUrl.SMALL;
				} else if (imageUrl.MEDIUM) {
					url = imageUrl.MEDIUM;
				} else if (imageUrl.LARGE) {
					url = imageUrl.LARGE;
				}
				if (url) {
					this.updatePhotoDivBackgroundImg(url);
				}
			});
		}

		this.$errorModalButton = this.messageModal.find('.btn');
		this.$errorModalClose.click(() => {
			this.messageModal.toggleClass('hidden');
		});

		this.$errorModalButton.click(() => {
			this.messageModal.toggleClass('hidden');
			this.clickFileInput();
		});

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

		/**
		 * failure case for eps upload, in the initialize function to get arrow function this binding
		 * @param i
		 * @param epsError
		 * @private
		 */
		this._failure = (i, epsError) => {
			window.BOLT.trackEvents({"event": this.pageType + "PhotoFail"});
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
			// 1. Check Error
			if (response.indexOf('ERROR') !== -1) {
				console.error("EPS error!");
				return this._failure(i, response);
			}
			// 2. Try to extract the url and figure out if it looks like to be valid
			let url = this.epsUpload.extractURLClass(response);
			// 3. Any errors don't do anything after display error msg
			if (!url) {
				console.error("Failed to extract url class!");
				return this._failure(i, response);
			}
			// Use a high resolution image
			let normalUrl = this.epsUpload.convertThumbImgURL20(this.transformEpsUrl(url.normal));
			if (url.normal.toLowerCase().indexOf("https") < 0) {
				normalUrl = normalUrl.replace('http', 'https');
			}

			// 4.For the first time, update the photo layout
			if (this.latestPosition === 0) {
				this.updatePhotoContainerLayout();
			}
			this._uploadImageHideSpinner();

			// 5.If first image change or no image left after delete, call category recognition
			if (this.latestPosition === 0 && !this.getImageCount()) {
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

			// 6. Update image background url
			this.updatePhotoDivBackgroundImg(normalUrl);
			// 7. Enable post button when image upload success
			this.$postAdButton.toggleClass("disabled", false);
			window.BOLT.trackEvents({"event": this.pageType + "PhotoSuccess"});
		};
	}

	/**
	 * Find next position for image upload
	 */
	_updateLatestPhotoPosition() {
		let photoDiv = $(this.$docElement.find(this.getPhotoDivSelect()));
		for (let i=0; i<=photoDiv.length; i++) {
			if ($(photoDiv[i]).css("background-image") === "none") {
				this.latestPosition = i;
				break;
			}
		}
	}

	/**
	 * Change photo container layout when upload first image
	 */
	updatePhotoContainerLayout() {
		// Default Implementation is empty
	}

	/**
	 * Display spinner when uploading image
	 */
	uploadImageShowSpinner() {
		this._updateLatestPhotoPosition();
		let photoDiv = $(this.$docElement.find(this.getPhotoDivSelect()));
		let coverPhoto = $(photoDiv[this.latestPosition]);
		$(coverPhoto.find('.add-photo-text')).toggleClass('spinner',true);
	}

	/**
	 * Hidden spinner when uploaded image
	 * @private
	 */
	_uploadImageHideSpinner() {
		let photoDiv = $(this.$docElement.find(this.getPhotoDivSelect()));
		let coverPhoto = $(photoDiv[this.latestPosition]);
		$(coverPhoto.find('.add-photo-text')).toggleClass('spinner',false);
	}
	/**
	 * For multiple layout, show spinner accord to file count
	 * @private
	 */
	_uploadImageShowSpinnerWithFileSize(size) {
		let photoDiv = $(this.$docElement.find(this.getPhotoDivSelect()));
		for (let i=0, updated=0; updated < size && i <= photoDiv.length; i++) {
			if ($(photoDiv[i]).css("background-image") === "none") {
				$($(photoDiv[i]).find('.add-photo-text')).toggleClass('spinner',true);
				updated++;
			}
		}
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
		// Set how many image uploaded yet
		this.imageCount = this.getImageCount();
		this._uploadImageShowSpinnerWithFileSize(files.length);
		for (let i = 0; i < files.length; i++) {
			this.parseFile(files[i]);
		}
	}
	/**
	 * fires when the file input has a new image, triggers eps upload
	 * @param evt
	 */
	getImageCount() {
		// Set how many image uploaded yet
		let imgUrls = JSON.parse(this.$imageUrls.text() || "[]");
		let count = 0;
		imgUrls.forEach((img) => {
			if (img) {
				count++;
			}
		});
		return count;
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
			window.BOLT.trackEvents({"event": this.pageType + "PhotoBegin"});
			this.$imageUpload.click();
		}
	}

	/**
	 * reads the file in then kicks off the events for eps upload
	 * @param file
	 */
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
				// create image place holders
				this.imageCount++; // Update image to be upload count
				this.$postAdButton.toggleClass("disabled", true);
				this.uploadMessageClass.loadingMsg(this.imageCount - 1);
				this.prepareForImageUpload(this.imageCount - 1, file);
				this.$imageUpload.val('');
			} else {
				console.warn('No more than 12 images can be uploaded');
				$(".error-msg-wrapper").removeClass("hidden");
				$("#max-photo-msg").removeClass("hidden");
				$("#carousel-info-icon").removeClass("hidden");
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

	/**
	 * Register category change call back when first image get uploaded
	 * @param func
	 */
	setCategoryUpdateCallback(func) {
		this.categoryUpdateCallback = func;
	}

	setFormValid(isFormValid) {
		this.$postAdButton.toggleClass("disabled", !isFormValid || !this.getImageCount());
	}

}

module.exports = PhotoContainer;
