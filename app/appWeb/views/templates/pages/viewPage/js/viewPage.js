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


let initialize = () => {
	viewPageGallery.initialize(constImgLength);
};

module.exports = {
	initialize
};
