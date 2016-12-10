'use strict';

require("slick-carousel");

class viewPageGallery {

	/**
	* sets up all the variables and two functions (success and failure)
	* these functions are in here to be properly bound to this
	* @param options
	*/
	initialize(imgLength) {

		const MEDIUM_BREAKPOINT = 848;
		$('.slider-mobile-for').not('.slick-initialized').slick({
			dots: true,
			arrows: false,
			infinite: true
		});

		$('.slider-for').not('.slick-initialized').slick({
			arrows: false,
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
			slidesToShow: imgLength,
			//slidesToShow: 1,
			slidesToScroll: 1,
			asNavFor: '.slider-for',
			focusOnSelect: true,
			arrows: true,
			infinite: true
		});

		//Initialize
		$('.slick-arrow').addClass('icon-back');
		$('.slider-nav .slick-current').addClass('selected');

		//this is a fix for BOLT-25136: PM wants to always have ellipsis after 60 characters.
		//Using CSS and max-width does not always give 60 since we have word-wrap etc...
		if($('.item-details .ad-title').html().length > 60) {
			$('.post-ad-header .title-text').html(this._substring($('.item-details .ad-title').html()));
		}

		$('.container .slider-nav .slick-current').focus();

		$('.modal-closearea').on('click', () => {
			this._escapeFn();
		});

		$('.container').on('click', '.slider-for, .slider-mobile-for, .icon-Zoom', () => {
			let isMobile = ($('.slider-mobile-for').length > 0);
			if(!isMobile) {
				let slickIdx = $('.container .slider-for .slick-current').attr('data-slick-index');
				$('#vipOverlay .slider-nav').slick('setPosition');
				$('#vipOverlay .slider-for').slick('setPosition');
				$('#vipOverlay .slider-nav').slick('slickGoTo', parseInt(slickIdx));
				$('#vipOverlay').removeClass('hidden');
				$('#vipOverlay .slider-nav .slick-current').focus();
				$('#vipOverlay').find('.slider-nav').slick('slickCurrentSlide');
				$('body').addClass('noScroll');
			} else {
				//isMobile
				window.scrollTo(0,0);
				 $('.welcome-wrapper, .isMobile .icon-Zoom, .header-back').addClass('hidden');
				 $('.zoomT, .inZoomMode').removeClass('hidden');
				 $('body').addClass('noScroll');
				 $('.post-ad-header .title-text').html('ZOOM VIEW');
				 $('.zoomHolder').addClass('zoomview');
				 this.updateZoomImageHeight();
			}
		});


		//Fix for when user don't have lots of images
		$('.slick-slide').on('click', (evt) =>{
			let nextSlide = parseInt($(evt.target).attr('data-slick-index')) || 0;
			this._noArrows(nextSlide);
		});

		$('.slider-nav, .slider-mobile-for').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
			event.stopPropagation();
			event.preventDefault();
			let count = parseInt($('.counter').attr('data-image-length'));
			this.updatePhotoCounter(nextSlide, count);
			return false;
		});

		$('.header-wrapper').on('click', '.post-ad-header .header-back', () => {
			this.backFn();
		});

		$('.header-wrapper').on('click', '.inZoomMode', () => {
			this.backFromZoomFn();
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
		if(idx > count) {
			count = count + 1;
			idx = idx - 1;
			$('.counter .currentImg').html((idx)%count);
			return false;
		}
		if(((idx + 1) % count) === 0) {
			count = count+1;
		}
		$('.counter .currentImg').html((idx+1)%count);

	}

	updateCarouselHeight() {
		let fullImgHeight = $(window).height() - 90; //90 is the height of the white area with the text on the bottom
		$('body').addClass('noScroll');
		$('.container .slider-for').addClass('fullsize').css('height', fullImgHeight);
	}

	updateZoomImageHeight() {
		let fullImgHeight = $(window).height() - ($('.header-wrapper').height() + $('.zoomT').height());
		$('.slider-mobile-for .slick-slide').css("height", fullImgHeight);
		$('.carousel-images.extra').css("height", fullImgHeight - 50);
	}

	backFromZoomFn() {
		if($('.zoomHolder').is('.zoomview')) {
			$('.welcome-wrapper, .isMobile .icon-Zoom, .header-back').removeClass('hidden');
			$('.zoomT, .inZoomMode').addClass('hidden');
			$('body').removeClass('noScroll');
			$('.zoomHolder').removeClass('zoomview');
			$('.post-ad-header .title-text').html(this._substring($('.item-details .ad-title').html()));
			return false;
		}
	}

	backFn() {
		// not in Zoom view
		if (document.referrer.indexOf(window.location.host) !== -1) {
			window.location.href = $('.header-back a').attr('href');
		} else {
			history.go(-1);
			return false;
		}
	}

	_noArrows(nextSlide) {
		if($('.slick-next').length <= 0) {
			let count = parseInt($('.counter').attr('data-image-length'));
			this.updatePhotoCounter(nextSlide, count);
			return false;
		}
	}

	_escapeFn() {
		if (!$('#vipOverlay').hasClass('hidden')) {
			let slickIdx = $('#vipOverlay .slider-for .slick-current').attr('data-slick-index');
			$('#vipOverlay').addClass('hidden');
			$('body').removeClass('noScroll');
			$('.container .slider-nav').slick('slickGoTo', slickIdx);
			$('.container .slider-nav .slick-current').focus();
		}
	}

	_substring(title) {
		let isMobile = ($('.slider-mobile-for').length > 0);
		let indxChar = (isMobile) ? title.length : 60;
		let subtitle = title.substring(0,indxChar) + " ...";
		return subtitle;
	}

}

module.exports = new viewPageGallery ();
