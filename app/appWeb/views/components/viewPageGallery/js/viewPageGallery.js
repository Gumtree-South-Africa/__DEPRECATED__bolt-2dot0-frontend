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
				let imgSrc= $('.slider-mobile-for .slick-current').attr('src');
				let pzContents = `<img src='#' data-src='${imgSrc}' data-elem='bg'/>`;
				let pzContent = $("<div id='pzDiv" + "' class='row-fluid text-center' style='padding-top:10px'><div class='span6 offset3' style='border: 1px solid #EEE;'><div class='text-center' style='position:relative'><div id='pz" + "' style='overflow:hidden'>" + pzContents + "</div></div></div></div>");

			  $(".zoomHolder").append(pzContent);
				$("#pz").pinchzoomer();

				$(`.zoomHolder img[src="${imgSrc}"]`).parent('.zoomHolder').removeClass('hidden');
				$('.slider-mobile-for, .welcome-wrapper, .counter, .isMobile .icon-Zoom').addClass('hidden');
				$('body').addClass('noScroll');
				$('.zoomHolder').addClass('zoomview');
				$('.zoomT').removeClass('hidden');

				this.title = $('.post-ad-header .title-text').html();
				$('.post-ad-header .title-text').html('ZOOM VIEW');
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

		$('.post-ad-header .header-back').on('click', (event) => {
			this.backFn(event);
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
		let fullImgHeight = $(window).height() - 90; //90 is the height of the white area with the text on the bottom
		$('body').addClass('noScroll');
		$('.ZoomI').removeClass('hidden').addClass('fullsize').css('height', fullImgHeight);
		$('.ZoomI img').css('height', fullImgHeight*2);
	}

	backFn(event) {
		if($('.zoomHolder.zoomview').length > 0) {
			event.preventDefault();
			event.stopPropagation();
			$('.zoomT').addClass('hidden');
			$('.slider-mobile-for, .welcome-wrapper, .counter, .icon-Zoom').removeClass('hidden');
			$('body').removeClass('noScroll');
			$('.zoomHolder').removeClass('zoomview');
			$('.post-ad-header .title-text').html($('.item-details .ad-title').html());
			$('.zoomHolder').html('');
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

}

module.exports = new viewPageGallery ();
