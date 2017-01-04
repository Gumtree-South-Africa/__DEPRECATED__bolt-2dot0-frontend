'use strict';

require("slick-carousel");
let PhotoContainer = require('app/appWeb/views/components/photoContainer/js/photoContainer.js');

let isPhotoDivAndDraggable = function(target) {
	let isSmallPhoto = $(target).hasClass("cover-photo-small");
	let url = $(target).css("background-image");
	return (isSmallPhoto && url !== 'none') ;
};

class PhotoContainerDesktop extends PhotoContainer {

	constructor() {
		super();
		this.hasUpdatedLayout = false;
	}

	getPageTypeSelect() {
		return ".initPageType";
	}

	getPhotoDivSelect() {
		return ".cover-photo-small";
	}

	/**
	 * Display spinner when uploading image
	 */
	uploadImageShowSpinner() {
		super.uploadImageShowSpinner();
		if (this.latestPosition === 0) {
			$(this.$initialPhoto.find('.add-photo-text')).toggleClass('spinner',true);
		}
	}

	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param
	 */
	initialize(options, docElement) {
		super.initialize(options, $(docElement.find(".photo-container-desktop")));
		$(docElement.find(this.getPageTypeSelect())).html(options ? options.pageType : "");
		this.$photoContainer = $(docElement.find(".photo-container-desktop"));
		this.$initialPhoto = $(this.$photoContainer.find(".cover-photo-big"));
		this.$imageUrls = $(this.$photoContainer.find(".imgUrls"));
		this.$photoSwitcher = docElement;

		// Clicking empty cover photo OR 'add photo' carousel item should open file selector
		this.$initialPhoto.on('click', () => {
			this.clickFileInput();
		});
	}

	/**
	 * Change photo container layout when upload first image
	 */
	updatePhotoContainerLayout() {
		if (this.hasUpdatedLayout) {
			return;
		}
		// 1.Using the first camera photo div as template
		let newDiv = this.$initialPhoto.clone();
		// 2.Adjust style for multiple photo laylout
		newDiv.removeClass("cover-photo-big").addClass("cover-photo-small").attr("draggable", "true");
		newDiv.find(".add-photo-text").css("font-size", "small");
		$(newDiv.find(".add-photo-text")).toggleClass('spinner',false);
		// 3.Hide the first camera photo div
		this.$initialPhoto.hide();
		$(this.$photoSwitcher.find(".photo-limits")).hide();
		// 4.Create multiple photo upload layout
		for (let j = 1; j <= this.allowedUploads; j++) {
			newDiv.attr("id", "");
			this._bindEventToNewPhotoUploadDiv(newDiv);
			this.$initialPhoto.parent().append(newDiv);
			newDiv=newDiv.clone();
		}
		$(this.$photoSwitcher).toggleClass("photo-container-start", false);
		$(this.$photoSwitcher.find(".drag-reorder")).toggleClass("hidden", false);
		this.hasUpdatedLayout = true;
	}

	/**
	 * Bind event to later cloned new photo div
	 * @private
	 */
	_bindEventToNewPhotoUploadDiv(newDiv) {
		newDiv.on('click', () => {
			let url = newDiv.css("background-image");
			if (url !== 'none') {
				return; // With image click disable
			}
			this.clickFileInput();
		});
		newDiv.find(".delete-wrapper").on('click', (e) => {
			e.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": this.pageType + "PhotoRemove"});
			let imageDiv = $(e.target.parentNode.parentNode);
			let urlNormal = imageDiv.attr("data-image");
			imageDiv.attr("data-image","");
			imageDiv.css("background-image", "").toggleClass("no-photo", true);

			if (this.getImageCount() === 0) {
				this.$postAdButton.toggleClass("disabled", true);
			}
			let imgUrls = JSON.parse($(this.$imageUrls).text() || "[]");
			let position = imgUrls.indexOf(urlNormal);
			if (position !== -1) {
				imgUrls[position] = null;
				this.$imageUrls.html(JSON.stringify(imgUrls));
				this.$imageUrls.click();
			}
		});

		/*
		* Drag and Reorder event start
		* */
		document.addEventListener("drag", function() {
		}, false);

		document.addEventListener("dragstart", function( event ) {
			if (!isPhotoDivAndDraggable(event.target)) {
				return;
			}
			if (event.dataTransfer) {
				event.dataTransfer.setData("text/plain", "Workaround for FireFox!");
			}
			// store a ref. on the dragged elem
			this.PhotoContainerDragged = event.target;
			// make it half transparent
			event.target.style.opacity = .5;
		}, false);

		document.addEventListener("dragend", function( event ) {
			if (!isPhotoDivAndDraggable(event.target)) {
				return;
			}
			// reset the transparency
			event.target.style.opacity = "";
		}, false);

		/* events fired on the drop targets */
		document.addEventListener("dragover", function( event ) {
			event.preventDefault();
		}, false);
		document.addEventListener("dragenter", function() {
		}, false);
		document.addEventListener("dragleave", function() {
		}, false);
		document.addEventListener("drop", function( event ) {
			if (!isPhotoDivAndDraggable(event.target)) {
				return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();

			window.BOLT.trackEvents({"event": $(".initPageType").text() + "PhotoReorder"});

			// 1.Swap background
			let toBackgroundUrl = $(event.target).css("background-image");
			let fromBackgroundUrl = $(this.PhotoContainerDragged).css("background-image");
			$(event.target).css("background-image", fromBackgroundUrl);
			$(this.PhotoContainerDragged).css("background-image", toBackgroundUrl);

			// 2.Swap image array
			let imgUrls = JSON.parse($(this.$imageUrls).text() || "[]");
			let toImg = $(event.target).attr("data-image");
			let toIndex = imgUrls.indexOf(toImg);
			let fromImg = $(this.PhotoContainerDragged).attr("data-image");
			let fromIndex = imgUrls.indexOf(fromImg);
			$(event.target).attr("data-image", fromImg);
			$(this.PhotoContainerDragged).attr("data-image", toImg);
			imgUrls[toIndex] = fromImg;
			imgUrls[fromIndex] = toImg;
			$(this.$imageUrls).html(JSON.stringify(imgUrls));
			// 3.Trigger image array change event
			this.$imageUrls.click();
		}, false);

		/*
		 * Drag and Reorder event end
		 * */
	}
}

module.exports = new PhotoContainerDesktop();
