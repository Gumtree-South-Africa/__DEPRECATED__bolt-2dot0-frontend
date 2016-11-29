'use strict';

require("slick-carousel");
let EpsUpload = require('../../uploadImage/js/epsUpload').EpsUpload;
let UploadMessageClass = require('../../uploadImage/js/epsUpload').UploadMessageClass;
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');

let isPhotoDivAndDraggable = function(target) {
	let id = $(target).attr('id');
	let url = $(target).css("background-image");
	return (id && id.indexOf('photo') !== -1 && url !== 'none') ;
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
		this.imageCount = 0;
		this.latestPosition = 0;

		this.messageError = $('.error-message');
		this.messageModal = $('.message-modal');
		this.$errorModalClose = this.messageModal.find('#js-close-error-modal');
		this.$errorMessageTitle = $('#js-error-title');

		$("#imgUrls").on("click", () => {
			let imgUrls = JSON.parse($("#imgUrls").text() || "[]");
			let validUrls = [];
			for (let img of imgUrls) {
				if (img) {
					validUrls.push(img);
				}
			}
			this.viewModel.updateImageUrls(validUrls);
		});

		// If server has initial image to render
		this.$initialImages = JSON.parse($("#initialImages").text() || '{"sizeUrls": []}').sizeUrls;
		if (this.$initialImages.length > 0) {
			this.latestPosition = 1;
			this._updatePhotoContainerLayout();
			//this._uploadImageShowSpinnerWithFileSize(this.$initialImages.length);
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
					this._updatePhotoDivBackgroundImg(url);
				}
			});
		}

		this.$errorModalButton = this.messageModal.find('.btn');
		this.$errorModalClose.click(() => {
			this.messageModal.toggleClass('hidden');
		});

		this.$imageUpload = $(".file-input-wrapper").find('input[name="pic"]');
		//listen for file uploads
		this.$imageUpload.on("change", (event) => {
			this._uploadImageShowSpinner();
			this.fileInputChange(event);
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

		// Clicking empty cover photo OR 'add photo' carousel item should open file selector
		$("#photo-0").on('click', () => {
			this.clickFileInput();
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
			let normalUrl = this.transformEpsUrl(url.normal);
			if (url.normal.toLowerCase().indexOf("https") < 0) {
				normalUrl = normalUrl.replace('http', 'https');
			}

			// 4.For the first time, update the photo layout
			if (this.latestPosition === 0) {
				this._updatePhotoContainerLayout();
				this.latestPosition++;
			}
			this._uploadImageHideSpinner();

			// 5.If first image change, call category recognition
			if (this.latestPosition === 1) {
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
			this._updatePhotoDivBackgroundImg(normalUrl);
			// 7. Enable post button when image upload success
			this.$postAdButton.toggleClass("disabled", false);
			window.BOLT.trackEvents({"event": "PostAdPhotoSuccess"});
		};
	}

	/**
	 * Find next position for image upload
	 */
	_updateLatestPhotoPosition() {
		// The image in single layout will replace the first image in multiple layout
		for (let i=1; i<=this.allowedUploads; i++) {
			if ($('#photo-' + i).css("background-image") === "none") {
				this.latestPosition = i;
				break;
			}
		}
	}

	/**
	 * Update photo container div image background
	 * @param urlNormal
	 * @param thumbUrl
	 * @private
	 */
	_updatePhotoDivBackgroundImg(urlNormal) {
		let coverPhoto = $('#photo-' + this.latestPosition);
		coverPhoto.css("background-image", "url('" + urlNormal + "')").attr("data-image", urlNormal).toggleClass('no-photo',false);
		let imgUrls = JSON.parse($("#imgUrls").text() || "[]");
		imgUrls[this.latestPosition] = urlNormal;
		this._updateLatestPhotoPosition();
		$("#imgUrls").html(JSON.stringify(imgUrls));
		$("#imgUrls").click();
	}
	/**
	 * Change photo container layout when upload first image
	 * @private
	 */
	_updatePhotoContainerLayout() {
		// 1.Using the first camera photo div as template
		let newDiv = $("#photo-0").clone();
		// 2.Adjust style for multiple photo laylout
		newDiv.removeClass("cover-photo-big").addClass("cover-photo-small").attr("draggable", "true");
		newDiv.find(".add-photo-text").css("font-size", "small");
		$(newDiv.find(".add-photo-text")).toggleClass('spinner',false);
		// 3.Hide the first camera photo div
		$("#photo-0").hide();
		$(".photo-limits").hide();
		// 4.Create multiple photo upload layout
		for (let j = 1; j <= this.allowedUploads; j++) {
			newDiv.attr("id", "photo-" + j);
			this._bindEventToNewPhotoUploadDiv(newDiv);
			$("#photo-0").parent().append(newDiv);
			newDiv=newDiv.clone();
		}
		$(".drag-reorder").toggleClass("hidden", false);
	}

	/**
	 * Bind event to later cloned new photo div
	 * @private
	 */
	_bindEventToNewPhotoUploadDiv(newDiv) {
		newDiv.on('click', () => {
			this.clickFileInput();
		});
		newDiv.find(".delete-wrapper").on('click', (e) => {
			e.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": "PostAdPhotoRemove"});
			let imageDiv = $(e.target.parentNode.parentNode);
			let urlNormal = imageDiv.attr("data-image");
			imageDiv.css("background-image", "").toggleClass("no-photo", true);

			if (this.getImageCount() === 0) {
				this.$postAdButton.toggleClass("disabled", true);
			}
			let imgUrls = JSON.parse($("#imgUrls").text() || "[]");
			let position = imgUrls.indexOf(urlNormal);
			if (position !== -1) {
				imgUrls[position] = null;
				$("#imgUrls").html(JSON.stringify(imgUrls));
				$("#imgUrls").click();
			}
		});

		/*
		* Drag and Reorder event start
		* */
		document.addEventListener("drag", function() {
		}, false);

		document.addEventListener("dragstart", function( event ) {
			if (!isPhotoDivAndDraggable(event.target)) {
				return;
			}
			if (event.dataTransfer) {
				event.dataTransfer.setData("text/plain", "Workaround for FireFox!");
			}
			// store a ref. on the dragged elem
			this.PhotoContainerDragged = event.target;
			// make it half transparent
			event.target.style.opacity = .5;
		}, false);

		document.addEventListener("dragend", function( event ) {
			if (!isPhotoDivAndDraggable(event.target)) {
				return;
			}
			// reset the transparency
			event.target.style.opacity = "";
		}, false);

		/* events fired on the drop targets */
		document.addEventListener("dragover", function( event ) {
			event.preventDefault();
		}, false);
		document.addEventListener("dragenter", function() {
		}, false);
		document.addEventListener("dragleave", function() {
		}, false);
		document.addEventListener("drop", function( event ) {
			if (!isPhotoDivAndDraggable(event.target)) {
				return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": "PostAdPhotoReorder"});

			// 1.Swap background
			let toBackgroundUrl = $(event.target).css("background-image");
			let fromBackgroundUrl = $(this.PhotoContainerDragged).css("background-image");
			$(event.target).css("background-image", fromBackgroundUrl);
			$(this.PhotoContainerDragged).css("background-image", toBackgroundUrl);

			// 2.Swap image array
			let imgUrls = JSON.parse($("#imgUrls").text() || "[]");
			let toImg = $(event.target).attr("data-image");
			let toIndex = imgUrls.indexOf(toImg);
			let fromImg = $(this.PhotoContainerDragged).attr("data-image");
			let fromIndex = imgUrls.indexOf(fromImg);
			imgUrls[toIndex] = fromImg;
			imgUrls[fromIndex] = toImg;
			$("#imgUrls").html(JSON.stringify(imgUrls));
			// 3.Trigger image array change event
			$("#imgUrls").click();
		}, false);

		/*
		 * Drag and Reorder event end
		 * */
	}

	/**
	 * Display spinner when uploading image
	 * @private
	 */
	_uploadImageShowSpinner() {
		this._updateLatestPhotoPosition();
		$($('#photo-' + this.latestPosition).find('.add-photo-text')).toggleClass('spinner',true);
	}

	/**
	 * Hidden spinner when uploaded image
	 * @private
	 */
	_uploadImageHideSpinner() {
		$($('#photo-' + this.latestPosition).find('.add-photo-text')).toggleClass('spinner',false);
	}
	/**
	 * For multiple layout, show spinner accord to file count
	 * @private
	 */
	_uploadImageShowSpinnerWithFileSize(size) {
		if (this.latestPosition === 0) {
			return;
		}
		for (let i=1, updated=0; updated < size && i <= this.allowedUploads; i++) {
			if ($('#photo-' + i).css("background-image") === "none") {
				$($('#photo-' + i).find('.add-photo-text')).toggleClass('spinner',true);
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
		let imgUrls = JSON.parse($("#imgUrls").text() || "[]");
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
			window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
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

module.exports = new PhotoContainer();
