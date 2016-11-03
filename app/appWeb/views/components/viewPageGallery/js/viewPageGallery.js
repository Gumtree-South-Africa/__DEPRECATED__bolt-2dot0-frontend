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
					arrows: true,
					dots: false,
					infinite: true,
					slidesToShow: 1,
					slidesToScroll: 1
				},
			};
		}

		this.$vipGallery = $('#vipGallery');

		// Slick setup
		this.$vipGallery.find('.vip-gallery').not('.slick-initialized').slick(options.slickOptions);

		this.$vipGallery.find('.slick-arrow').addClass('icon-back');

		this.$vipGallery.find('.slick-slide').on('click', (evt) => {
			let isMobile = (this.$vipGallery.find('.main-bgImg').css('display') === 'none');
			let count = parseInt(this.$vipGallery.find('.counter').attr('data-image-length'));
			let cItems = document.querySelectorAll('.slick-carousel');

			[].forEach.call(cItems, (item) => {
				$(item).removeClass('selected');
			});

			$(evt.target).addClass('selected');
			this.updateMainImage(evt);
			if(!isMobile) {
				this.updatePhotoCounter(parseInt($(evt.target).attr('data-slick-index')), count);
			}
		});

		this.$vipGallery.find('.vip-gallery').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
				event.stopPropagation();
				event.preventDefault();
				let isMobile = (this.$vipGallery.find('.main-bgImg').css('display') === 'none');
				let count = parseInt(this.$vipGallery.find('.counter').attr('data-image-length'));
				if(isMobile) {
					this.updatePhotoCounter(nextSlide, count);
				}
		});

		this.$vipGallery.find('.vip-gallery').on('breakpoint', () => {
			$('.slick-arrow').addClass("icon-back");
		});

		this.$vipGallery.find('.main-bgImg').on('click', (evt) => {
			evt.stopPropagation();
			evt.preventDefault();
			//this.$vipGallery.find('.vip-gallery').clone().appendTo('#vipOverlay .vipOverlay-container');
			$('#vipOverlay .vipOverlay-container').not('.slick-initialized').slick(options.slickOptions);
			$('#vipOverlay').removeClass('hidden');
			$('.slick-arrow').addClass("icon-back");
		});

		//to refactor
		$('.modal-closearea').on('click', () => {
			$('#vipOverlay').addClass('hidden');
		});

		$(document).on('keyup', (evt) => {
			if (evt.keyCode === 27 && !($('#vipOverlay').hasClass('hidden'))) {
				$('#vipOverlay').addClass('hidden');
			}
		});
	}

	updateMainImage(event) {
			let bgImg = $(event.target).context.style.backgroundImage;
			this.$vipGallery.find('.main-bgImg').css('background-image', bgImg);
	}

	updatePhotoCounter(idx, count) {
		if(((idx + 1) % count) === 0) {
			count = count+1;
		}
		this.$vipGallery.find('.counter .currentImg').html((idx+1)%count);
	}

}

module.exports = new viewPageGallery ();
