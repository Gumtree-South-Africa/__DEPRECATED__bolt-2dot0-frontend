'use strict';

require("slick-carousel");
let EpsUpload = require('../../uploadImage/js/epsUpload');
let uploadAd = require('../../uploadImage/js/uploadAd');
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");


/******* BEGIN EPS STUFF *******/
$.prototype.doesExist = function() {
	return $(this).length > 0;
};

const AD_STATES = {
	AD_CREATED: "AD_CREATED",
	AD_DEFERRED: "AD_DEFERRED"
};

let allowedUploads = 12;
let _this = this;

/**
 * @return {boolean}
 */
let IsSafariMUSupport = () => {
	// a work around for safari 5.1 browsers which has bug for fileList

	if ($.isSafari4Else5()) {
		let regExp = /Version\/(\d+\.\d+)/g;
		let safariVersions = ["5.0", "4.0"];
		let v = regExp.exec(navigator.userAgent);
		if ($.isArray(v)) {
			$.map(safariVersions, (ele) => {

				if ($.trim(ele) === $.trim(v[1])) {
					return true;
				}
			});
			return false;
		}
	}
};

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


let isProgressEventSupported = () => {
	try {
		let xhr = new XMLHttpRequest();

		if ('onprogress' in xhr) {
			return !($.isSafari() && !IsSafariMUSupport());
		} else {
			return false;
		}
	} catch (e) {
		return false;
	}
};


let ExtractURLClass = (url) => {
	// extract, url
	let normalImageURLZoom = this.epsUpload.getThumbImgURL(url);

	if (!normalImageURLZoom) {
		// not been able to find out a valid url
		console.error("not been able to find out a valid url");
		return;
	}

	// convert to _18.JPG format saved in backend
	normalImageURLZoom = this.epsUpload.convertThumbImgURL18(normalImageURLZoom);

	// convert to _14.JPG thumb format

	return {
		"thumbImage": this.epsUpload.convertThumbImgURL14(normalImageURLZoom), "normal": normalImageURLZoom
	};

};

let setCoverPhoto = (event) => {
	let data = $(event.target).data();
	if ($(event.target).hasClass('icon-photo-close')) {
		this.deleteCarouselItem(event);
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

let UploadMsgClass = {
	// remove carousel item after EPS failure
	removeCarouselItem: (i) => {
		let toRemove = $(".carousel-item[data-item='" + i + "']");
		let $selector = $(".add-photo-item, .carousel-item");
		let index = $selector.index(toRemove);
		this.$carousel.slick('slickRemove', index);
		this.$imageUpload.val('');
		this.imageCount--;
		this.updateAddPhotoButton();
		resizeCarousel();
	},
	showModal: () => {
		this.messageModal.removeClass('hidden');
	},
	successMsg: () => {
		this.messageError.html(this.messages.successMsg);
		window.BOLT.trackEvents({"event":"PostAdPhotoSuccess"});
	},
	failMsg: (i) => {
		window.BOLT.trackEvents({"event": "PostAdFreeFail"});
		this.messageError.html(this.messages.failMsg);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.showModal();
		if (Number.isInteger(i)) {
			UploadMsgClass.removeCarouselItem(i);
		}
	},
	loadingMsg: () => {
		this.messageError.html(this.messages.loadingMsg);
	},
	resizing: () => {
		this.messageError.html(this.messages.resizing);
		this.$errorMessageTitle.html(this.messages.error);
	},
	invalidSize: (i) => {
		this.messageError.html(this.messages.invalidSize);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.removeCarouselItem(i);
		UploadMsgClass.showModal();
	},
	invalidType: (i) => {
		this.messageError.html(this.messages.invalidType);
		this.$errorMessageTitle.html(this.messages.unsupportedFileTitle);
		UploadMsgClass.removeCarouselItem(i);
		UploadMsgClass.showModal();
	},
	invalidDimensions: (i) => {
		this.messageError.html(this.messages.invalidDimensions);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.removeCarouselItem(i);
		UploadMsgClass.showModal();
	},
	firewall: (i) => {
		this.messageError.html(this.messages.firewall);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.removeCarouselItem(i);
		UploadMsgClass.showModal();
	},
	colorspace: (i) => {
		this.messageError.html(this.messages.colorspace);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.removeCarouselItem(i);
		UploadMsgClass.showModal();
	},
	corrupt: (i) => {
		this.messageError.html(this.messages.corrupt);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.removeCarouselItem(i);
		UploadMsgClass.showModal();
	},
	pictureSrv: () => {
		this.messageError.html(this.messages.pictureSrv);
	},
	translateErrorCodes: function(i, error) {
		if (error === "FS002") {
			this.invalidDimensions(i);
		} else if (error === "FS001") {
			this.invalidSize(i);
		} else if (error === "FF001" || error === "FF002" || error === "SD015") {
			this.invalidType(i);
		} else if (error === "FC002") {
			this.colorspace(i);
		} else if (error === "SD001" || error === "SD013" || error === "ME100") {
			this.firewall(i);
		} else if (error === "SD005" || error === "SD007" || error === "SD009" || error === "SD019" || error === "SD020" || error === "SD021") {
			this.pictureSrv(i);
		} else if (error === "SD011" || error === "SD017" || error === "SD013") {
			this.corrupt(i);
		} else {
			this.failMsg(i);
		}
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

let _getCookie = (cname) => {
	let name = cname + "=";
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
};

let _postAd = (urls, locationType) => {
	let extraPayload = {
		locationType: locationType,
		title: $("#title-input").val(),
		price: {
			amount: parseFloat($("#price-input").val()),
			currency: $('input[name="currency"]:checked').val()
		}
	};
	uploadAd.postAd(urls, (response) => {
		this.$postAdButton.removeClass('disabled');
		this.disableImageSelection = false;
		formChangeWarning.disable();
		switch (response.state) {
			case AD_STATES.AD_CREATED:
				window.location.href = response.ad.vipLink;
				break;
			case AD_STATES.AD_DEFERRED:
				window.BOLT.trackEvents({ "event": "PostAdLoginModal", "p": {"t": "PostAdLoginModal"} });
				this.$loginModal.find('.email-login-btn a').attr('href', response.links.emailLogin);
				this.$loginModal.find('.register-link').attr('href', response.links.register);
				this.$loginModal.find('.facebook-button a').attr('href', response.links.facebookLogin);
				this.$loginModal.toggleClass('hidden');
				this.$loginModalMask.toggleClass('hidden');
				break;
			default:
				break;
		}
	}, (err) => {
		console.warn(err);
		this.$postAdButton.removeClass('disabled');
		this.disableImageSelection = false;
		UploadMsgClass.failMsg();
		formChangeWarning.enable();
	}, extraPayload);
};

let requestLocation = (callback) => {
	let timeout;
	if ("geolocation" in navigator && _getCookie('geoId') === '') {
		//Don't want to sit and wait forever in case geolocation isn't working
		timeout = setTimeout(callback, 20000);
		navigator.geolocation.getCurrentPosition((position) => {
				let lat = position.coords.latitude;
				let lng = position.coords.longitude;
				document.cookie = `geoId=${lat}ng${lng}`;
				callback('geoLocation');
			}, callback,
			{
				enableHighAccuracy: true,
				maximumAge: 30000,
				timeout: 27000
			});
	} else {
		callback('cookie');
	}
	return timeout;
};

let _failure = (i, epsError) => {
	let error = _this.epsUpload.extractEPSServerError(epsError);
	$(".carousel-item[data-item='" + i + "'] .spinner").toggleClass('hidden');

	UploadMsgClass.translateErrorCodes(i, error);
	removePendingImage(i);
};

let _success = (i, response) => {
	if (response.indexOf('ERROR') !== -1) {
		console.error("EPS error!");
		return _failure(i, response);
	}
	// try to extract the url and figure out if it looks like to be valid
	let url = ExtractURLClass(response);

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
				UploadMsgClass.failMsg(index);
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
	this.epsUpload.prepareForImageUpload(i, file, UploadMsgClass, loadData, onload);
};


let html5Upload = (uploadedFiles) => {
	// disable post while image uploads
	this.$postAdButton.addClass("disabled");

	if (this.imageCount !== allowedUploads) {
		// create image place holders
		this.imageCount++;
		UploadMsgClass.loadingMsg(this.imageCount - 1); //UploadMsgClass(upDone).fail()
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
		UploadMsgClass.invalidType(0);
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

let preventDisabledButtonClick = (event) => {
	if (this.$postAdButton.hasClass("disabled")) {
		event.preventDefault();
		// add red border to photo carousel if no photos
		if ($('.carousel-item').length === 0) {
			window.BOLT.trackEvents({"event": "PostAdFreeFail"});
			$('.cover-photo').addClass('red-border');
			$('.photos-required-msg').removeClass('hidden');
		}
	} else {
		this.$postAdButton.addClass('disabled');
		this.disableImageSelection = true;
		let timeout = requestLocation((locationType) => {
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

let fileInputChange = (evt) => {
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
};

this.deleteCarouselItem = (event) => {
	event.stopPropagation();

	// remove cover photo
	let coverPhoto = $("#cover-photo");
	coverPhoto.css("background-image", "");
	coverPhoto.addClass("no-photo");
	coverPhoto.attr("data-image", "");

	let toRemove = $(event.target).closest('.carousel-item');
	let index = $(".add-photo-item, .carousel-item").index(toRemove);
	this.$carousel.slick('slickRemove', index);

	// delete image from imageUploads
	if (this.imageCount === 0) {
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
	} else {
		$("#cover-photo-wrapper").on('click', () => {
			if (!this.disableImageSelection) {
				this.$imageUpload.click();
			}
		});
	}
	this.updateAddPhotoButton();
	resizeCarousel();
};

/******* BEGIN SLICK STUFF *******/
let deleteSelectedItem = (event) => {
	event.stopPropagation();

	// remove cover photo
	let coverPhoto = $("#cover-photo");
	coverPhoto.css("background-image", "");
	coverPhoto.addClass("no-photo");
	coverPhoto.attr("data-image", "");

	// delete carousel item
	let toRemove = $(".carousel-item.selected");
	let index = $(".add-photo-item, .carousel-item").index(toRemove);
	this.$carousel.slick('slickRemove', index);

	// delete image from imageUploads
	if (this.imageCount === 0) {
		this.$postAdButton.addClass("disabled");
	}

	// Set new cover photo, or trigger file selector on empty photo click
	let firstItem = $(".carousel-item:first");
	if (firstItem.length > 0) {
		firstItem.click();
	} else {
		$("#cover-photo-wrapper").on('click', () => {
			if (!this.disableImageSelection) {
				this.$imageUpload.click();
			}
		});
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
		options = {
			slickOptions: {
				arrows: true,
				infinite: false,
				slidesToShow: 3,
				slidesToScroll: 3
			},
			showDeleteImageIcons: false,
			initialImages: []
		};
	}
	this.showDeleteImageIcons = options.showDeleteImageIcons;
	//EPS setup
	this.disableImageSelection = false;
	this.epsData = $('#js-eps-data');
	this.uploadImageContainer = $('.upload-image-container');
	this.isProgressEventSupport = isProgressEventSupported();
	this.EPS = {};
	this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
	this.EPS.token = this.epsData.data('eps-token');
	this.EPS.url = this.epsData.data('eps-url');
	this.epsUpload = new EpsUpload(this.EPS);

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

	//i18n strings
	this.messages = {
		successMsg: this.epsData.data('successmsg'),
		failMsg: this.epsData.data('failmsg'),
		loadingMsg: this.epsData.data('loadingmsg'),
		resizing: this.epsData.data('resizing'),
		invalidSize: this.epsData.data('invalidsize'),
		invalidType: this.epsData.data('invalidtype'),
		invalidDimensions: this.epsData.data('invaliddimensions'),
		firewall: this.epsData.data('firewall'),
		colorspace: this.epsData.data('colorspace'),
		corrupt: this.epsData.data('corrupt'),
		pictureSrv: this.epsData.data('picturesrv'),
		error: this.epsData.data('error'),
		unsupportedFileTitle: this.epsData.data('unsupported-file-title')
	};


	// Slick setup
	this.$carousel.slick(options.slickOptions);

	this.$carousel.on('breakpoint', resizeCarousel);

	options.initialImages.forEach((image, i) => {
		let thumb = (image.LARGE) ? image.LARGE : image.SMALL;
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
	$("#carousel-delete-wrapper").on('click', deleteSelectedItem);
	$("#carousel-delete-item").on('click', (evt) => {
		this.deleteCarouselItem(evt);
	});

	// Clicking empty cover photo should open file selector
	$("#cover-photo").on('click', () => {
		if (!this.disableImageSelection) {
			this.$imageUpload.click();
		}
	});

	this.$imageUpload.on('click', (e) => {
		if (this.disableImageSelection) {
			e.preventDefault();
		}
		window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
	});

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



