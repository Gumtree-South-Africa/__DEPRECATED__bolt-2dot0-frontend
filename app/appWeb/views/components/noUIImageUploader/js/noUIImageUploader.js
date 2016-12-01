'use strict';

require('public/js/libraries/webshims/polyfiller.js');
let EpsUploadModule = require('../../uploadImage/js/epsUpload.js');
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

/**
 * An image uploader with no UI. This component will actually add a file input out of the page view
 * to do the file upload. However, as there is no way to know the upload is cancelled if user clicks
 * cancel button in file choosing dialog, this component will use event trigger as callback instead
 * of returning promise.
 *
 * - Handlebar context fields:
 *   - eps: EPS config
 *
 * - Events:
 *   - imageWillUpload
 *   - imageDidUpload
 *
 * - APIs:
 *   - uploadImage
 */
class NoUIImageUploader {
	constructor() {
		this._uploadPromise = null;

		/**
		 * Triggered after an image has been selected by user and before it's uploaded.
		 * It will be triggered with fileName.
		 */
		this.imageWillUpload = new SimpleEventEmitter();

		/**
		 * Triggered after an image is uploaded successfully or the upload fails
		 * It will be triggered with err and resultUrlObj. If the upload is successful,
		 * the "err" will be null.
		 */
		this.imageDidUpload = new SimpleEventEmitter();
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		this._$fileUploader = domElement;
		this._epsUpload = new EpsUploadModule.EpsUpload({
			IsEbayDirectUL: this._$fileUploader.data('eps-is-ebay-direct-ul'),
			token: this._$fileUploader.data('eps-token'),
			url: this._$fileUploader.data('eps-url')
		});
		this._$fileUploader.on('change', evt => {
			this._uploadFile(evt.target.files || evt.dataTransfer.files);
		});
	}

	/**
	 * Trigger the start of uploading image. The reason we don't directly return a promise is because
	 * there is no way to know it if user click "cancel" in file choosing dialog.
	 */
	uploadImage() {
		if (this._uploadPromise) {
			// Don't start latter upload until the previous one has been done.
			return;
		}
		this._$fileUploader.click();
	}

	_uploadFile(files) {
		if (!files || !files.length) {
			return;
		}
		// Only support one image at a time
		let file = files[0];
		let fileName = file.name;
		if (!this._epsUpload.isSupported(fileName)) {
			this.imageDidUpload.trigger({
				errorCode: EpsUploadModule.EPS_CLIENT_ERROR_CODES.INVALID_TYPE,
				fileName: fileName
			});
			return;
		}
		this._uploadPromise = new Promise((resolve, reject) => {
			this.imageWillUpload.trigger(fileName);

			let loadData = (i, loadedFile) => {
				this._epsUpload.uploadToEps(0, loadedFile, (index, response) => {
					// Success handler
					resolve(response);
				}, (index, response) => {
					try {
						// Fail handler
						reject(this._extractClientError(response, fileName));
					} catch(err) {
						reject(err);
					}
				}, () => new window.XMLHttpRequest());
			};

			let _this = this;
			let onload = (thisFile) => {
				return function() {
					let resizedImageFile = _this._epsUpload.scaleAndCropImage(this, thisFile.type);
					loadData(0, resizedImageFile);
				};
			};

			this._epsUpload.prepareForImageUpload(0, file, loadData, onload);

		}).then((response) => {
			let urlObj = this._epsUpload.extractURLClass(response);
			if (!urlObj) {
				throw this._extractClientError(response, fileName);
			}
			urlObj.normal = this._transformEpsUrl(urlObj.normal);
			if (urlObj.normal.toLowerCase().indexOf("https") < 0) {
				urlObj.normal = urlObj.normal.replace('http', 'https');
			}
			this.imageDidUpload.trigger(null, urlObj);
		}).catch((err) => {
			if (!err.errorCode) {
				// Not known error
				err = {
					errorCode: EpsUploadModule.EPS_CLIENT_ERROR_CODES.UNKNOWN,
					fileName: fileName,
					originalError: err
				};
			}
			this.imageDidUpload.trigger(err);
		}).then(() => this._cleanup(), () => this._cleanup());
	}

	_cleanup() {
		this._uploadPromise = null;
		this._$fileUploader.val('');
	}

	_extractClientError(response, fileName) {
		let serverError = this._epsUpload.extractEPSServerError(response);
		return {
			errorCode: EpsUploadModule.getClientErrorCode(serverError),
			fileName: fileName
		};
	}

	//this needs to be removed when HTTPS for EPS gets a certificate
	_transformEpsUrl(url) {
		let newUrl = url.replace('i.ebayimg.sandbox.ebay.com', 'i.sandbox.ebayimg.com');
		return newUrl;
	}
}

module.exports = {
	initialize: function() {
		// Initialize code
	},
	NoUIImageUploader: NoUIImageUploader
};
