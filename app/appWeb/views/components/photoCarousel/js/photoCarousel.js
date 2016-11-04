'use strict';

require("slick-carousel");
let EpsUpload = require('../../uploadImage/js/epsUpload').EpsUpload;
let UploadMessageClass = require('../../uploadImage/js/epsUpload').UploadMessageClass;

$.prototype.doesExist = function() {
	return $(this).length > 0;
};

Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

/**
 * Simple event emitter, which doesn't handle running context or concurrency.
 */
class SimpleEventEmitter {
	constructor() {
		this.handlers = [];
	}

	addHandler(handler) {
		this.handlers.push(handler);
	}

	trigger() {
		this.handlers.forEach(handler => handler.apply(null, arguments));
	}
}

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

class PhotoCarousel {
	constructor() {
		this.setupViewModel();
	}

	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param options
	 */
	initialize(options) {
		if (!options) {
			let images = JSON.parse($("#deferred-ad-images").text() || '[]');
			options = {
				slickOptions: {
					arrows: true,
					infinite: false,
					slidesToShow: 3,
					slidesToScroll: 3
				},
				showDeleteImageIcons: true,
				initialImages: images
			};
		}
		this.allowedUploads = 12;
		this.showDeleteImageIcons = options.showDeleteImageIcons;
		this.showImageTracking = options.showImageTracking;
		//EPS setup
		this.epsData = $('#js-eps-data');
		this.uploadImageContainer = $('.upload-image-container');
		this.EPS = {};
		this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
		this.EPS.token = this.epsData.data('eps-token');
		this.EPS.url = this.epsData.data('eps-url');
		this.epsUpload = new EpsUpload(this.EPS);
		this.$postAdButton = $('#postAdBtn');

		this.$addPhotoItem = $('.add-photo-item');
		this.addPhotoHtml = this.$addPhotoItem.prop('outerHTML');
		this.$carousel = $('#photo-carousel');
		this.pendingImages = [];
		this.$loadedImages = 0;
		this.imageCount = 0;

		this.messageError = $('.error-message');
		this.messageModal = $('.message-modal');
		this.$errorModalClose = this.messageModal.find('#js-close-error-modal');
		this.$errorMessageTitle = $('#js-error-title');
		this.$errorModalButton = this.messageModal.find('.btn');
		this.$errorModalClose.click(() => {
			this.messageModal.toggleClass('hidden');
		});

		this.$errorModalButton.click(() => {
			this.messageModal.toggleClass('hidden');
			this.$imageUpload.click();
			//window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
		});

		this._bindChangeListener();

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
				hideImage: (i) => {
					let toRemove = $(".carousel-item[data-item='" + i + "']");
					let $selector = $(".add-photo-item, .carousel-item");
					let index = $selector.index(toRemove);
					this.$carousel.slick('slickRemove', index);
					this.$imageUpload.val('');
					this.imageCount--;
					this.updateAddPhotoButton();
					this.resizeCarousel();

					this.refreshViewModel();
				}
			}
		);

		// Slick setup
		this.$carousel.slick(options.slickOptions);

		this.$carousel.on('breakpoint', () => {
			this.resizeCarousel();
		});

		options.initialImages.forEach((image, i) => {
			let thumb = (image.LARGE) ? image.LARGE : image.SMALL || image;
			let totalItems = $(".carousel-item").length;
			if (totalItems < this.allowedUploads) {
				this._slickAdd(totalItems);
			}
			this.createImgObj(i, thumb, thumb);
			$(".carousel-item[data-item='" + i + "'] .spinner").addClass('hidden');
		});

		// init carousel item images and heights
		this.updateCarouselImages();
		this.resizeCarousel();


		// When page resizes, redraw carousel items
		$(window).resize((evt) => {
			// on mobile device rotations this gets called slightly too early, before the dom has expanded
			setTimeout(() => {
				this.resizeCarousel(evt);
			}, 0);
		});

		// click handler for changing the ad cover photo
		$(".carousel-item").on('click', (e) => {
			this.setCoverPhoto(e);
		});

		// delete image, remove current cover photo from carousel
		$("#carousel-delete-wrapper").on('click', (evt) => {
			let toRemove = $(".carousel-item.selected");
			this.deleteCarouselItem(evt, toRemove);
		});

		$("#carousel-delete-item").on('click', (evt) => {
			let toRemove = $(event.target).closest('.carousel-item');
			this.deleteCarouselItem(evt, toRemove);
		});

		// Clicking empty cover photo OR 'add photo' carousel item should open file selector
		$("#cover-photo").on('click', () => {
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
			this.deleteCarouselItem(null, toRemove);
			this.removePendingImage(i);
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

			if (!this.showImageTracking) {
				window.BOLT.trackEvents({"event": "PostAdPhotoSuccess"});
			}

			// try to extract the url and figure out if it looks like to be valid
			let url = this.epsUpload.extractURLClass(response);

			// any errors don't do anything after display error msg
			if (!url) {
				console.error("Failed to extract url class!");
				return this._failure(i, response);
			}

			let normalUrl = this.transformEpsUrl(url.normal);
			let thumbUrl = this.transformEpsUrl(url.thumbImage);

			// add the image once EPS returns the uploaded image URL
			let secureNormalUrl;
			let secureThumbImageUrl;

			// for secure protocole and not non secure protocole
			if (url.normal.toLowerCase().indexOf("https") < 0) {
				secureNormalUrl = normalUrl.replace('http', 'https');
				secureThumbImageUrl = thumbUrl.replace('http', 'https');
				this.createImgObj(i, secureThumbImageUrl, secureNormalUrl);
			} else {
				this.createImgObj(i, thumbUrl, normalUrl);
			}

			$(".carousel-item[data-item='" + i + "'] .spinner").toggleClass('hidden');
			this.updateAddPhotoButton();

			this.resizeCarousel();
			this.removePendingImage(i);

			this.refreshViewModel();
		};

		this.refreshViewModel();
	}

	setupViewModel() {
		this.viewModel = new PhotoCarouselVM();
	}

	/**
	 * Refresh view model
	 */
	refreshViewModel() {
		let cItems = document.querySelectorAll(".carousel-item[data-image]");

		let newImageUrls = [].map.call(cItems, (item) => item.getAttribute('data-image'));
		this.viewModel.updateImageUrls(newImageUrls);
	}

	/**
	 * used to prepend the add photo button to the carousel after adding a new carousel item
	 */
	updateAddPhotoButton() {
		let $addPhoto = $('.add-photo-item');
		let $userImages = $('.carousel-item');
		let $carousel = $('.add-photo-item, .carousel-item');
		let i = $carousel.index($addPhoto);

		if ($userImages.length < 12) {
			this.$carousel.slick('slickRemove', i);
			this.$carousel.slick('slickAdd', this.addPhotoHtml, true);
			this._bindChangeListener();
		} else if ($addPhoto.length && $userImages.length === 12) {
			this.$carousel.slick('slickRemove', i);
		}
	}

	/**
	 * removes an item from the carousel
	 * @param event
	 * @param toRemove
	 */
	deleteCarouselItem(event, toRemove) {
		if (event) {
			event.stopImmediatePropagation();
		}

		// remove cover photo
		let coverPhoto = $("#cover-photo");
		coverPhoto.css("background-image", "");
		coverPhoto.addClass("no-photo");
		coverPhoto.attr("data-image", "");

		let index = $(".add-photo-item, .carousel-item").index(toRemove);
		this.$carousel.slick('slickRemove', index);

		// delete image from imageUploads
		if (this.imageCount === 0 || $('.carousel-item').length === 0) {
			this.$postAdButton.addClass("disabled");
		}

		// Set new cover photo, or trigger file selector on empty photo click
		let firstItem = $(".carousel-item:first");
		let selectedItem = $('.carousel-item.selected');
		// Just reclick the selected one or the first item to refresh the featured
		if (selectedItem.length > 0) {
			selectedItem.click();
		} else if (firstItem.length > 0) {
			firstItem.click();
		}

		this.imageCount--;
		this.updateAddPhotoButton();
		this.resizeCarousel();

		this.refreshViewModel();
	}

	/**
	 * rebinds the click and change events to trigger the file input
	 * @private
	 */
	_bindChangeListener() {
		this.$imageUpload = $("#desktopFileUpload");
		//listen for file uploads
		this.$imageUpload.on("change", (event) => {
			this.fileInputChange(event);
		});

		this.$inputClickArea = $('#input-click-area');
		//listen for 'add photos' carousel item click
		this.$inputClickArea.on('click', () => {
			this.clickFileInput();
		});
	}

	/**
	 * fires when the file input has a new image, triggers eps upload
	 * @param evt
	 */
	fileInputChange(evt) {
		if (evt.stopImmediatePropagation) {
			evt.stopImmediatePropagation();
		}

		if (!this.checkMaxPhotos()) {
			return;
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
		if (!this.checkMaxPhotos()) {
			return;
		}
		if (!this.disableImageSelection) {
			// prevent re-opening of file selector
			this.disableImageSelection = true;
			setTimeout(() => {
				this.disableImageSelection = false;
			}, 3000);

			this.$imageUpload.click();

			if (this.showImageTracking === undefined) {
				window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
			} else {
				window.BOLT.trackEvents({"event": "AddImageBegin", "eventLabel": "AddImageBegin"});
			}


		}
	}

	/**
	 * checks to see if the user is allowed to add more photos
	 * @returns {boolean}
	 */
	checkMaxPhotos() {
		if ($(".carousel-item").length === this.allowedUploads) {
			console.warn("Cannot upload more than 12 files!");
			$("#max-photo-msg").removeClass("hidden");
			$("#carousel-info-icon").removeClass("hidden");
			return false;
		}
		return true;
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
			// Add new carousel item to carousel
			let totalItems = $(".carousel-item").length;

			if (totalItems < this.allowedUploads) {
				this._slickAdd(totalItems);
				this.html5Upload(file);
			} else {
				console.warn('No more than 12 images can be uploaded');
			}
		};
		if (file) {
			reader.readAsDataURL(file);
		}
	}

	/**
	 * adds a photo to the carousel
	 * @private
	 */
	_slickAdd() {
		this.$carousel.slick('slickAdd',
			//Ternary for whether or not to show the blue X in the corner of each thumbnail
			(this.showDeleteImageIcons) ?
			'<div class="carousel-item" data-item="' + this.$loadedImages + '">' +
			`<div id="carousel-delete-item" class="delete-wrapper">
					<div class="icon-photo-close"></div>
					</div>` +
			'<div id="carousel-upload-spinner" class="spinner"></div>' +
			'</div>'
				: //Ternary else right here
			'<div class="carousel-item" data-item="' + this.$loadedImages + '">' +
			'<div id="carousel-upload-spinner" class="spinner"></div>' +
			'</div>'
			, true);

		// increment loaded count
		this.$loadedImages++;
		this.updateAddPhotoButton();

		// resize items
		this.resizeCarousel();
	}

	html5Upload(uploadedFiles) {
		// disable post while image uploads
		this.$postAdButton.addClass("disabled");

		if (this.imageCount !== this.allowedUploads) {
			// create image place holders
			this.imageCount++;
			this.uploadMessageClass.loadingMsg(this.imageCount - 1); //this.uploadMessageClass(upDone).fail()
			this.prepareForImageUpload(this.$loadedImages - 1, uploadedFiles);
		} else {
			if (!this.checkMaxPhotos()) {
				return;
			}
		}
		this.$imageUpload.val('');
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

	removePendingImage(index) {
		// onload complete, remove pending index from pendingImages array. Check if all complete
		let arrIndex = this.pendingImages.indexOf(index);
		if (arrIndex > -1) {
			this.pendingImages.splice(arrIndex, 1);
		}
		if (this.pendingImages.length === 0) {
			this.$postAdButton.removeClass("disabled");
			$('.cover-photo').removeClass('red-border');
			$('.photos-required-msg').addClass('hidden');
		}
	}

	createImgObj(i, urlThumb, urlNormal) {
		let currItem = $('.carousel-item[data-item="' + i + '"]');
		currItem.attr("data-image", urlNormal);
		currItem.on('click', (e) => {
			this.setCoverPhoto(e);
		});
		this.updateCarouselImages();

		// set cover photo if none found
		if ($('.cover-photo').hasClass('no-photo')) {
			$('.carousel-item:first').click();
		}
	}

	updateCarouselImages() {
		let cItems = document.querySelectorAll(".carousel-item[data-image]");

		[].forEach.call(cItems, (item) => {
			let url = item.getAttribute('data-image');
			item.style.backgroundImage = "url('" + url + "')";
		});
	}

	setCoverPhoto(event) {
		let data = $(event.target).data();
		if ($(event.target).hasClass('icon-photo-close')) {
			let coverPhoto = $("#carousel-delete-wrapper").find($(event.target));
			let toRemove = $(event.target).closest('.carousel-item');
			if (coverPhoto.length) {
				toRemove = $(".carousel-item.selected");
			}
			this.deleteCarouselItem(event, toRemove);
			return;
		}
		if (!data.image) {
			return;
		}
		let image = this.epsUpload.convertThumbImgURL20(data.image);
		let coverPhoto = $('.cover-photo');
		coverPhoto[0].style.backgroundImage = "url('" + image + "')";

		// remove no-photo class and click handler
		$("#cover-photo-wrapper").off('click');
		coverPhoto.removeClass("no-photo");

		// remove 'selected' class from other items and add to new target
		let cItems = document.querySelectorAll(".carousel-item");
		[].forEach.call(cItems, (item) => {
			$(item).removeClass('selected');
		});
		$(event.target).addClass("selected");
	}

	/**
	 * resizes the carousel items to be appropriate height/width
	 * also reapplies the background image style since slick clears inline styles
	 */
	resizeCarousel() {
		let $carouselImages = $('.add-photo-item, .carousel-item');
		let width = $carouselImages.width();
		let $carouselUserImages = $('.carousel-item');
		// set height of carousel items to be same as width (set by slick)
		$carouselUserImages.each((i, item) => {
			// Slick will sometimes remove the css applied to an item.
			let carouselItem = $(item);
			let image = carouselItem.data('image');
			if (image) {
				carouselItem.css('background-image', `url("${image}")`);
			}
		});
		//fix issue where images would sometimes be very small
		if (width > 10) {
			$carouselImages.each((i, item) => {
				$(item).css('height', width + 'px');
			});
			// vertical align arrows to new height
			$('.slick-arrow').css('top', width / 2 + 'px');
			$('.slick-prev').addClass("icon-back");
			$('.slick-next').addClass("icon-back");
		}
	}
}

module.exports = new PhotoCarousel();
