'use strict';

class PostAdErrorModalClass {
	constructor($modal, functions) {
		this.epsData = $('#js-eps-data');
		this.$messageModal = $modal;
		this.hideImage = functions.hideImage|| (() => {});
		this.buildMessages();

		// text
		this.$modalErrorMessage = $modal.find('#js-error-message');
		this.$modalTitle = $modal.find('#js-error-title');
		this.$modalErrorCode = $modal.find('#js-error-code');

		// buttons
		this.$modalCloseButton = this.$messageModal.find("#js-close-error-modal");
		this.$modalActionButton = this.$messageModal.find(".error-modal-button");

		// file inputs
		this.$desktopFileInput = $('#desktopFileUpload');
		this.$mobileFileInput = $('#mobileFileUpload');

		// handlers
		this.$modalCloseButton.click(() => {
			this.hideModal();
		});
		this.$modalActionButton.click(() => {
			this.hideModal();

			// if invalid files, trigger file input
			if (this.$messageModal.hasClass("isInvalidType")) {
				window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
				if (this.$desktopFileInput.is(":visible")) {
					this.$desktopFileInput.click();
				} else {
					this.$mobileFileInput.click();
				}
			}
		});
	}

	buildMessages() {
		this.messages = {
			successMsg: this.epsData.data('successmsg'),
			failMsg: this.epsData.data('failmsg'),
			loadingMsg: this.epsData.data('loadingmsg'),
			resizing: this.epsData.data('resizing'),
			invalidSize: this.epsData.data('invalidsize'),
			invalidType: this.epsData.data('invalidtype'),
			invalidDimensions: this.epsData.data('invaliddimensions'),
			uploadDiffPhoto: this.epsData.data('upload-diff-photo'),
			firewall: this.epsData.data('firewall'),
			colorspace: this.epsData.data('colorspace'),
			corrupt: this.epsData.data('corrupt'),
			pictureSrv: this.epsData.data('picturesrv'),
			error: this.epsData.data('error'),
			unsupportedFileTitle: this.epsData.data('unsupported-file-title')
		};
	}

	showModal() {
		this.$messageModal.removeClass('hidden');
	}

	hideModal() {
		this.$messageModal.addClass('hidden');
		this.$messageModal.removeClass("isInvalidType");
	}

	failMsg(i) {
		this.$modalErrorMessage.html(this.messages.failMsg);
		this.$modalTitle.html(this.messages.error);
		this.$modalErrorCode.html("TODO failMsg");
		this.showModal(i);
		this.hideImage(i);
	}

	invalidSize(i) {
		this.$modalErrorMessage.html(this.messages.invalidSize);
		this.$modalTitle.html(this.messages.error);
		this.$modalErrorCode.html("TODO invalidSize");
		this.hideImage(i);
		this.showModal();
	}

	invalidType(i) {
		// special case for invalid file type
		this.$messageModal.addClass("isInvalidType");
		this.$modalErrorMessage.html(this.messages.invalidType);
		this.$modalTitle.html(this.messages.unsupportedFileTitle);
		this.$messageModal.find(".error-modal-footer .sudolink").html(this.messages.uploadDiffPhoto);
		this.hideImage(i);
		this.showModal();
	}

	invalidDimensions(i) {
		this.$modalErrorMessage.html(this.messages.invalidDimensions);
		this.$modalTitle.html(this.messages.error);
		this.$modalErrorCode.html("TODO invalidDimensions");
		this.hideImage(i);
		this.showModal();
	}

	firewall(i) {
		this.$modalErrorMessage.html(this.messages.firewall);
		this.$modalTitle.html(this.messages.error);
		this.$modalErrorCode.html("TODO firewall");
		this.hideImage(i);
		this.showModal();
	}

	colorspace(i) {
		this.$modalErrorMessage.html(this.messages.colorspace);
		this.$modalTitle.html(this.messages.error);
		this.$modalErrorCode.html("TODO colorspace");
		this.hideImage(i);
		this.showModal();
	}

	corrupt(i) {
		this.$modalErrorMessage.html(this.messages.corrupt);
		this.$modalTitle.html(this.messages.error);
		this.$modalErrorCode.html("TODO corrupt");
		this.hideImage(i);
		this.showModal();
	}

	loadingMsg() {
		this.$modalErrorMessage.html(this.messages.loadingMsg);
	}

	resizing() {
		this.$modalErrorMessage.html(this.messages.resizing);
		this.$modalTitle.html(this.messages.error);
		this.$modalErrorCode.html("TODO resizing");
	}

	pictureSrv() {
		this.$modalErrorMessage.html(this.messages.pictureSrv);
	}

	translateErrorCodes(i, error) {
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
}

module.exports = {
	PostAdErrorModalClass
};
