'use strict';

/*eslint no-bitwise: 0*/

class BinaryFile {
	constructor(strData, iDataOffset, iDataLength) {
		let data = strData;
		let dataOffset = iDataOffset || 0;
		let dataLength = 0;

		if (typeof strData === "string") {
			dataLength = iDataLength || data.length;

			this.getByteAt = (iOffset) => {
				return data.charCodeAt(iOffset + dataOffset) & 0xFF;
			};

			this.getBytesAt = (iOffset, iLength) => {
				let aBytes = [];

				for (let i = 0; i < iLength; i++) {
					aBytes[i] = data.charCodeAt((iOffset + i) + dataOffset) & 0xFF;
				}


				return aBytes;
			};
			//Turning off ESLint for this block because it's IE specific stuff
			/*eslint-disable */
		} else if (typeof strData === "unknown") {
			dataLength = iDataLength || IEBinary_getLength(data);

			this.getByteAt = (iOffset) => {
				return IEBinary_getByteAt(data, iOffset + dataOffset);
			};

			this.getBytesAt = (iOffset, iLength) => {
				return new VBArray(IEBinary_getBytesAt(data, iOffset + dataOffset, iLength)).toArray();
			};
			/*eslint-enable */
		}

		this.getLength = () => {
			return dataLength;
		};

		this.getShortAt = function(iOffset, bBigEndian) {
			let iShort = bBigEndian ? (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1) : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset);
			if (iShort < 0) {
				iShort += 65536;
			}
			return iShort;
		};

		this.getLongAt = function(iOffset, bBigEndian) {
			let iByte1 = this.getByteAt(iOffset), iByte2 = this.getByteAt(iOffset + 1), iByte3 = this.getByteAt(iOffset + 2), iByte4 = this.getByteAt(iOffset + 3);

			let iLong = bBigEndian ? (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4 : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
			if (iLong < 0) {
				iLong += 4294967296;
			}
			return iLong;
		};

		this.getSLongAt = function(iOffset, bBigEndian) {
			let iULong = this.getLongAt(iOffset, bBigEndian);
			if (iULong > 2147483647) {
				return iULong - 4294967296;
			} else {
				return iULong;
			}
		};

		this.getStringAt = function(iOffset, iLength) {
			let aStr = [];

			let aBytes = this.getBytesAt(iOffset, iLength);
			for (let j = 0; j < iLength; j++) {
				aStr[j] = String.fromCharCode(aBytes[j]);
			}
			return aStr.join("");
		};
	}

}

class EpsUpload {
	constructor(EPS) {
		this.EPS = EPS;
		this.TiffTags = {
			0x0112: "Orientation"
		};
	}

	uploadToEps(i, file, success, failure, xhr) {
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
			xhr: xhr,
			type: 'POST',
			contentType: false,
			processData: false,
			url: this.EPS.url,
			data: formData,
			success: (response) => {
				success(i, response);
				window.BOLT.trackEvents({"event":"PostAdPhotoSuccess"});
			},
			error: (err) => {
				failure(i, err);
			}
		});
	}

	prepareForImageUpload(i, file, UploadMsgClass, imageUploads, loadData, onload) {

		let mediaType = this.isSupported(file.name);

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

					image.onload = onload(thisFile);

					window.URL = window.URL || window.webkitURL || false;
					image.src = URL.createObjectURL(thisFile);//window.URL.createObjectURL(blob);

					if (thisFile.type === 'image/jpeg') {
						let binaryFile = _this.convertToBinaryFile(dataUrl);
						image.exifData = _this.findEXIFinJPEG(binaryFile);
					}

					imageUploads.setURL(i, image.src);
				};
			})(img, file);

			reader.readAsDataURL(file);
		} else {
			window.URL = window.URL || window.webkitURL || false;
			let imageUrl = URL.createObjectURL(file);
			img.onload = function() {
				let resizedImageFile = _this.scaleAndCropImage(this, file.type);
				loadData(i, resizedImageFile);
			};
			img.src = imageUrl;
		}
	}

	isIOS() {
		return !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
	}

	createBlobFromDataUri(dataURI) {

		// Convert base64/URLEncoded data component to raw binary data held in a string
		let splitString = dataURI.split(',');
		let splitStringMime = splitString[0];
		let splitStringData = splitString[1];

		let byteString;
		if (splitStringMime.indexOf('base64') >= 0) {
			byteString = atob(splitStringData);
		} else {
			byteString = decodeURIComponent(splitStringData);
		}

		// separate out the mime component
		let mimeString = splitStringMime.split(':')[1].split(';')[0];

		// Write the bytes of the string to an ArrayBuffer
		let length = byteString.length;
		let buf = new ArrayBuffer(length);
		let view = new Uint8Array(buf);
		for (let i = 0; i < length; i++) {
			view[i] = byteString.charCodeAt(i);
		}

		// Detect if Blob object is supported.
		if (typeof Blob !== 'undefined') {
			return new Blob([buf], {type: mimeString});

		} else {
			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
			let bb = new window.BlobBuilder();
			bb.append(buf);
			return bb.getBlob(mimeString);
		}
	}

	convertCanvasToBlob(canvas, fileType, QUALITY) {
		if (canvas.mozGetAsFile) {
			// Mozilla implementation (File extends Blob).
			return canvas.mozGetAsFile(null, fileType, QUALITY);
		} else if (canvas.toBlob) {
			// HTML5 implementation.
			// https://developer.mozilla.org/en/DOM/HTMLCanvasElement
			//   return canvas.toBlob(null, fileType, QUALITY);
			// temporary fix for Chrome 50 until Google fix the issue on their side.
			return this.createBlobFromDataUri(canvas.toDataURL(fileType, QUALITY));
		} else {
			// WebKit implementation.
			// https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
			return this.createBlobFromDataUri(canvas.toDataURL(fileType, QUALITY));
		}
	}

	determineCropWidthAndHeight(ratio, width, height) {

		let currentRatio = width / height;
		if (currentRatio !== ratio) {
			if (currentRatio > ratio) {
				// Cut x
				if (this.isIOS()) {
					width = height * ratio;
				}
			} else {
				// Cut y
				if (this.isIOS()) {
					height = width / ratio;
				}
			}
		}

		return {width: Math.round(width), height: Math.round(height)};
	}

	determineScaleWidthAndHeight(maxLength, width, height) {

		if (width > height) {
			if (width > maxLength) {
				height *= maxLength / width;
				width = maxLength;
			}
		} else {
			if (height > maxLength) {
				width *= maxLength / height;
				height = maxLength;
			}
		}
		return {width: Math.round(width), height: Math.round(height)};
	}


	detectTransparency(ctx) {
		let canvas = ctx.canvas;
		let height = canvas.height;

		// Returns pixel data for the specified rectangle.
		let data = ctx.getImageData(0, 0, 1, height).data;

		// Search image edge pixel position in case it is squashed vertically.
		for (let i = 0; i < height; i++) {
			let alphaPixel = data[(i * 4) + 3];
			if (alphaPixel === 0) {
				return true;
			}
		}
		return false;
	}

	transformCoordinate(ctx, orientation, width, height) {
		switch (orientation) {
			case 1:
				// nothing
				break;
			case 2:
				// horizontal flip
				ctx.translate(width, 0);
				ctx.scale(-1, 1);
				break;
			case 3:
				// 180 rotate left
				ctx.translate(width, height);
				ctx.rotate(Math.PI);
				break;
			case 4:
				// vertical flip
				ctx.translate(0, height);
				ctx.scale(1, -1);
				break;
			case 5:
				// vertical flip + 90 rotate right
				ctx.rotate(0.5 * Math.PI);
				ctx.scale(1, -1);
				break;
			case 6:
				// 90 rotate right
				ctx.rotate(0.5 * Math.PI);
				ctx.translate(0, -height);
				break;
			case 7:
				// horizontal flip + 90 rotate right
				ctx.rotate(0.5 * Math.PI);
				ctx.translate(width, -height);
				ctx.scale(-1, 1);
				break;
			case 8:
				// 90 rotate left
				ctx.rotate(-0.5 * Math.PI);
				ctx.translate(-width, 0);
				break;
			default:
				break;
		}
	}

	scaleAndCropImage(img, fileType) {
		let maxLength = 800, QUALITY = 0.9;
		let cropRatio = 800 / 600;
		let originalWidth = img.width;
		let originalHeight = img.height;//console.warn(originalWidth + " " + originalHeight);

		// 90 degrees CW or CCW, flip width and height.
		let orientation = 0;
		if (img.exifData && img.exifData.Orientation) {
			orientation = img.exifData.Orientation;
		}

		switch (orientation) {
			case 5:
			case 6:
			case 7:
			case 8:
				cropRatio = 1 / cropRatio;
				break;
			default:
		}

		// Calculate width and height based on desired X/Y ratio.
		let ret = this.determineCropWidthAndHeight(cropRatio, originalWidth, originalHeight);
		let cropWidth = ret.width;
		let cropHeight = ret.height;

		// Determine if longest side exceeds max length.
		ret = this.determineScaleWidthAndHeight(maxLength, cropWidth, cropHeight);
		let scaleWidth = ret.width;
		let scaleHeight = ret.height;
		let scaleRatio = cropWidth / scaleWidth;

		// Crop and scale.
		let x = -1 * (Math.round(((originalWidth - cropWidth) / 2) / scaleRatio));
		let y = -1 * (Math.round(((originalHeight - cropHeight) / 2) / scaleRatio));
		x = Math.min(0, x);
		y = Math.min(0, y);
		let w = Math.round(originalWidth / scaleRatio);
		let h = Math.round(originalHeight / scaleRatio);

		let canvas = document.createElement("canvas");

		switch (orientation) {
			case 5:
			case 6:
			case 7:
			case 8:
				canvas.width = scaleHeight;
				canvas.height = scaleWidth;
				break;
			default:
				canvas.width = scaleWidth;
				canvas.height = scaleHeight;
		}

		let ctx = canvas.getContext("2d");
		if (orientation) {
			// Transform canvas coordination according to specified frame size and orientation.
			this.transformCoordinate(ctx, orientation, scaleWidth, scaleHeight);
		}

		// For now just a white background, in the future possibly background color based on dominating image color?
		if (this.isIOS()) {
			ctx.fillStyle = "rgba(255,255,255, 0)";
		}
		ctx.fillRect(0, 0, scaleWidth, scaleHeight);
		ctx.drawImage(img, x, y, w, h);

		// Try to fix IOS6s image squash bug.
		// Test for transparency. This trick only works with JPEGs.
		if (this.isIOS() && fileType === 'image/jpeg') {
			let transparent = this.detectTransparency(ctx);
			if (transparent) {
				// Redraw image, doubling the height seems to fix the iOS6 issue.
				ctx.drawImage(img, x, y, w, h * 2.041);
			}
		}

		// Notify listeners of scaled and cropped image.
		//settings.onProcessed && settings.onProcessed(canvas);

		return this.convertCanvasToBlob(canvas, fileType, QUALITY);
	}

	convertToBinaryFile(dataUrl) {
		let byteString, binaryFile;
		try {
			byteString = atob(dataUrl.split(',')[1]);
			binaryFile = new BinaryFile(byteString, 0, byteString.length);
		} catch (e) {
			console.warn("something went wrong");
		}
		return binaryFile;
	}

	findEXIFinJPEG(file) {
		if (file.getByteAt(0) !== 0xFF || file.getByteAt(1) !== 0xD8) {
			return false; // not a valid jpeg
		}

		let offset = 2, length = file.getLength(), marker;

		while (offset < length) {
			if (file.getByteAt(offset) !== 0xFF) {
				return false; // not a valid marker, something is wrong
			}

			marker = file.getByteAt(offset + 1);

			// we could implement handling for other markers here,
			// but we're only looking for 0xFFE1 for EXIF data

			if (marker === 22400) {

				return this.readEXIFData(file, offset + 4, file.getShortAt(offset + 2, true) - 2);

				// offset += 2 + file.getShortAt(offset+2, true);

			} else if (marker === 225) {
				// 0xE1 = Application-specific 1 (for EXIF)
				return this.readEXIFData(file, offset + 4, file.getShortAt(offset + 2, true) - 2);

			} else {
				offset += 2 + file.getShortAt(offset + 2, true);
			}

		}

	}

	readEXIFData(file, start) {
		if (file.getStringAt(start, 4) !== "Exif") {
			return false;
		}

		let bigEnd, tags, tiffOffset = start + 6;

		// test for TIFF validity and endianness
		if (file.getShortAt(tiffOffset) === 0x4949) {
			bigEnd = false;
		} else if (file.getShortAt(tiffOffset) === 0x4D4D) {
			bigEnd = true;
		} else {
			return false;
		}

		if (file.getShortAt(tiffOffset + 2, bigEnd) !== 0x002A) {
			return false;
		}

		if (file.getLongAt(tiffOffset + 4, bigEnd) !== 0x00000008) {
			return false;
		}

		tags = this.readTags(file, tiffOffset, tiffOffset + 8, this.TiffTags, bigEnd);

		return tags;
	}

	readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
		let type = file.getShortAt(entryOffset + 2, bigEnd),
			numValues = file.getLongAt(entryOffset + 4, bigEnd),
			valueOffset = file.getLongAt(entryOffset + 8, bigEnd) + tiffStart, offset, val, numerator, denominator;

		switch (type) {
			case 1: // byte, 8-bit unsigned int
			case 7: // undefined, 8-bit byte, value depending on field
				if (numValues === 1) {
					return file.getByteAt(entryOffset + 8, bigEnd);
				}
				break;

			case 2: // ascii, 8-bit byte
				offset = numValues > 4 ? valueOffset : (entryOffset + 8);
				return file.getStringAt(offset, numValues - 1);


			case 3: // short, 16 bit int
				if (numValues === 1) {
					return file.getShortAt(entryOffset + 8, bigEnd);
				}
				break;

			case 4: // long, 32 bit int
				if (numValues === 1) {
					return file.getLongAt(entryOffset + 8, bigEnd);
				}
				break;

			case 5:	// rational = two long values, first is numerator, second is denominator
				if (numValues === 1) {
					numerator = file.getLongAt(valueOffset, bigEnd);
					denominator = file.getLongAt(valueOffset + 4, bigEnd);
					val = Number(numerator / denominator);
					val.numerator = numerator;
					val.denominator = denominator;
					return val;
				}
				break;

			case 9: // slong, 32 bit signed int
				if (numValues === 1) {
					return file.getSLongAt(entryOffset + 8, bigEnd);
				}
				break;

			case 10: // signed rational, two slongs, first is numerator, second is denominator
				if (numValues === 1) {
					return file.getSLongAt(valueOffset, bigEnd) / file.getSLongAt(valueOffset + 4, bigEnd);
				}
				break;
			default:
				break;
		}
	}

	readTags(file, tiffStart, dirStart, strings, bigEnd) {
		let entries = file.getShortAt(dirStart, bigEnd), tags = {}, entryOffset, tag, i;

		for (i = 0; i < entries; i++) {
			entryOffset = dirStart + i * 12 + 2;
			tag = strings[file.getShortAt(entryOffset, bigEnd)];
			if (!tag) {
				console.warn("Unknown tag: " + file.getShortAt(entryOffset, bigEnd));
			}
			if (tag && tag === "Orientation") {
				tags[tag] = this.readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
			}
		}
		return tags;
	}

	getFileExt(f) {
		let fn = f.toLowerCase();
		return fn.substring((Math.max(0, fn.lastIndexOf(".")) || fn.length) + 1);
	}

	isSupported(f) {
		let ext = this.getFileExt(f);
		return !!(ext === 'gif' || ext === 'jpeg' || ext === 'jpg' || ext === 'png' || ext === 'bmp');
	}

	convertThumbImgURL14(url) {
		let reg = /\_\d*\.JPG/ig;
		return url.replace(reg, "_14.JPG");
	}

	convertThumbImgURL18(url) {
		let reg = /\_\d*\.JPG/ig;
		return url.replace(reg, "_18.JPG");
	}

	getThumbImgURL(url) {
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
	}

	extractEPSServerError(respText) {
		// format, ERROR:ME200
		let reg = /ERROR\:(\w*)/i;
		return respText.replace(reg, "$1");
	}

}

module.exports = EpsUpload;
