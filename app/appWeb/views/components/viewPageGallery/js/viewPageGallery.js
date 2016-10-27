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

		this.$vipGallery.find('.vip-gallery').on('breakpoint', () => {
			this.resizeCarousel();
		});

		this.$vipGallery.find('.slick-slide').on('click', (evt) => {
			let cItems = document.querySelectorAll('.slick-carousel');
			[].forEach.call(cItems, (item) => {
				$(item).removeClass('selected');
			});
			$(evt.target).addClass('selected');
			this.updateMainImage(evt);
			this.updatePhotoCounter($(evt.target).context.attributes[2].value);
		});

		this.$vipGallery.find('.main-bgImg, .slick-carousel').on('click', (evt) => {
			let bgImg = $(evt.target).context.style.backgroundImage;
			$('body').addClass('noScroll');

			this.$vipGallery.find('.overlay-img').css('background-image', bgImg);
			this.$vipGallery.find('.vip-overlay').removeClass('hidden');

		});


	}

	resizeCarousel() {
		$('#vipGallery .vip-gallery').slick('unslick');
		$('#vipGallery .vip-gallery').slick({
		  slidesToShow: 3,
		  slidesToScroll: 1,
		});
	}

	updateMainImage(event) {
			let bgImg = $(event.target).context.style.backgroundImage;
			this.$vipGallery.find('.main-bgImg').css('background-image', bgImg);
	}

	updatePhotoCounter(idx) {
		this.$vipGallery.find('.counter .currentImg').html(++idx);
	}

	displayOverlay() {

	}

}

module.exports = new viewPageGallery ();
