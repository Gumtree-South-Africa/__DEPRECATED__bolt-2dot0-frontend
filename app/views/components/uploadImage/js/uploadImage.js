'use strict';

let $ = require('jquery');
let Q = require('q');
let ImageHelper = require('./imageHelper');
let uploadAd = require('./uploadAd');

$.prototype.doesExist = function() {
	return $(this).length > 0;
};

const AD_STATES = {
	AD_CREATED: "AD_CREATED",
	AD_DEFERRED: "AD_DEFERRED"
};

let allowedUploads = 4;


let isCORS = () => {
	return 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest();
};

let isNumber = (o) => {
	return typeof o === 'number' && isFinite(o);
};

let isBlackBerryCurve = () => {
	return !!navigator.userAgent.match(/(BlackBerry (9320|9360))/);
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

let fileAPISupport = () => {

	return !!(window.File && window.FileList && window.FileReader);
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
		return;
	}

	// convert to _18.JPG format saved in backend
	normalImageURLZoom = this.imageHelper.convertThumbImgURL18(normalImageURLZoom);

	return {
		"thumbImage": this.imageHelper.convertThumbImgURL14(normalImageURLZoom), "normal": normalImageURLZoom
	};

};

let supportMultiple = () => {
	// lets not do it for safari until we find a solution
	//if ($.isSafari()) return false;
	//if ($.isSafari() && !(IsSafariMUSupport())) return false;
	// do i support FileList API
	if ($("#file").files && document.getElementById("file").files.length === 0) {
		return false;
	}
	//do I support input type=file/multiple
	let el = document.createElement("input");
	return ("multiple" in el);
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
		this.imageHolder.css("background-image", `url()`);
		this.uploadPhotoText.toggleClass('hidden');
		this.$imageUpload.val('');
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
		}
	}
};

let _postAd = (url) => {
	uploadAd.postAd([url], (response) => {
		this.$uploadSpinner.toggleClass('hidden');
		this.$uploadProgress.toggleClass('hidden');
		this.$uploadProgress.html("0%");
		UploadMsgClass.successMsg(0);
		switch (response.state) {
			case AD_STATES.AD_CREATED:
				this.$uploadSuccessLink.attr('href', response.ad.vipLink);
				this.$uploadSuccessModal.toggleClass('hidden');
				this.$uploadSuccessModalMask.toggleClass('hidden');
				break;
			case AD_STATES.AD_DEFERRED:
				this.$loginModal.toggleClass('hidden');
				this.$loginModalMask.toggleClass('hidden');
				//TODO: set redirect URLS
				break;
			default:
				break;
		}
	}, (err) => {
		console.warn(err);
		this.$uploadSpinner.toggleClass('hidden');
		this.$uploadProgress.toggleClass('hidden');
		UploadMsgClass.failMsg(0);
	});
};

let loadData = (i, file) => {

	let _this = this;
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

	let xhr = new XMLHttpRequest();
	xhr.open('POST', this.EPS.url, true);
	xhr.responseType = 'text';
	xhr.bCount = i;
	xhr.upload.bCount = i;
	xhr.fileSize = file.size;

	xhr.onload = function(e) {
		e.stopPropagation();
		e.preventDefault();

		let count = this.bCount;
		let url;
		let statusOk = (this.status === 200);

		// try to extract the url and figure out if it looks like to be valid
		if (statusOk) {
			url = ExtractURLClass(this.response);
			if (!url) {
				// url is not reconized => consider the download in error
				statusOk = false;
				// console.warn("cannot extract from response given by EPS  => " + this.response);
			}
		}

		if (!statusOk) {
			UploadMsgClass.failMsg(count);
		}

		if (this.readyState === 4 && statusOk) {

			let urlClass = ExtractURLClass(this.response);

			// any errors don't do anything after display error msg
			if (!urlClass) {
				let error = this.imageHelper.extractEPSServerError(this.response);
				UploadMsgClass.translateErrorCodes(count, error);
				return;
			}

			if (_this.isMobile) {
				_this.imageHolder.css("background-image", `url(${url.normal}`);
				_this.locationPromise.finally(() => {
					//Don't care if they actually gave us location, just that it finished.
					_postAd(url.normal);
				});
			}

		}

	};

	xhr.onabort = function(e) {
		console.warn('aborted', e);
		_this.$uploadSpinner.toggleClass('hidden');
		_this.$uploadProgress.toggleClass('hidden');
		UploadMsgClass.failMsg(i);
	};


	xhr.upload.addEventListener("progress", function(event) {
		let index = this.bCount;

		if (event.lengthComputable) {
			let percent = event.loaded / event.total;
			_this.$uploadProgress.html((percent * 100).toFixed() + "%");

			_this.imageProgress.attr('value', percent * 100);
			// updateSpinner(percent);
			// display image from client
		} else {
			UploadMsgClass.failMsg(index);
		}
	}, false);

	xhr.send(formData);  // multipart/form-data
};

let prepareForImageUpload = (i, file) => {
	let mediaType = this.imageHelper.isSupported(file.name);

	if (!mediaType) {
		UploadMsgClass.translateErrorCodes(i, "FF001"); // invalid file type
		return;
	}

	let reader = null;

	let img = new Image();
	let _this = this;

	if (window.FileReader) {
		UploadMsgClass.resizing(i);

		reader = new FileReader();

		reader.onload = (function(image, thisFile) {

			return function(e) {
				let dataUrl = e.target.result;


				image.onload = function() {
					let resizedImageFile = _this.imageHelper.scaleAndCropImage(this, thisFile.type);
					let blobReader = new FileReader();
					blobReader.readAsDataURL(resizedImageFile);
					blobReader.onloadend = () => {
						_this.imageHolder.css("background-image", `url(${blobReader.result}`);
					};
					loadData(i, resizedImageFile);
				};

				window.URL = window.URL || window.webkitURL || false;
				image.src = URL.createObjectURL(thisFile);//window.URL.createObjectURL(blob);

				if (thisFile.type === 'image/jpeg') {
					let binaryFile = _this.imageHelper.convertToBinaryFile(dataUrl);
					image.exifData = _this.imageHelper.findEXIFinJPEG(binaryFile);
				}

				imageUploads.setURL(i, image.src);
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


let uploadNoneHtml5 = () => {

	let count = imageUploads.count();
	if (count === allowedUploads) {
		return;
	}

	imageUploads.add(1);

	// hide progress bar
	$(".progress-holder").hide();

	let i = imageUploads.count() - 1;

	$("#upload-status-" + i).show();

	UploadMsgClass.loadingMsg(i);

	$("#file-upload-" + i).css("margin-top", "1.4em");

	let epsForm = {
		action: this.EPS.url, id: "epsForm" + count, fieldNames: [
			{
				name: "s", value: !this.EPS.IsEbayDirectUL ? "1C5000" : "Standard"
			}, {
				name: "v", value: "2"
			}, {
				name: "b", value: "18"
			}, {
				name: "n", value: "g"
			}, {
				name: "a", value: this.EPS.token
			}, {
				name: "pltfrm", value: "bolt"
			}, {
				name: "rqt", value: $.now()
			}
		]

	};

	let iframe = $('<iframe />', {
		name: 'eps-frame-' + count,
		id: 'eps-frame-' + count,
		style: 'position:absolute;left:-10000px',
		src: "about:blank"
	});

	if ($("#eps-frame" + count)) {
		iframe.appendTo('body');
		// Add the iframe with a unique name
	}


	// work around for IE 9
	// Clone the "real" input element
	let real = $("#file");
	let cloned = real.clone(true);

	// Put the cloned element directly after the real element
	// (the cloned element will take the real input element's place in your UI
	// after you move the real element in the next step)
	real.hide();
	real.value = "";
	cloned.insertAfter(real);

	$('<form style="position:absolute;left:-10000px" method="post" action="' + epsForm.action + '" name="' + epsForm.id + '" id="' + epsForm.id + '" target="eps-frame-' + count + '" enctype="multipart/form-data">' + '<input type="hidden" name="s" value="' + epsForm.fieldNames[0].value + '"/><input type="hidden" name="v" value="' + epsForm.fieldNames[1].value + '"/>' + '<input type="hidden" name="b" value="' + epsForm.fieldNames[2].value + '"><input type="hidden" name="n" value="k"/><input type="hidden" name="pltfrm" value="bolt"/><input type="hidden" name="rqt" value="' + $.now() + '"/>' + '<input type="hidden" name="a" value="' + epsForm.fieldNames[4].value + '"/>' + '</form>').append($("#file")).appendTo('body');

	$("#" + epsForm.id).submit();
};


Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
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

let initialize = () => {
	this.isMobile = true;
	this.locationDeferred = Q.defer();
	this.locationPromise = this.locationDeferred.promise;

	if ("geolocation" in navigator && _getCookie('geoId') === '') {
		navigator.geolocation.getCurrentPosition((position) => {
			//TODO: unblock posting semaphore
			this.locationDeferred.resolve();
			let lat = position.coords.latitude;
			let lng = position.coords.longitude;
			document.cookie = `geoId=${lat}ng${lng}`;
		}, () => {
			this.locationDeferred.reject();
			console.log('position not available');
		}, {
			enableHighAccuracy: true,
			maximumAge: 30000,
			timeout: 27000
		});
	} else {
		this.locationDeferred.resolve();
	}

	this.$loginModal = $('.login-modal');
	this.$loginModalMask = $('.login-modal-mask');
	this.epsData = $('#js-eps-data');
	this.$uploadSuccessModal = $('#js-success-modal');
	this.$uploadSuccessLink = this.$uploadSuccessModal.find('#js-more-details-link');
	this.$postMoreLink = this.$uploadSuccessModal.find('#js-post-more-ads-button');
	this.$uploadSuccessModalMask = $('#js-success-modal-mask');
	this.uploadImageContainer = $('.upload-image-container');
	this.isProgressEventSupport = isProgressEventSupported();
	this.imageProgress = this.uploadImageContainer.find('#js-image-progress');
	this.imageHolder = this.uploadImageContainer.find('.user-image');
	this.EPS = {};
	this.EPS.IsEbayDirectUL = this.epsData.data('eps-isebaydirectul');
	this.EPS.token = this.epsData.data('eps-token');
	this.EPS.url = this.epsData.data('eps-url');
	this.imageHelper = new ImageHelper(this.EPS);

	this.uploadPhotoText = this.uploadImageContainer.find('.upload-photo-text');
	this.$uploadSpinner = this.uploadImageContainer.find('#js-upload-spinner');
	this.$uploadProgress = this.uploadImageContainer.find('#js-upload-progress');

	this.messageError = $('.error-message');
	this.messageModal = $('.message-modal');
	this.$errorModalClose = this.messageModal.find('#js-close-error-modal');
	this.$errorMessageTitle = $('#js-error-title');
	this.$errorModalButton = this.messageModal.find('.btn');

	this.$postMoreLink.click(() => {
		window.location.reload();
	});

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
	this.Bolt.imgThumbUrls = JSON.parse(this.epsData.find('#js-bolt-imgThumbUrls').text());
	this.Bolt.imgUrls = JSON.parse(this.epsData.find('#js-bolt-imgUrls').text());
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

		evt.stopImmediatePropagation();
		let file = evt.target.files[0];
		if (!file) {
			return;
		}
		if (!this.imageHelper.isSupported(file.name)) {
			UploadMsgClass.invalidType(0);
			return;
		}
		this.uploadPhotoText.addClass('hidden');
		this.$uploadSpinner.toggleClass('hidden');
		this.$uploadProgress.toggleClass('hidden');
		// lets only do if there is support for multiple
		if (isCORS() && supportMultiple() && !isBlackBerryCurve() && fileAPISupport()) {
			html5Upload(evt);
		} else {
			uploadNoneHtml5(this);
		}
	});
};

module.exports = {
	initialize
};



