'use strict';

require("slick-carousel");

class viewPageGallery {

	/**
	 * sets up all the variables and two functions (success and failure)
	 * these functions are in here to be properly bound to this
	 * @param options
	 */
	initialize(options) {
		if (!options) {
			options = {
				slickOptions: {
					arrows: false,
					infinite: false,
					slidesToShow: 1,
					slidesToScroll: 1
				},
			};
		}

		this.$vipGallery = $('#vipGallery');

		// Slick setup
		this.$vipGallery.find('.vip-gallery').slick(options.slickOptions);

		this.$vipGallery.find('.slick-arrow').addClass('icon-back');

		this.$vipGallery.find('.slick-slide').on('click', (evt) => {
			let cItems = document.querySelectorAll('.slick-carousel');
				[].forEach.call(cItems, (item) => {
					$(item).removeClass('selected');
				});
				$(evt.target).addClass('selected');
				this.updateMainImage(evt);
				this.updatePhotoCounter($(evt.target).context.attributes[2].value);
		});

		this.$vipGallery.find('.vip-gallery').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
				this.updatePhotoCounter(nextSlide);
		});


	}

	updateMainImage(event) {
			let bgImg = $(event.target).context.style.backgroundImage;
			this.$vipGallery.find('.main-bgImg').css('background-image', bgImg);
	}

	updatePhotoCounter(idx) {
		this.$vipGallery.find('.counter .currentImg').html(++idx);
	}

	//for Zoom
	backgroundImageHeight() {
		let bgHeight = this.$vipGallery.find('.vip-gallery').height() - (this.$vipGallery.find('.bottom-overlay').eq(1).height()) * 2;
		this.$vipGallery.find('.slick-carousel.selected').height(bgHeight);
	}

}

module.exports = new viewPageGallery ();
