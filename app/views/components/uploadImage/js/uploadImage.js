'use strict';

let $ = require('jquery');
let imageHelper = require('./imageHelper');
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

let isDnDElement = () => {
	let div = document.createElement('div');
	return ('draggable' in div) && !matchMedia("mobile");
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

// Add thumbnail url by replacing _18 to _14, See EPS server
let convertThumbImgURL14 = (url) => {
	let reg = /\_\d*\.JPG/ig;
	return url.replace(reg, "_14.JPG");
};

let convertThumbImgURL18 = (url) => {
	let reg = /\_\d*\.JPG/ig;
	return url.replace(reg, "_18.JPG");
};

let getThumbImgURL = (url) => {
	let result;
	if (!this.EPS.IsEbayDirectUL) {
		result = url.split("?")[0];
	} else {
		// for direct zoom
		result = url.split(";")[1];
	}

	if (result && result.match(/^http/)) {
		return result;  // url looks fine
	}
};

let extractEPSServerError = (respText) => {
	// format, ERROR:ME200
	let reg = /ERROR\:(\w*)/i;
	return respText.replace(reg, "$1");
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
	let normalImageURLZoom = getThumbImgURL(url);

	if (!normalImageURLZoom) {
		// not been able to find out a valid url
		return;
	}

	//zoom url VERSION:2;http://i.ebayimg.com/00/s/NjAwWDgwMA==/z/r84AAOSwE2lTf~HM/$_1.JPG?set_id=8800005007

	// convert to _18.JPG format saved in backend
	normalImageURLZoom = convertThumbImgURL18(normalImageURLZoom);

	// convert to _14.JPG thumb format

	return {
		"thumbImage": convertThumbImgURL14(normalImageURLZoom), "normal": normalImageURLZoom
	};

};

//TODO: DOM-required functions need fix


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


//TODO: this appends extra images to page, need to remove except for desktop
let createImgObj = (i) => {
	let imagePlaceHolder = $("#image-place-holder-" + i);
	$(imagePlaceHolder).css("background-position-y", "1em");

	let ul = $("<input class='pThumb' id ='pThumb" + i + "' type='hidden' name='picturesThumb' value=''/><input class='pict' id='pict" + i + "' type='hidden' name='pictures' value=''/>");
	ul.prependTo(imagePlaceHolder);
};

// BOLT IMAGE UPLOADER


let CpsImage = (() => {
	let gif = "gif", jpeg = "jpeg", jpg = "jpg", png = "png", bmp = "bmp";

	let getFileExt = function(f) {
		let fn = f.toLowerCase();
		return fn.substring((Math.max(0, fn.lastIndexOf(".")) || fn.length) + 1);
	};

	return {
		isSupported: function(f) {
			let ext = getFileExt(f);
			return !!(ext === gif || ext === jpeg || ext === jpg || ext === png || ext === bmp);
		}, getFileExt: function(f) {
			return getFileExt(f);
		}
	};

})();

let removeTitleFirstEle = (index) => {
	if (!isDnDElement() && (index !== 0 )) {
		return 'title="' + this.i18n.clickFeatured + '"';
	} else if (index !== 0) {
		return 'title="' + this.i18n.dragToReorder + '"';
	}
};

function defaults(e) {
	e.stopPropagation();
	e.preventDefault();
}


let firefoxStopImageEleDrag = () => {
	jQuery.browser.firefox = /firefox/.test(navigator.userAgent.toLowerCase());
	if (!jQuery.browser.firefox) {
		return;
	}


	let images = document.querySelectorAll('.img-box img');

	function dStrart(e) {
		defaults(e);
	}

	function dEnter(e) {
		defaults(e);
	}

	function dOver(e) {
		defaults(e);
	}

	function dLeave(e) {
		defaults(e);
	}

	function dDrop(e) {
		defaults(e);
	}

	function dEnd(e) {
		defaults(e);
	}


	[].forEach.call(images, (image) => {
		image.addEventListener('dragstart', dStrart, false);
		image.addEventListener('dragenter', dEnter, false);
		image.addEventListener('dragover', dOver, false);
		image.addEventListener('dragleave', dLeave, false);
		image.addEventListener('drop', dDrop, false);
		image.addEventListener('dragend', dEnd, false);
	});

};


let dragAndDropElements;

//todo: handles all the image uploads
let imageUploads = (() => {

	let images = [],
		urls = [];

	// reset the dome when thumb element is removed.
	this.resetThumbDOM = () => {
		$(".img-box").each(function(i) {
			$(this).attr("id", "image-place-holder-" + i);
			$(this).find(".thumb").attr("id", "thumb-img-" + i);
			$(this).find(".upload-status").attr("id", "upload-status-" + i);
			$(this).find(".progress").attr("id", "progress-" + i);
			$(this).find(".percents").attr("id", "percents-" + i);
			$(this).find(".uploading").attr("id", "file-upload-" + i);
			$(this).find(".pThumb").attr("id", "pThumb" + i);
			$(this).find(".pict").attr("id", "pict" + i);
		});
	};

	return {
		addClassFeatured: () => {
			$("#image-place-holder-0").addClass("featured");
			if (!$("#featuredImage").doesExist()) {
				$("#image-place-holder-0").append("<div id='featuredImage'>" + this.i18n.imageFeatured + "</div>");
			}
		},
		add: (l) => {

			let html = "", total = images.length;
			if (total === allowedUploads - 1) {
				//case: to hide camera icon
				$('.uploadWrapper').addClass('hiddenElt');
			} else {
				if (total > allowedUploads - 1) {
					return false;
				}
			}
			for (let i = total; i < l + total; i++) {
				let index = i, title = removeTitleFirstEle(index);

				let htmlThumb = '<li draggable="true" class="img-box" id="image-place-holder-' + index + '" ' + title + ' id="img-' + index + '">' + '<div class="icon-remove-gray"></div>' + '<img class="thumb" id="thumb-img-' + index + '"  width="64px" height="64px" src="" />' + '<ul id="upload-status-' + index + '" class="upload-status">' + '<li>' + '<div id="progress-cnt-' + index + '" class="progress-holder">' + '<div id="progress-' + index + '" class="progress"></div>' + '</div>' + '<span id="percents-' + index + '" class="percents"></span>' + '</li>' + '<li>' + '<div class="uploading" id="file-upload-' + index + '"></div>' + '</li>' + '</ul>' + '</li>';

				images.push(index);
				html = html + htmlThumb;
				$("#thumb-nails").append(htmlThumb);
				dragAndDropElements.init("image-place-holder-" + i);
			}

			imageUploads.addClassFeatured();
			if (!isDnDElement()) {
				$(".img-box").css("cursor", "pointer");
			} else {
				firefoxStopImageEleDrag();
			}
			return true;
		},

		remove: (i) => {
			if (isNumber(i)) {
				$("#image-place-holder-" + i).remove();
				images.pop();
				urls.remove(i);
				$('#thumb-nails').next('.uploadWrapper').removeClass('hiddenElt');
			}
			this.resetThumbDOM();
			// hightlight
			imageUploads.addClassFeatured();
		},

		addFromImageUrls: (urlThumbArray, urlArray) => {

			let html = "";

			for (let i = 0; i < urlArray.length; i++) {
				let index = i, title = 'title-' + i;

				let htmlThumb = '<li draggable="true" class="img-box" id="image-place-holder-' + index + '" ' + title + ' id="img-' + index + '">' + '<div class="icon-remove-gray"></div>' + '<img class="thumb" id="thumb-img-' + index + '"  width="64px" height="64px" src="' + urlArray[i] + '" />' + '<ul id="upload-status-' + index + '" class="upload-status">' + '<li>' + '<div id="progress-cnt-' + index + '" class="progress-holder">' + '<div id="progress-' + index + '" class="progress"></div>' + '</div>' + '<span id="percents-' + index + '" class="percents"></span>' + '</li>' + '<li>' + '<div class="uploading" id="file-upload-' + index + '"></div>' + '</li>' + '</ul>' + '</li>';

				images.push(index);
				html = html + htmlThumb;
				$("#thumb-nails").append(htmlThumb);
				dragAndDropElements.init("image-place-holder-" + i);

				createImgObj(i, urlThumbArray[i], urlArray[i]);

				if (i >= allowedUploads - 1) {
					//case: to hide camera icon
					$('.uploadWrapper').addClass('hiddenElt');
				}
			}

			this.addClassFeatured();
			if (!isDnDElement()) {
				$(".img-box").css("cursor", "pointer");
			} else {
				firefoxStopImageEleDrag();
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
		}, resetThumbDOM: () => {
			this.resetThumbDOM();

		}, removeClassFeatured: () => {
			$("#image-place-holder-0").removeClass("featured");
			$("#featuredImage").remove();
		}
	};
})();


dragAndDropElements = (() => {
	let _this;
	jQuery.browser = {};
	jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

	function handleDragOver(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}

		e.dataTransfer.dropEffect = 'move';
		this.classList.add('over');

		return false;
	}

	function handleDragEnter() {
		// this / e.target is the current hover target.
		this.classList.add('over');
	}

	function handleDragLeave() {
		this.classList.remove('over');  // this / e.target is previous target element.
	}

	function handleDragStart(e) {
		// Target (this) element is the source node.
		//this.style.opacity = '0.4';

		_this = this;

		e.dataTransfer.effectAllowed = 'move';

		if (jQuery.browser.msie) {
			e.dataTransfer.setData('text', this.innerHTML);
		} else {
			e.dataTransfer.setData('text/html', this.innerHTML);
		}

	}

	function handleDrop(e) {
		// this/e.target is current target element.

		if (e.stopPropagation) {
			e.stopPropagation(); // Stops some browsers from redirecting.
		}

		// Don't do anything if dropping the same column we're dragging.
		if (_this !== this && this.innerHTML !== null) {
			// Set the source column's HTML to the HTML of the column we dropped on.
			_this.innerHTML = this.innerHTML;

			if (jQuery.browser.msie) {
				this.innerHTML = e.dataTransfer.getData('text');
			} else {
				this.innerHTML = e.dataTransfer.getData('text/html');

			}

		}

		let cols = document.querySelectorAll('.img-box');

		[].forEach.call(cols, (col) => {
			col.classList.remove('over');
		});
		this.style.opacity = '1';
		imageUploads.resetThumbDOM();

		$("#featuredImage").remove();

		imageUploads.addClassFeatured();


		return false;
	}

	function handleDragEnd(e) {
		// this/e.target is the source node.
		if (e.stopPropagation) {
			e.stopPropagation(); // Stops some browsers from redirecting.
		}

		firefoxStopImageEleDrag();
	}

	let cols = document.querySelectorAll('.img-box');

	return {
		initAll: () => {
			if (isDnDElement()) {
				[].forEach.call(cols, (col) => {
					col.addEventListener('dragstart', handleDragStart, false);
					col.addEventListener('dragenter', handleDragEnter, false);
					col.addEventListener('dragover', handleDragOver, false);
					col.addEventListener('dragleave', handleDragLeave, false);
					col.addEventListener('drop', handleDrop, false);
					col.addEventListener('dragend', handleDragEnd, false);

					// mobile devices has no support for elements drag and drop
					//col.addEventListener("touchstart", handleDragStart, false);
					//col.addEventListener("touchend", handleDrop, false);
					// col.addEventListener("touchcancel", handleCancel, false);
					// col.addEventListener("touchleave", handleDragEnd, false);
					// col.addEventListener("touchmove", handleDragOver, false);

				});

				firefoxStopImageEleDrag();

			}
		},

		init: (ele) => {
			if (isDnDElement()) {
				let col = document.getElementById(ele);
				if (col) {
					col.addEventListener('dragstart', handleDragStart, false);
					col.addEventListener('dragenter', handleDragEnter, false);
					col.addEventListener('dragover', handleDragOver, false);
					col.addEventListener('dragleave', handleDragLeave, false);
					col.addEventListener('drop', handleDrop, false);
					col.addEventListener('dragend', handleDragEnd, false);
				}

			}

		}
	};
})();

//TODO: fix this for the desktop carousel
let UploadMsgClass = {
	//TODO: make a file-upload area that works with this.
	hideThumb: (i) => {
		$("#file-upload-" + i).css("margin-top", "1.8em").css("color", "red");
		$("#thumb-img-" + i).remove();
		$("#progress-cnt-" + i).hide();
		$("#percents-" + i).hide();
	},
	showModal: () => {
		this.messageModal.toggleClass('hidden');
	},
	successMsg: () => {
		this.messageError.html(this.messages.successMsg);
	},
	failMsg: (i) => {
		this.messageError.html(this.messages.failMsg);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.showModal();
		UploadMsgClass.hideThumb(i);
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
	},
	invalidType: (i) => {
		this.messageError.html(this.messages.invalidType);
		this.$errorMessageTitle.html(this.messages.unsupportedFileTitle);
		UploadMsgClass.hideThumb(i);
		UploadMsgClass.showModal();
	},
	invalidDimensions: (i) => {
		this.messageError.html(this.messages.invalidDimensions);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideThumb(i);
		UploadMsgClass.showModal();
	},
	firewall: (i) => {
		this.messageError.html(this.messages.firewall);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideThumb(i);
		UploadMsgClass.showModal();
	},
	colorspace: (i) => {
		this.messageError.html(this.messages.colorspace);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideThumb(i);
		UploadMsgClass.showModal();
	},
	corrupt: (i) => {
		this.messageError.html(this.messages.corrupt);
		this.$errorMessageTitle.html(this.messages.error);
		UploadMsgClass.hideThumb(i);
		UploadMsgClass.showModal();
	},
	pictureSrv: (i) => {
		this.messageError.html(this.messages.pictureSrv);
		UploadMsgClass.hideThumb(i);
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
		UploadMsgClass.hideThumb(i);
	}
};

// let updateSpinner = (percent) => {
	// let transform_styles = ['-webkit-transform', '-ms-transform', 'transform'];
	// let rotation = percent * 180;
	// let fill_rotation = rotation;
	// let fix_rotation = rotation * 2;
	// transform_styles.forEach((style) => {
	// 	$('.circle .fill, .circle .mask.full').css(style, 'rotate(' + fill_rotation + 'deg)');
	// 	$('.circle .fill.fix').css(style, 'rotate(' + fix_rotation + 'deg)');
	// });
// };


//todo HERE
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

	//TODO: for multiple upload
	// xhr.upload.progress = $("#progress-" + i);
	// xhr.upload.percents = $("#percents-" + i);

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
				let error = extractEPSServerError(this.response);
				UploadMsgClass.translateErrorCodes(count, error);
				return;
			}

			// add the image once EPS returns the uploaded image URL
			createImgObj(this.bCount, url.thumbImage, url.normal);
			if (_this.mobile) {
				//TODO: this is for mobile only
				$(".user-image").css("background-image", `url(${url.normal}`);

				//TODO: handle desktop
				uploadAd.postAd([url.normal], (response) => {
					_this.$uploadSpinner.toggleClass('hidden');
					_this.$uploadProgress.toggleClass('hidden');
					_this.$uploadProgress.html("0%");
					UploadMsgClass.successMsg(i);
					switch (response.state) {
						case AD_STATES.AD_CREATED:
							window.location = response.ad.vipLink;
							break;
						case AD_STATES.AD_DEFERRED:
							_this.$loginModal.toggleClass('hidden');
							_this.$loginModalMask.toggleClass('hidden');
							//TODO: set redirect URLS
							break;
						default:
							break;
					}
				}, (err) => {
					console.warn(err);
					UploadMsgClass.failMsg(i);
				});
			}

		}

	};

	xhr.onabort = function(e) {
		console.warn('aborted', e);
	};


	xhr.upload.addEventListener("progress", function(event) {
		let index = this.bCount;

		if (event.lengthComputable) {
			let percent = event.loaded / event.total;
			_this.$uploadProgress.html((percent * 100).toFixed() + "%");

			_this.imageProgress.attr('value', percent * 100);
			// updateSpinner(percent);
			// display image from client
			if (event.loaded === event.total) {
				//TODO: display the image from EPS in the div.
				$("#thumb-img-" + index).attr("src", imageUploads.getURL(i));
			}
		} else {
			UploadMsgClass.failMsg(index);
		}
	}, false);

	xhr.send(formData);  // multipart/form-data
};

// TODO: uncomment
// let featuredImage = () => {
//
// 	$("#thumb-nails").on("click", ".img-box", function(e) {
// 		let target = $(e.target);
// 		if (target.is("div") && $(this).hasClass("icon-remove-gray")) {
// 			return;
// 		}
// 		imageUploads.removeClassFeatured();
// 		$(this).insertBefore($("#image-place-holder-0"));
// 		imageUploads.resetThumbDOM();
// 		imageUploads.addClassFeatured();
// 	});
// };

//TODO: here minus a few dom references
let prepareForImageUpload = (i, file) => {

	$("#upload-status-" + i).show();
	UploadMsgClass.loadingMsg(i);

	let mediaType = CpsImage.isSupported(file.name);

	if (!mediaType) {
		UploadMsgClass.translateErrorCodes(i, "FF001"); // invalid file type
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
					let resizedImageFile = imageHelper.scaleAndCropImage(this, thisFile.type);
					loadData(i, resizedImageFile);
				};

				window.URL = window.URL || window.webkitURL || false;
				image.src = URL.createObjectURL(thisFile);//window.URL.createObjectURL(blob);

				if (thisFile.type === 'image/jpeg') {
					let binaryFile = imageHelper.convertToBinaryFile(dataUrl);
					image.exifData = imageHelper.findEXIFinJPEG(binaryFile);
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
			let resizedImageFile = imageHelper.scaleAndCropImage(this, file.type);
			loadData(i, resizedImageFile);
		};
		img.src = imageUrl;
	}
};


//TODO: here
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


//drag and drop
// class drop

//TODO: uncomment
// let dragAndDrop = () => {
//
// 	let dropbox = document.getElementById("dnd");
//
// 	function defaults(e) {
// 		e.stopPropagation();
// 		e.preventDefault();
// 	}
// 	function dragenter(e) {
// 		$(this).addClass("active");
// 		defaults(e);
// 	}
//
// 	function dragover(e) {
// 		$(this).removeClass("active");
// 		defaults(e);
// 		return false;
// 	}
//
// 	function dragleave(e) {
// 		$(this).removeClass("active");
// 		defaults(e);
// 	}
//
// 	function drop(e) {
// 		$(this).removeClass("active");
// 		defaults(e);
// 		html5Upload(e);
// 	}
//
//
// 	function dragEnd(e) {
// 		defaults(e);
// 		return false;
// 	}
//
// 	if (dropbox) {
// 		dropbox.addEventListener("dragenter", dragenter, false);
// 		dropbox.addEventListener("dragleave", dragleave, false);
// 		dropbox.addEventListener("dragover", dragover, false);
// 		dropbox.addEventListener("drop", drop, false);
// 		dropbox.addEventListener("dragEnd", dragEnd, false);
// 	}
//
// };

//jQuery stuff


Array.prototype.remove = function(from, to) {
	let rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};


//TODO: remove all DOM references outside of the initialize function.
//TODO: remove all deprecated functionality
//TODO: tie in old functionality to new DOM

let initialize = () => {
	//TODO: this should not be hard coded
	this.mobile = true;

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

	this.percentSingleUpload = $('#js-upload-percentage');
	this.uploadPhotoText = this.uploadImageContainer.find('.upload-photo-text');
	this.$uploadSpinner = this.uploadImageContainer.find('#js-upload-spinner');
	this.$uploadProgress = this.uploadImageContainer.find('#js-upload-progress');

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

	this.uploadPhotoText.on('click', () => {
		this.$imageUpload.click();
	});

	this.$imageUpload = $("#fileUpload");

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
	$('#postForm').on("change", "#fileUpload", (evt) => {

		evt.stopImmediatePropagation();
		// get img-box

		// multiple image upload

		//TODO: don't grab 0 off files
		let file = evt.target.files[0];
		if (!file) {
			return;
		}
		let reader = new FileReader();
		if (!CpsImage.isSupported(file.name)) {
			UploadMsgClass.invalidType(0);
			this.$imageUpload.val('');
			return;
		}
		reader.onloadend = () => {
			this.imageHolder.css('background-image', `url("${reader.result}")`);
			this.uploadPhotoText.addClass('hidden');
			this.$uploadSpinner.toggleClass('hidden');
			this.$uploadProgress.toggleClass('hidden');
		};
		if (file) {
			reader.readAsDataURL(file);
		}

		// lets only do if there is support for multiple
		if (isCORS() && supportMultiple() && !isBlackBerryCurve() && fileAPISupport()) {
			html5Upload(evt);
		} else {
			$("#fileUpload").removeAttr("multiple");
			uploadNoneHtml5(this);
		}
	});

	//TODO: uncomment this out?
	/*
	 $(document).ready(() => {
	 if ($.isSafari() && !IsSafariMUSupport() && !isIOS()) {
	 $("#file").removeAttr("multiple");
	 }

	 // hightlight
	 imageUploads.addClassFeatured();

	 //register elements for drag and drop
	 if (isDnDElement()) {
	 dragAndDropElements.initAll();
	 } else {
	 featuredImage();
	 }

	 $("#thumb-nails > li").each(function(index) {
	 if (!isDnDElement() && (index !== 0 )) {
	 $(this).attr("title", this.i18n.clickFeatured);
	 } else if (index !== 0) {
	 $(this).attr('title', this.i18n.dragToReorder);
	 }
	 });


	 if (isProgressEventSupport === true) {
	 $(".upload-status").show();
	 }

	 // some devices doesn't support file upload.
	 if (!isFileInputSupported) {
	 $("#upload-btn").hide();
	 $("#or").hide();
	 $("#dndArea").hide();
	 $("#dnd-cnt").css("float", "left");
	 $("#dnd").show();
	 }

	 if (window.addEventListener) {
	 dragAndDrop();
	 }

	 $(window).on("load", function(evt) {
	 imageUploads.addFromImageUrls(Bolt.imgThumbUrls, Bolt.imgUrls);
	 });


	 $("#postForm").on("click", ".icon-remove-gray", function(evt) {
	 evt.stopImmediatePropagation();
	 let i = parseInt($($(this).parents(".img-box")).attr("id").split("-")[3]);
	 if (isNumber(i)) {
	 imageUploads.remove(i);
	 // Trigger an event to indicate that an image was removed
	 // $('#postForm').trigger("removedImage", {});

	 }
	 });

	 });
	 */

};

module.exports = {
	initialize
};



