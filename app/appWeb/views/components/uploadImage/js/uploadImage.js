'use strict';

let EpsUpload = require('./epsUpload.js');
let uploadAd = require('./uploadAd.js');
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");

$.prototype.doesExist = function() {
	return $(this).length > 0;
};

const AD_STATES = {
	AD_CREATED: "AD_CREATED",
	AD_DEFERRED: "AD_DEFERRED"
};

let _this = this;

let allowedUploads = 4;

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
		return;
	}

	// convert to _18.JPG format saved in backend
	normalImageURLZoom = this.epsUpload.convertThumbImgURL18(normalImageURLZoom);

	return {
		"thumbImage": this.epsUpload.convertThumbImgURL14(normalImageURLZoom), "normal": normalImageURLZoom
	};

};


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
			return true;
		},

		remove: (i) => {
			if (isNumber(i)) {
				images.pop();
				urls.remove(i);
			}
			this.resetThumbDOM();
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

let UploadMsgClass = {
	hideImage: () => {
		this.imageHolder.css("background-image", `url("")`);
		this.uploadPhotoText.toggleClass('hidden');
		this.$imageUpload.val('');
		this.inputDisabled = false;
		this.$uploadSpinner.addClass('hidden');
		this.$uploadProgress.addClass('hidden');
	},
	showModal: () => {
		this.messageModal.toggleClass('hidden');
	},
	successMsg: () => {
		this.messageError.html(this.messages.successMsg);
	},
	failMsg: () => {
		this.messageError.html(this.messages.failMsg);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.showModal();
		UploadMsgClass.hideImage();
	},
	loadingMsg: () => {
		this.messageError.html(this.messages.loadingMsg);
	},
	resizing: () => {
		this.messageError.html(this.messages.resizing);
		this.$errorMessageTitle.html(this.messages.error);
	},
	invalidSize: () => {
		this.messageError.html(this.messages.invalidSize);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideImage();
		UploadMsgClass.showModal();
	},
	invalidType: () => {
		this.messageError.html(this.messages.invalidType);
		this.$errorMessageTitle.html(this.messages.unsupportedFileTitle);
		UploadMsgClass.hideImage();
		UploadMsgClass.showModal();
	},
	invalidDimensions: () => {
		this.messageError.html(this.messages.invalidDimensions);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideImage();
		UploadMsgClass.showModal();
	},
	firewall: () => {
		this.messageError.html(this.messages.firewall);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideImage();
		UploadMsgClass.showModal();
	},
	colorspace: () => {
		this.messageError.html(this.messages.colorspace);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideImage();
		UploadMsgClass.showModal();
	},
	corrupt: () => {
		this.messageError.html(this.messages.corrupt);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideImage();
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
			this.failMsg();
		}
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

let _postAd = (url, locationType) => {
	uploadAd.postAd([url], (response) => {
		this.$uploadSpinner.toggleClass('hidden');
		this.$uploadProgress.toggleClass('hidden');
		this.$uploadProgress.html("0%");
		this.inputDisabled = false;
		formChangeWarning.disable();
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
		this.$uploadSpinner.toggleClass('hidden');
		this.$uploadProgress.toggleClass('hidden');
		formChangeWarning.enable();
		UploadMsgClass.failMsg(0);
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
				callback('geoLocation', timeout);
			}, callback,
			{
				enableHighAccuracy: true,
				maximumAge: 30000,
				timeout: 27000
			});
	} else {
		callback('cookie', timeout);
	}
};

let _success = (i, response) => {
	let url = ExtractURLClass(response);

	if (!url) {
		let error = this.epsUpload.extractEPSServerError(response);
		UploadMsgClass.translateErrorCodes(0, error);
		return;
	}

	if (this.isMobile) {
		this.imageHolder.css("background-image", `url("${url.normal}")`);
		requestLocation((locationType, timeout) => {
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
	UploadMsgClass.translateErrorCodes(0, error);
	UploadMsgClass.failMsg(0);
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
			let blobReader = new FileReader();
			blobReader.readAsDataURL(resizedImageFile);
			blobReader.onloadend = () => {
				_this.imageHolder.css('background-image', `url('${blobReader.result}')`);
			};
			loadData(i, resizedImageFile);
		};
	};

	this.epsUpload.prepareForImageUpload(i, file, UploadMsgClass, imageUploads, loadData, onload);
};


let html5Upload = (evt) => {
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
			let file = uploadedFiles[i];
			if (prvCount === allowedUploads) {
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

let initialize = () => {
	this.isMobile = true;
	this.inputDisabled = false;
	this.$loginModal = $('.login-modal');
	this.$loginModalMask = $('.login-modal-mask');
	this.epsData = $('#js-eps-data');
	this.uploadImageContainer = $('.upload-image-container');
	this.isProgressEventSupport = isProgressEventSupported();
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
	// on select file
	$('#postForm').on("change", "#mobileFileUpload", (evt) => {
		this.uploadPhotoText.toggleClass('hidden');

		evt.stopImmediatePropagation();
		let file = evt.target.files[0];
		if (!file) {
			return;
		}
		if (!this.epsUpload.isSupported(file.name)) {
			UploadMsgClass.invalidType(0);
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
	loadData,
	requestLocation
};



