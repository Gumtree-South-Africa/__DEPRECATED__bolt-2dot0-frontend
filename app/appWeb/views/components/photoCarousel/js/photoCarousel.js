'use strict';

require("slick-carousel");
let $ = require('jquery');
let EpsUpload = require('../../uploadImage/js/epsUpload');
let uploadAd = require('../../uploadImage/js/uploadAd');


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

let isNumber = (o) => {
	return typeof o === 'number' && isFinite(o);
};

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
	let coverPhoto = $('.cover-photo');
	coverPhoto[0].style.backgroundImage = "url('" + data.image + "')";

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

//todo: handles all the image uploads
let imageUploads = (() => {

	let images = [],
		urls = [];

	return {
		add: (l) => {

			let total = images.length;
			if (total > allowedUploads - 1) {
				return false;
			}
			for (let i = total; i < l + total; i++) {
				images.push(i);
			}
		},
		remove: (i) => {
			if (isNumber(i)) {
				images.pop();
				urls.remove(i);
			}
		},

		addFromImageUrls: (urlThumbArray, urlArray) => {
			for (let i = 0; i < urlArray.length; i++) {
				images.push(i);
			}
			return true;
		},

		count: () => {
			return images.length;
		}, setURL: (i, u) => {
			urls.push(u);
		}, getURL: (i) => {
			return urls[i];
		}, addDuringPreview: (i) => {
			images.push(i);
		}
	};
})();

//TODO: fix this for the desktop carousel
let UploadMsgClass = {
	// remove carousel item after EPS failure
	removeCarouselItem: (i) => {
		let toRemove = $(".carousel-item[data-item='" + i + "']");
		let index = $(".carousel-item").index(toRemove);
		this.$carousel.slick('slickRemove', index);

		this.$imageUpload.val('');
		imageUploads.remove(i);
	},
	showModal: () => {
		this.messageModal.removeClass('hidden');
	},
	successMsg: () => {
		this.messageError.html(this.messages.successMsg);
	},
	failMsg: (i) => {
		this.messageError.html(this.messages.failMsg);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.showModal();
		UploadMsgClass.removeCarouselItem(i);
		if (i !== undefined) {
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
		switch (response.state) {
			case AD_STATES.AD_CREATED:
				window.location.href = response.ad.vipLink;
				window.BOLT.trackEvents({ "event": "PostAdFreeSuccess", "p": {"t": "PostAdFreeSuccess"} });
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

let _success = (i, response) => {
	// try to extract the url and figure out if it looks like to be valid
	let url = ExtractURLClass(response);

	// any errors don't do anything after display error msg
	if (!url) {
		let error = this.epsUpload.extractEPSServerError(response);
		UploadMsgClass.translateErrorCodes(i, error);
		console.error("Failed to extract url class!");
		console.error(error);
		return;
	}

	// add the image once EPS returns the uploaded image URL
	createImgObj(i, url.thumbImage, url.normal);
	$(".carousel-item[data-item='" + i + "'] .spinner").toggleClass('hidden');

	UploadMsgClass.successMsg(i);
	removePendingImage(i);
};

let _failure = (i, epsError) => {
	let error = _this.epsUpload.extractEPSServerError(epsError);
	$(".carousel-item[data-item='" + i + "'] .spinner").toggleClass('hidden');

	UploadMsgClass.translateErrorCodes(i, error);
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

//TODO: here minus a few dom references
let prepareForImageUpload = (i, file) => {
	let onload = (thisFile) => {
		return function() {
			let resizedImageFile = _this.epsUpload.scaleAndCropImage(this, thisFile.type);
			loadData(i, resizedImageFile);
		};
	};
	this.epsUpload.prepareForImageUpload(i, file, UploadMsgClass, imageUploads, loadData, onload);
};


//TODO: here
let html5Upload = (evt) => {
	// disable post while image uploads
	this.$postAdButton.addClass("disabled");

	// drag and drop
	let uploadedFiles = evt.target.files || evt.dataTransfer.files,
		totalFiles = uploadedFiles.length,
		uploadCount = imageUploads.count();

	// if user
	if (imageUploads.count() !== allowedUploads && totalFiles === 1) {
		// create image place holders
		imageUploads.add(totalFiles);
		UploadMsgClass.loadingMsg(imageUploads.count() - 1); //UploadMsgClass(upDone).fail()
		prepareForImageUpload(imageUploads.count() - 1, uploadedFiles[0]);
	} else {
		if ($(".carousel-items").length === allowedUploads) {
			console.warn("Cannot upload more than 12 files!");
			$("#max-photo-msg").removeClass("hidden");
			$("#carousel-info-icon").removeClass("hidden");
			return;
		}
		// create image place holders
		let currTotal = imageUploads.count();

		if (currTotal === 0) {
			if (totalFiles > allowedUploads) {
				imageUploads.add(allowedUploads);
			} else {
				imageUploads.add(totalFiles);
			}

		} else if (currTotal > 0 && currTotal <= allowedUploads) {
			let emptyCells = allowedUploads - currTotal;

			if (totalFiles < emptyCells) {
				imageUploads.add(totalFiles);
			} else {
				imageUploads.add(emptyCells);
			}
		}

		for (let i = 0; i < uploadedFiles.length; i++) {
			let itemCount = $(".carousel-item").length;
			if (itemCount >= allowedUploads) {
				console.warn("Cannot upload more than 12 files!");
				$("#max-photo-msg").removeClass("hidden");
				$("#carousel-info-icon").removeClass("hidden");
				return;
			}
			this.pendingImages.push(uploadCount);

			let file = uploadedFiles[i];
			UploadMsgClass.loadingMsg(uploadCount);
			prepareForImageUpload(uploadCount, file);
			uploadCount = uploadCount + 1;

		} // end for
	}
};

Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
/******* END EPS STUFF *******/

/******* BEGIN SLICK STUFF *******/
let resizeCarousel = () => {
	let width = $('.add-photo-item, .carousel-item').width();
	//fix issue where images would sometimes be very small
	if (width > 10) {
		// set height of carousel items to be same as width (set by slick)
		$('.add-photo-item, .carousel-item').css({'height': width + 'px'});

		// vertical align arrows to new height
		let arrowTop = width / 2 - 3;
		$('.slick-arrow').css({'top': arrowTop + 'px'});
		$('.slick-prev').addClass("icon-back");
		$('.slick-next').addClass("icon-back");
	}
};

let deleteSelectedItem = (event) => {
	event.stopPropagation();

	// remove cover photo
	let coverPhoto = $("#cover-photo");
	coverPhoto.css("background-image", "");
	coverPhoto.addClass("no-photo");
	coverPhoto.attr("data-image", "");

	// delete carousel item
	let toRemove = $(".carousel-item.selected");
	let index = $(".carousel-item").index(toRemove);
	this.$carousel.slick('slickRemove', index);

	// delete image from imageUploads
	if (imageUploads.count() === 0) {
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
			
			window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
		});
	}
	resizeCarousel();
};

let parseFile = (file) => {
	let reader = new FileReader();

	//TODO - check file is supported
	if (!this.epsUpload.isSupported(file.name)) {
		UploadMsgClass.invalidType(0);
		console.error("Invalid File Type");
		return;
	}

	reader.onloadend = () => {
		// Add new carousel item to carousel
		let totalItems = $(".carousel-item").length;

		if (totalItems < allowedUploads) {
			this.$carousel.slick('slickAdd',
				'<div class="carousel-item" data-item="' + this.$loadedImages + '">' +
				'<div id="carousel-upload-spinner" class="spinner"></div>' +
				'</div>', totalItems, true);
			this.$carousel.slick('slickGoTo', totalItems, false);

			// increment loaded count
			this.$loadedImages++;

			// resize items
			resizeCarousel();
		}
	};
	if (file) {
		reader.readAsDataURL(file);
	}
};

let preventDisabledButtonClick = (event) => {
	if (this.$postAdButton.hasClass("disabled")) {
		window.BOLT.trackEvents({"event": "PostAdFreeFail"});
		event.preventDefault();
		// add red border to photo carousel if no photos
		if ($('.carousel-item').length === 0) {
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
			for (let i = 0; i < imageUploads.count(); i++) {
				let image = $(".carousel-item[data-item='" + i + "']").data("image");
				if (image) {
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

	html5Upload(evt);
};

let initialize = () => {
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

	this.$carousel = $('#photo-carousel');
	this.$loginModal = $('.login-modal');
	this.$loginModalMask = $('.login-modal-mask');
	this.pendingImages = [];
	this.$postAdButton = $('#postAdBtn');
	this.$loadedImages = 0;

	//TODO: multiple files
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

	this.$imageUpload = $("#desktopFileUpload");

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

	//listen for file uploads
	this.$imageUpload.on("change", fileInputChange);

	// Slick setup
	this.$carousel.slick({
		arrows: true,
		infinite: false,
		slidesToShow: 3,
		slidesToScroll: 3
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

	// Clicking empty cover photo should open file selector
	$("#cover-photo-wrapper").on('click', () => {
		
		if (!this.disableImageSelection) {
			this.$imageUpload.click();
		}
		window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
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



