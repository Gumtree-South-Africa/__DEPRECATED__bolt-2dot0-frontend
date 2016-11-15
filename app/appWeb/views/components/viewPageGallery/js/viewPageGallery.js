'use strict';

require("slick-carousel");
require("jquery-zoom");

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

		this.$pageClassId = $('#viewPage');
		this.$vipGallery = $('#vipGallery');

		// Slick setup
		this.$vipGallery.find('.vip-gallery').not('.slick-initialized').slick(options.slickOptions);

		//testing zoom
		$('.test').on('click', () => {

			$('.test').zoom({
				url: 'https://i.ebayimg.com/00/s/NDMwWDY0MA==/z/qvAAAOSwmLlX6QqV/$_20.JPG',
				on:'click',
				callback: function() {
					console.log('zoooooooooommmmmjjsjs');
				}
			});

		});

		this.$vipGallery.find('.slick-arrow').addClass('icon-back');
		this.$vipGallery.find('.slick-carousel.slick-slide[data-slick-index=0]').addClass('selected');

		this.$pageClassId.on('click', '.slick-slide', (evt) => {
			evt.stopPropagation();
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

		this.$pageClassId.find('#vipOverlay').on('click', '.slick-next, .slick-prev', (evt) => {
		 evt.stopPropagation();
		 evt.preventDefault();
		 return false;
		});

		this.$vipGallery.find('#vipOverlay').on('click', '.slick-next, .slick-prev', (evt) => {
			evt.stopPropagation();
			evt.preventDefault();
			if($(evt.target).hasClass('slick-next')) {
			 	this.$pageClassId.find('.slick-next').trigger('click');
			} else {
				this.$pageClassId.find('.slick-prev').trigger('click');
			}
		  return false;
		});

		this.$vipGallery.find('.vip-gallery').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
				event.stopPropagation();
				event.preventDefault();
				let isMobile = (this.$vipGallery.find('.main-bgImg').css('display') === 'none');
				let count = parseInt(this.$vipGallery.find('.counter').attr('data-image-length'));
				if(isMobile) {
					this.updatePhotoCounter(nextSlide, count);
				}
				return false;
		});

		this.$vipGallery.find('.vip-gallery').on('breakpoint', () => {
			$('.slick-arrow').addClass("icon-back");
		});

		this.$vipGallery.find('.main-bgImg').on('click', (evt) => {
			evt.stopPropagation();
			evt.preventDefault();
			let slickIdx = this.$vipGallery.find('.slick-carousel.selected').attr('data-slick-index');
			this.$pageClassId.find('#vipOverlay').find(`.slick-carousel[data-slick-index=${slickIdx}]`).addClass('selected');
			$('#vipOverlay').removeClass('hidden');
			$('#vipOverlay .vipOverlay-container').not('.slick-initialized').slick(options.slickOptions);
			$('.slick-arrow').addClass("icon-back");
		});

		this.$vipGallery.on('click', '.slick-carousel', () => {
			let isMobile = (this.$vipGallery.find('.main-bgImg').css('display') === 'none');
			if(isMobile){
				this.updateImageHeight();
			}
		});

		this.$pageClassId.find('#vipOverlay .slick-carousel').on('click', (evt) => {
			let slickIdx = $(evt.target).attr('data-slick-index');
			let elt = this.$vipGallery.find(`.slick-carousel[data-slick-index=${slickIdx}]`);
			elt.className += " otherclass";
		});

		//to refactor
		$('.modal-closearea').on('click', () => {
			$('#vipOverlay').addClass('hidden');
		});

		$(document).on('keyup', (evt) => {
			switch (evt.keyCode) {
				//escape
				case 27:
					this._escapeFn();
					break;
				//left arrow
				case 37:
					$('#vipOverlay').find('.slick-prev').trigger('click');
					this.$vipGallery.find('.slick-prev').trigger('click');
					break;
				//right arrow
				case 39:
					$('#vipOverlay').find('.slick-next').trigger('click');
					this.$vipGallery.find('.slick-next').trigger('click');
					break;
				default:
					break;
			}
		});

	}

	updateMainImage(event) {
			let bgImg = $(event.target).context.style.backgroundImage;
			this.$pageClassId.find('.bgImg').css('background-image', bgImg);
	}

	updatePhotoCounter(idx, count) {
		if(((idx + 1) % count) === 0) {
			count = count+1;
		}
		this.$vipGallery.find('.counter .currentImg').html((idx+1)%count);
	}

	updateImageHeight() {
		//let imgHeight = $(window).height() - $('.header-wrapper').height() - 90; //90 is the height of the white area with the text on the bottom
		let fullImgHeight = $(window).height() - 90;
		$('.header-wrapper').addClass('hidden');
		$('body').addClass('noScroll');
		this.$vipGallery.find('.slick-slide').addClass('fullsize').css('height', fullImgHeight);
		this.$vipGallery.find('.vip-bottom-container').removeClass('hidden');
	}

	_escapeFn() {
		if (!$('#vipOverlay').hasClass('hidden')) {
			$('#vipOverlay').addClass('hidden');
		}
	}

}

module.exports = new viewPageGallery ();
