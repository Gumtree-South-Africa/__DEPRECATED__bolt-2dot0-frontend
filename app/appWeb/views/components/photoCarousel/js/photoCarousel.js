'use strict';

require("slick-carousel");
let $ = require('jquery');
let ImageHelper = require('../../uploadImage/js/imageHelper');
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
	let normalImageURLZoom = this.imageHelper.getThumbImgURL(url);

	if (!normalImageURLZoom) {
		// not been able to find out a valid url
		console.error("not been able to find out a valid url");
		return;
	}

	// convert to _18.JPG format saved in backend
	normalImageURLZoom = this.imageHelper.convertThumbImgURL18(normalImageURLZoom);

	// convert to _14.JPG thumb format

	return {
		"thumbImage": this.imageHelper.convertThumbImgURL14(normalImageURLZoom), "normal": normalImageURLZoom
	};

};


let setCoverPhoto = (event) => {
	let data = $(event.target).data();
	let coverPhoto = $('.cover-photo');
	coverPhoto[0].style.backgroundImage = "url('" + data.image + "')";

	// remove no-photo class and click handler
	$(".photo-wrapper").off('click');
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
	$(".carousel-item.item-" + i).attr("data-image", urlNormal);
	$('.carousel-item.item-' + i).on('click', setCoverPhoto);
	$('.carousel-item.item-' + i + ' .spinner').toggleClass("hidden");
	updateCarouselImages();
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
		$(".carousel-item.item-" + i).remove();
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
		$("#postAdBtn").removeClass("disabled");
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
	uploadAd.postAd(urls, (response) => {
		this.$postAdButton.removeClass('disabled');
		this.disableImageSelection = false;
		switch (response.state) {
			case AD_STATES.AD_CREATED:
				window.location.href = response.ad.vipLink;
				break;
			case AD_STATES.AD_DEFERRED:
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
		// this.$uploadSpinner.toggleClass('hidden');
		// this.$uploadProgress.toggleClass('hidden');
		UploadMsgClass.failMsg();
	}, {
		locationType: locationType
	});
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

let _success = function(i, response) {
	let url;

	// try to extract the url and figure out if it looks like to be valid
	url = ExtractURLClass(response);

	let urlClass = ExtractURLClass(response);

	// any errors don't do anything after display error msg
	if (!urlClass) {
		let error = _this.imageHelper.extractEPSServerError(response);
		UploadMsgClass.translateErrorCodes(i, error);
		console.error("Failed to extract url class!");
		console.error(error);
		return;
	}

	// add the image once EPS returns the uploaded image URL
	createImgObj(i, url.thumbImage, url.normal);

	_this.$uploadSpinner.toggleClass('hidden');
	UploadMsgClass.successMsg(i);

	removePendingImage(i);
};

let _failure = (i, epsError) => {
	let error = _this.imageHelper.extractEPSServerError(epsError);
	this.$uploadSpinner.toggleClass('hidden');
	UploadMsgClass.translateErrorCodes(i, error);
	removePendingImage(i);
};

let loadData = (i, file) => {
	let formData = new FormData();
	// direct upload via EPS proxy
	if (!this.EPS.IsEbayDirectUL) {
		formData.append("s", "1C5000");
		formData.append("r", "0");
		formData.append("pltfrm", "bolt");
	} else {
		// direct upload to zoom
		formData.append("s", "Standard");
		//formData.append("wm", "USER,ICON" );
		formData.append("aXRequest", "2");
	}

	formData.append("v", "2");
	formData.append("b", "18");
	formData.append("n", "g");
	formData.append("a", this.EPS.token);

	formData.append("u", file);
	formData.append("rqt", $.now());
	formData.append("rqis", file.size);

	$.ajax({
		xhr: () => {
			let xhr = new window.XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(event) {
				let index = this.bCount;

				if (event.lengthComputable) {
					let percent = event.loaded / event.total;

					_this.imageProgress.attr('value', percent * 100);
				} else {
					UploadMsgClass.failMsg(index);
				}
			}, false);
			return xhr;
		},
		type: 'POST',
		contentType: false,
		processData: false,
		url: this.EPS.url,
		data: formData,
		success: (response) => {
			_success(i, response);
		},
		error: (err) => {
			_failure(i, err);
		}
	});
};

//TODO: here minus a few dom references
let prepareForImageUpload = (i, file) => {

	let mediaType = this.imageHelper.isSupported(file.name);

	if (!mediaType) {
		UploadMsgClass.translateErrorCodes(i, "FF001"); // invalid file type
		console.error("prepareForImageUpload - Invalid file type");
		return;
	}

	let reader = null;

	let img = new Image();

	if (window.FileReader) {
		UploadMsgClass.resizing(i);

		reader = new FileReader();

		reader.onload = (function(image, thisFile) {

			return function(e) {
				let dataUrl = e.target.result;


				image.onload = function() {
					let resizedImageFile = _this.imageHelper.scaleAndCropImage(this, thisFile.type);
					loadData(i, resizedImageFile);
				};

				window.URL = window.URL || window.webkitURL || false;
				image.src = URL.createObjectURL(thisFile);//window.URL.createObjectURL(blob);

				if (thisFile.type === 'image/jpeg') {
					let binaryFile = _this.imageHelper.convertToBinaryFile(dataUrl);
					image.exifData = _this.imageHelper.findEXIFinJPEG(binaryFile);
				}

				imageUploads.setURL(i, image.src);
				UploadMsgClass.loadingMsg(i);

			};
		})(img, file);

		reader.readAsDataURL(file);
	} else {
		window.URL = window.URL || window.webkitURL || false;
		let imageUrl = URL.createObjectURL(file);
		img.onload = () => {
			let resizedImageFile = this.imageHelper.scaleAndCropImage(this, file.type);
			loadData(i, resizedImageFile);
		};
		img.src = imageUrl;
	}
};


//TODO: here
let html5Upload = (evt) => {
	// disable post while image uploads
	$("#postAdBtn").addClass("disabled");

	// drag and drop
	let uploadedFiles = evt.target.files || evt.dataTransfer.files;
	let totalFiles = uploadedFiles.length, prvCount = imageUploads.count();

	// if user
	if (imageUploads.count() !== allowedUploads && totalFiles === 1) {
		// create image place holders
		imageUploads.add(totalFiles);
		UploadMsgClass.loadingMsg(imageUploads.count() - 1); //UploadMsgClass(upDone).fail()
		prepareForImageUpload(imageUploads.count() - 1, uploadedFiles[0]);
	} else {

		if (prvCount === allowedUploads) {
			console.error("html5Upload - Max uploads reached");
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
			this.pendingImages.push(prvCount);

			let file = uploadedFiles[i];
			if (prvCount === allowedUploads) {
				console.error("Max uploads reached");
				return;
			}
			UploadMsgClass.loadingMsg(prvCount);
			prepareForImageUpload(prvCount, file);
			prvCount = prvCount + 1;

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
let deleteSelectedItem = (event) => {
	event.stopPropagation();

	// remove cover photo
	let coverPhoto = $(".cover-photo");
	coverPhoto.css("background-image", "");
	coverPhoto.addClass("no-photo");
	coverPhoto.attr("data-image", "");

	// delete carousel item
	let toRemove = $(".carousel-item.selected");
	let index = $(".carousel-item").index(toRemove);
	$("#photo-carousel").slick('slickRemove', index);

	// delete image from imageUploads
	imageUploads.remove(index);
	if (imageUploads.count() === 0) {
		$("#postAdBtn").addClass("disabled");
	}

	// Set new cover photo, or trigger file selector on empty photo click
	let firstItem = $(".carousel-item:first");
	if (firstItem.length > 0) {
		firstItem.click();
	} else {
		$(".photo-wrapper").on('click', () => {
			if (!this.disableImageSelection) {
				$(".add-photo-item #desktopFileUpload").click();
			}
		});
	}
};

let resizeCarousel = () => {
	let width = $('.add-photo-item, .carousel-item').width();
	//fix issue where images would sometimes be very small
	if (width > 10) {
		// set height of carousel items to be same as width (set by slick)
		$('.add-photo-item, .carousel-item').css({'height': width + 'px'});

		// vertical align arrows to new height
		$('.slick-arrow').css({'top': width / 2 + 'px'});
	}
};

let parseFile = (file) => {
	let reader = new FileReader();

	//TODO - check file is supported
	if (!this.imageHelper.isSupported(file.name)) {
		UploadMsgClass.invalidType(0);
		console.error("Invalid File Type");
		return;
	}

	reader.onloadend = () => {
		// Add new carousel item to carousel
		let items = $(".carousel-item").length;
		$('#photo-carousel').slick('slickAdd',
			'<div class="carousel-item item-' + items + '">' +
			'<div id="$carousel-upload-spinner" class="spinner"></div>' +
			'</div>', 0, true);
		$('#photo-carousel').slick('slickGoTo', 0, false);

		// resize items
		resizeCarousel();
	};
	if (file) {
		reader.readAsDataURL(file);
	}
};

let preventDisabledButtonClick = (event) => {
	if (this.$postAdButton.hasClass("disabled")) {
		event.preventDefault();
	} else {
		this.$postAdButton.addClass('disabled');
		this.disableImageSelection = true;
		let timeout = requestLocation((locationType) => {
			if (timeout) {
				clearTimeout(timeout);
			}
			let images = [];
			for (let i = 0; i < imageUploads.count(); i++) {
				let image = $(".carousel-item.item-" + i).data("image");
				images.push(image);
			}
			_postAd(images, locationType);
		});
	}
};
/******* END SLICK STUFF *******/

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
	this.imageHelper = new ImageHelper(this.EPS);

	this.$loginModal = $('.login-modal');
	this.$loginModalMask = $('.login-modal-mask');
	this.pendingImages = [];
	this.$uploadSpinner = this.uploadImageContainer.find('#carousel-upload-spinner');
	this.$postAdButton = $('#postAdBtn');

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
	$('#photo-carousel #desktopFileUpload').on("change", (evt) => {
		evt.stopImmediatePropagation();

		if (imageUploads.count() === allowedUploads) {
			//TODO - give message this UI
			console.error("Cannot upload more than 12 files!");
			return;
		}

		// parse file(s)
		let files = evt.target.files;
		for (let i = 0; i < files.length; i++) {
			parseFile(files[i]);
		}

		// TODO - EPS stuff
		html5Upload(evt);
	});

	// Slick setup
	$("#photo-carousel").slick({
		arrows: true,
		infinite: false,
		slidesToShow: 3,
		slidesToScroll: 3
	});

	// init carousel item images and heights
	updateCarouselImages();
	resizeCarousel();

	// Ignore button click if it's disabled
	$("#postAdBtn").on('click', preventDisabledButtonClick);
	$("#postAdBtn .link-text").on("click", preventDisabledButtonClick);

	// When page resizes, redraw carousel items
	$(window).resize(resizeCarousel);

	// click handler for changing the ad cover photo
	$(".carousel-item").on('click', setCoverPhoto);

	// delete image, remove current cover photo from carousel
	$(".delete-wrapper").on('click', deleteSelectedItem);

	// Clicking empty cover photo should open file selector
	$(".photo-wrapper").on('click', () => {
		if (!this.disableImageSelection) {
			$(".add-photo-item #desktopFileUpload").click();
		}
	});

	$('#desktopFileUpload').on('click', (e) => {
		if (this.disableImageSelection) {
			e.preventDefault();
		}
	});
};

module.exports = {
	initialize
};



