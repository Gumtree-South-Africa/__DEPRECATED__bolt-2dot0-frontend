'use strict';

require("slick-carousel");

class viewPageGallery {

	/**
	* sets up all the variables and two functions (success and failure)
	* these functions are in here to be properly bound to this
	* @param options
	*/
	initialize() {

		const MEDIUM_BREAKPOINT = 848;

		$('.slider-for').not('.slick-initialized').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: false,
			fade: true,
			infinite: true,
			responsive: [
				{
					breakpoint: MEDIUM_BREAKPOINT,
					settings: {
						dots: true
					}
				}
			],
			asNavFor: '.slider-nav'
		});

		$('.slider-nav').not('.slick-initialized').slick({
			slidesToShow: 5,
			slidesToScroll: 1,
			//lazyLoad: 'ondemand',
			asNavFor: '.slider-for',
			focusOnSelect: true,
			arrows: true,
			infinite: true
		});


		$('.slick-arrow').addClass('icon-back');
		$('.slider-nav .slick-current').addClass('selected');

		$('.modal-closearea').on('click', () => {
			this._escapeFn();
		});

		$('.container').on('click', '.slider-for', () => {
			let isMobile = $('.container .slider-nav').css('display') === 'none';
			if(isMobile) {
				//$('.zoomT').removeClass('hidden');
				//this.updateCarouselHeight();
				//$(evt.target);
				//let cloneImg = $('.container .slider-for .slick-current img').clone();
				//$('.ZoomI').html(cloneImg);
				//this.updateZoomImageHeight();
			} else {

				let slickIdx = $('.container .slider-for .slick-current').attr('data-slick-index');
				$('#vipOverlay .slider-nav').slick('setPosition');
				$('#vipOverlay .slider-for').slick('setPosition');
				$('#vipOverlay .slider-nav').slick('slickGoTo', parseInt(slickIdx));
				$('#vipOverlay').removeClass('hidden').find('.slick-list').focus();
				$('#vipOverlay').find('.slider-nav').slick('slickCurrentSlide');
				$('body').addClass('noScroll');
			}
		});

		$('.slider-nav').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
			event.stopPropagation();
			event.preventDefault();
			let count = parseInt($('.counter').attr('data-image-length'));
			this.updatePhotoCounter(nextSlide, count);
			return false;
		});

		$('.ZoomI').on('click doubleTap', (event) => {
			event.stopPropagation();
			event.preventDefault();
			$('.ZoomI').addClass('hidden');
			$('body').removeClass('hidden');
		});

		$(document).on('keyup', (evt) => {
			switch (evt.keyCode) {
				//escape key
				case 27:
				this._escapeFn();
				break;
				default:
				break;
			}
		});

	}

	updatePhotoCounter(idx, count) {
		if(((idx + 1) % count) === 0) {
			count = count+1;
		}
		$('.counter .currentImg').html((idx+1)%count);
	}

	updateCarouselHeight() {
		let fullImgHeight = $(window).height() - 90; //90 is the height of the white area with the text on the bottom
		$('body').addClass('noScroll');
		$('.container .slider-for').addClass('fullsize').css('height', fullImgHeight);
		//$('.ZoomI').css('height', fullImgHeight);
		//$('.ZoomI img').css('height', fullImgHeight*2);
	}

	updateZoomImageHeight() {
		let fullImgHeight = $(window).height() - 90; //90 is the height of the white area with the text on the bottom
		$('body').addClass('noScroll');
		$('.ZoomI').removeClass('hidden').addClass('fullsize').css('height', fullImgHeight);
		$('.ZoomI img').css('height', fullImgHeight*2);
	}

	_escapeFn() {
		if (!$('#vipOverlay').hasClass('hidden')) {
			let slickIdx = $('#vipOverlay .slider-for .slick-current').attr('data-slick-index');
			$('#vipOverlay').addClass('hidden');
			$('body').removeClass('noScroll');
			$('.container .slider-nav').slick('slickGoTo', slickIdx);
		}
	}

}

module.exports = new viewPageGallery ();
