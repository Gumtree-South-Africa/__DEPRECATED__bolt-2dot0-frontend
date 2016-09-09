'use strict';

require("slick-carousel");
let EpsUpload = require('../../uploadImage/js/epsUpload').EpsUpload;
let UploadMessageClass = require('../../uploadImage/js/epsUpload').UploadMessageClass;
let uploadAd = require('../../uploadImage/js/uploadAd');
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");


/******* BEGIN EPS STUFF *******/
$.prototype.doesExist = function() {
	return $(this).length > 0;
};

let allowedUploads = 12;
let _this = this;

let resizeCarousel = () => {
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
};

let setCoverPhoto = (event) => {
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
};

// For each carousel item, set backgroundImage from data-image
let updateCarouselImages = () => {
	let cItems = document.querySelectorAll(".carousel-item[data-image]");

	[].forEach.call(cItems, (item) => {
		let url = item.getAttribute('data-image');
		item.style.backgroundImage = "url('" + url + "')";
	});
};


let createImgObj = (i, urlThumb, urlNormal) => {
	let currItem = $('.carousel-item[data-item="' + i + '"]');
	currItem.attr("data-image", urlNormal);
	currItem.on('click', setCoverPhoto);
	updateCarouselImages();

	// set cover photo if none found
	if ($('.cover-photo').hasClass('no-photo')) {
		$('.carousel-item:first').click();
	}
};


let removePendingImage = (index) => {
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
};

let _postAd = (urls, locationType) => {
	// default price to 0
	let inputPrice = parseFloat($("#price-input").val());
	let price = isNaN(inputPrice) ? 0 : inputPrice;

	let extraPayload = {
		locationType: locationType,
		title: $("#title-input").val(),
		price: {
			amount: price,
			currency: $('input[name="currency"]:checked').val()
		}
	};
	uploadAd.postAd(urls, (response) => {
		this.$postAdButton.removeClass('disabled');
		this.disableImageSelection = false;
		formChangeWarning.disable();
		this.epsUpload.handlePostResponse(this.$loginModal, this.$loginModalMask, response);
	}, (err) => {
		console.warn(err);
		this.$postAdButton.removeClass('disabled');
		this.disableImageSelection = false;
		this.uploadMessageClass.failMsg();
		formChangeWarning.enable();
	}, extraPayload);
};

let _failure = (i, epsError) => {
	let error = _this.epsUpload.extractEPSServerError(epsError);
	$(".carousel-item[data-item='" + i + "'] .spinner").toggleClass('hidden');

	this.uploadMessageClass.translateErrorCodes(i, error);
	removePendingImage(i);
};

let _success = (i, response) => {
	if (response.indexOf('ERROR') !== -1) {
		console.error("EPS error!");
		return _failure(i, response);
	}
	// try to extract the url and figure out if it looks like to be valid
	let url = this.epsUpload.extractURLClass(response);

	// any errors don't do anything after display error msg
	if (!url) {
		console.error("Failed to extract url class!");
		return _failure(i, response);
	}

	// add the image once EPS returns the uploaded image URL
	createImgObj(i, url.thumbImage, url.normal);
	$(".carousel-item[data-item='" + i + "'] .spinner").toggleClass('hidden');
	this.updateAddPhotoButton();

	resizeCarousel();
	removePendingImage(i);
};

let loadData = (i, file) => {
	this.epsUpload.uploadToEps(i, file, _success, _failure, () => {
		let xhr = new window.XMLHttpRequest();
		xhr.upload.addEventListener("progress", function(event) {
			let index = this.bCount;

			if (!event.lengthComputable) {
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
			loadData(i, resizedImageFile);
		};
	};
	this.epsUpload.prepareForImageUpload(i, file, loadData, onload);
};


let html5Upload = (uploadedFiles) => {
	// disable post while image uploads
	this.$postAdButton.addClass("disabled");

	if (this.imageCount !== allowedUploads) {
		// create image place holders
		this.imageCount++;
		this.uploadMessageClass.loadingMsg(this.imageCount - 1); //this.uploadMessageClass(upDone).fail()
		prepareForImageUpload(this.$loadedImages - 1, uploadedFiles);
	} else {
		if ($(".carousel-items").length === allowedUploads) {
			console.warn("Cannot upload more than 12 files!");
			$("#max-photo-msg").removeClass("hidden");
			$("#carousel-info-icon").removeClass("hidden");
			return;
		}
	}
	this.$imageUpload.val('');
};

Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
/******* END EPS STUFF *******/

let _slickAdd = () => {
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
	resizeCarousel();
};

let parseFile = (file) => {
	let reader = new FileReader();

	if (!this.epsUpload.isSupported(file.name)) {
		this.uploadMessageClass.invalidType(0);
		console.error("Invalid File Type");
		return;
	}

	reader.onloadend = () => {
		// Add new carousel item to carousel
		let totalItems = $(".carousel-item").length;

		if (totalItems < allowedUploads) {
			_slickAdd(totalItems);
			html5Upload(file);
		} else {
			console.warn('No more than 12 images can be uploaded');
		}
	};
	if (file) {
		reader.readAsDataURL(file);
	}
};

let hasImagesForUpload = () => {
	// add red border to photo carousel if no photos
	if ($('.carousel-item').length === 0) {
		window.BOLT.trackEvents({"event": "PostAdFreeFail"});
		$('.cover-photo').addClass('red-border');
		$('.photos-required-msg').removeClass('hidden');
		return false;
	}
	return true;
};

let preventDisabledButtonClick = (event) => {
	if (!hasImagesForUpload()) {
		this.$postAdButton.addClass('disabled');
	}

	if (this.$postAdButton.hasClass("disabled")) {
		event.preventDefault();
	} else {
		this.$postAdButton.addClass('disabled');
		this.disableImageSelection = true;
		let timeout = this.epsUpload.requestLocation((locationType) => {
			if (timeout) {
				clearTimeout(timeout);
			}
			let images = [];
			for (let i = 0; i < this.imageCount; i++) {
				let selectedImage = $(".carousel-item.selected[data-item='" + i + "']").data("image");
				let image = $(".carousel-item[data-item='" + i + "']").data("image");

				// if image is cover photo add to front of array, otherwise push
				if (selectedImage) {
					images.unshift(selectedImage);
				} else if (image) {
					images.push(image);
				}
			}
			_postAd(images, locationType);
		});
	}
};
/******* END SLICK STUFF *******/

this.clickFileInput = () => {
	if (!this.disableImageSelection) {
		// prevent re-opening of file selector
		this.disableImageSelection = true;
		setTimeout(() => {
			this.disableImageSelection = false;
		}, 3000);

		this.$imageUpload.click();
		window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
	}
};

let fileInputChange = (evt) => {
	this.disableImageSelection = false;
	if (evt.stopImmediatePropagation) {
		evt.stopImmediatePropagation();
	}

	if ($(".carousel-item").length === allowedUploads) {
		console.warn("Cannot upload more than 12 files!");
		$("#max-photo-msg").removeClass("hidden");
		$("#carousel-info-icon").removeClass("hidden");
		return;
	}

	// parse file(s)
	let files = evt.target.files;
	for (let i = 0; i < files.length; i++) {
		parseFile(files[i]);
	}
};

this._bindChangeListener = () => {
	this.$imageUpload = $("#desktopFileUpload");
	//listen for file uploads
	this.$imageUpload.on("change", fileInputChange);

	this.$inputClickArea = $('#input-click-area');
	//listen for 'add photos' carousel item click
	this.$inputClickArea.on('click', this.clickFileInput);
};

this.deleteCarouselItem = (event, toRemove) => {
	event.stopImmediatePropagation();

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

	this.updateAddPhotoButton();
	resizeCarousel();
};

this.updateAddPhotoButton = () => {
	let $addPhoto = $('.add-photo-item');
	let $userImages = $('.carousel-item');
	let $carousel = $('.add-photo-item, .carousel-item');
	let i =  $carousel.index($addPhoto);

	if ($userImages.length < 12) {
		this.$carousel.slick('slickRemove', i);
		this.$carousel.slick('slickAdd', this.addPhotoHtml, true);
		this._bindChangeListener();
	} else if ($addPhoto.length && $userImages.length === 12) {
		this.$carousel.slick('slickRemove', i);
	}

};

let initialize = (options) => {
	if (!options) {
		let images = JSON.parse($("#deferred-ad-images").text() || '[]');
		options = {
			slickOptions: {
				arrows: true,
				infinite: false,
				slidesToShow: 3,
				slidesToScroll: 3
			},
			showDeleteImageIcons: false,
			initialImages: images
		};
	}
	this.showDeleteImageIcons = options.showDeleteImageIcons;
	//EPS setup
	this.disableImageSelection = false;
	this.epsData = $('#js-eps-data');
	this.uploadImageContainer = $('.upload-image-container');
	this.EPS = {};
	this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
	this.EPS.token = this.epsData.data('eps-token');
	this.EPS.url = this.epsData.data('eps-url');
	this.epsUpload = new EpsUpload(this.EPS);
	this.isProgressEventSupport = this.epsUpload.isProgressEventSupported();

	this.$addPhotoItem = $('.add-photo-item');
	this.addPhotoHtml = this.$addPhotoItem.prop('outerHTML');
	this.$carousel = $('#photo-carousel');
	this.$loginModal = $('.login-modal');
	this.$loginModalMask = $('.login-modal-mask');
	this.pendingImages = [];
	this.$postAdButton = $('#postAdBtn');
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
		window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
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
				resizeCarousel();
			}
		}
	);

	// Slick setup
	this.$carousel.slick(options.slickOptions);

	this.$carousel.on('breakpoint', resizeCarousel);

	options.initialImages.forEach((image, i) => {
		let thumb = (image.LARGE) ? image.LARGE : image.SMALL || image;
		let totalItems = $(".carousel-item").length;
		if (totalItems < allowedUploads) {
			_slickAdd(totalItems);
		}
		createImgObj(i, thumb, thumb);
		$(".carousel-item[data-item='" + i + "'] .spinner").addClass('hidden');
	});

	// init carousel item images and heights
	updateCarouselImages();
	resizeCarousel();

	// Ignore button click if it's disabled
	this.$postAdButton.on('click', preventDisabledButtonClick);
	$("#postAdBtn .link-text").on("click", preventDisabledButtonClick);

	// When page resizes, redraw carousel items
	$(window).resize(resizeCarousel);

	// click handler for changing the ad cover photo
	$(".carousel-item").on('click', setCoverPhoto);

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
	$("#cover-photo").on('click', this.clickFileInput);

	// Listen for file drag and drop uploads
	let photoSwitcher = $(".photo-switcher");
	photoSwitcher.on('drop dragover', (event) => {
		// stop browser from opening dropped file(s)
		event.preventDefault();
		event.stopPropagation();

		// trigger change on file input to start upload flow
		let files = event.originalEvent.dataTransfer.files;
		fileInputChange({
			target: {
				files: files
			}
		});
	});
};

module.exports = {
	initialize
};



