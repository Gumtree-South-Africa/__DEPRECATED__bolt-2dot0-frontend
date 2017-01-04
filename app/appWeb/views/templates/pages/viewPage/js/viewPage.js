'use strict';

let viewPageGallery = require('app/appWeb/views/components/viewPageGallery/js/viewPageGallery.js');

// BEGIN: fix for 2, 3, 4 and 5 images
let constImgLength = parseInt($('.container .counter').attr('data-image-length'));

if (constImgLength > 5) {
	constImgLength = 5;
} else if (constImgLength >= 2) {
	let $cloneImg = $('.container .slider-nav').clone().html();
	let $cloneImgOverlay = $('#vipOverlay .slider-nav').clone().html();
	let $cloneImgFor = $('.container .slider-for').clone().html();
	let $cloneImgOverlayFor = $('#vipOverlay .slider-for').clone().html();
	$('.container .slider-nav').append($cloneImg);
	$('#vipOverlay .slider-nav').append($cloneImgOverlay);
	$('.container .slider-for').append($cloneImgFor);
	$('#vipOverlay .slider-for').append($cloneImgOverlayFor);
}

switch (constImgLength) {
	case 1:
		$('.slider-nav').addClass('col1');
		break;
	case 2:
		$('.slider-nav').addClass('col2');
		break;
	case 3:
		$('.slider-nav').addClass('col3');
		break;
	case 4:
		$('.slider-nav').addClass('col4');
		break;
	default:
		break;
}
//END

function showPostOverlayIfNeeded() {
	let postOverlayFlag = $('.from-post-flag');
	if (!postOverlayFlag.length) {
		return;
	}
	let shouldShowPostOverlay = postOverlayFlag.val();
	if (shouldShowPostOverlay !== 'true') {
		return;
	}
	let postMoreText = postOverlayFlag.data('post-more-text');
	if (postMoreText) {
		$('.welcome-wrapper .btn .sudolink').text(postMoreText);
	}
	$('.welcome-wrapper .modal').addClass('post-overlay');

	// Click on any modal should close both ones
	$('.post-overlay .modal-close-section').on('click', () => {
		// Attention if modal is not shown as a result of media query, fadeOut will do nothing.
		// So a css setting is added to ensure the result.
		$('.welcome-wrapper .modal').fadeOut('slow', () => {
			$('.welcome-wrapper .modal').removeClass('modal');
			$('.welcome-wrapper .modal').css('display', 'none');
		});
		$('.post-overlay.desktop-only').fadeOut('slow', () => {
			$('.post-overlay.desktop-only').css('display', 'none');
		});
	});
}

function incrementViewCount() {
	// TODO Get it from other places or from URL
	let adId = $('input[name="adId"]').val();
	if (!adId) {
		return;
	}

	$.ajax({
		url: `/api/view/${adId}/inc-view-count`,
		type: 'POST',
		data: '{}',	// Currently no content needed
		dataType: 'json',
		contentType: 'application/json'
	});
	// Currently we don't take further action no matter whether it's success or not
}


let initialize = () => {
	$('.header-back-page').removeClass('hidden');
	$('.header-back-component').addClass('hidden');
	viewPageGallery.initialize(constImgLength);
	showPostOverlayIfNeeded();
	incrementViewCount();
};

module.exports = {
	initialize
};
