'use strict';

let Swiper = require("swiper");
let PhotoContainer = require('app/appWeb/views/components/photoContainer/js/photoContainer.js');

class PhotoContainerMobile extends PhotoContainer {

	constructor() {
		super();
	}

	getPageTypeSelect() {
		return ".initPageType";
	}

	getPhotoDivSelect() {
		return ".cover-photo-big";
	}

	updatePhotoDivBackgroundImg(urlNormal) {
		super.updatePhotoDivBackgroundImg(urlNormal);
		this.swiper.slideTo(this.latestPosition-1, 1000, false);
	}

	syncImages(urls) {
		super.syncImages(urls);
		this.swiper.slideTo(this.latestPosition-1, 1000, false);
	}

	uploadImageShowSpinner() {
		super.uploadImageShowSpinner();
		this.swiper.slideTo(this.latestPosition, 1000, false);
	}

	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param
	 */
	initialize(options, docElement) {
		this.$photoContainer = $(docElement.find(".photo-container-mobile"));
		this.swiper = new Swiper('.swiper-container', {
			pagination: '.swiper-pagination',
			effect: 'coverflow',
			grabCursor: true,
			centeredSlides: true,
			slidesPerView: 'auto',
			//loop: true,
			coverflow: {
				rotate: 50,
				stretch: 0,
				depth: 100,
				modifier: 1,
				slideShadows : true
			}
		});
		super.initialize(options, this.$photoContainer);
		this.$imageUrls = $(this.$photoContainer.find(".imgUrls"));

		$(this.$photoContainer.find(".delete-wrapper")).on('click', (e) => {
			e.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": this.pageType + "PhotoRemove"});
			let imageDiv = $(e.target.parentNode.parentNode);
			let urlNormal = imageDiv.attr("data-image");
			imageDiv.attr("data-image","");
			imageDiv.css("background-image", "").toggleClass("no-photo", true);

			if (this.getImageCount() === 0) {
				this.$postAdButton.toggleClass("disabled", true);
			}
			let imgUrls = JSON.parse(this.$imageUrls.text() || "[]");
			let position = imgUrls.indexOf(urlNormal);
			if (position !== -1) {
				imgUrls[position] = null;
				this.$imageUrls.html(JSON.stringify(imgUrls));
				this.$imageUrls.click();
			}
		});

		// Clicking empty cover photo OR 'add photo' carousel item should open file selector
		$(this.$photoContainer.find(".swiper-slide")).on('click', (e) => {
			let url = $(e.currentTarget).css("background-image");
			if (url !== 'none') {
				return; // With image click disable
			}
			this.clickFileInput();
		});
		// Makesure first slide is display
		this.swiper.slideTo(0, 1000, false);
	}
	/**
	 * Display spinner when uploading image
	 * @private
	 */
	_uploadImageShowSpinner() {
		this._updateLatestPhotoPosition();
		let photoDiv = $(this.$photoContainer.find(this.getPhotoDivSelect()));
		let coverPhoto = $(photoDiv[this.latestPosition]);
		$(coverPhoto.find('.add-photo-text')).toggleClass('spinner',true);
	}
}

module.exports = new PhotoContainerMobile();
