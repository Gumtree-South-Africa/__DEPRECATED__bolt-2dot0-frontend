'use strict';

require("slick-carousel");

let initSlick = () => {
	$("#photo-carousel").slick({
		arrows: true,
		infinite: false,
		slidesToShow: 3,
		slidesToScroll: 3
	});
};

let unSlick = () => {
	$("#photo-carousel").slick('unslick');
};

// For each carousel item, set backgroundImage from data-image
let updateCarouselImages = () => {
	let cItems = document.querySelectorAll(".carousel-item[data-image]");
	cItems.forEach((item) => {
		let url = item.getAttribute('data-image');
		item.style.backgroundImage="url('" + url + "')";
	});
};

// Add new carousel item to carousel
let addCarouselItem = (imageUrl) => {
	// undo slick before DOM manipulation
	// TODO - possibly move this to GET image url callback?
	unSlick();
	$('#photo-carousel').prepend('<div class="carousel-item" data-image="' +
		imageUrl + '"></div>');

	// re-init slick to fix measurements
	// TODO - possibly move this out and call once all items are added
	initSlick();
};

let setCarouselItemHeight = () => {
	// set height of carousel items to be same as width (set by slick)
	let width = $('.add-photo-item, .carousel-item').width();
	if (width > 0) {
		$('.add-photo-item, .carousel-item').css({'height': width + 'px'});
	}
};

let initialize = () => {
	initSlick();

	//TODO - remove hard coded carousel items
	addCarouselItem("https://i.ytimg.com/vi/rb8Y38eilRM/maxresdefault.jpg");
	addCarouselItem("http://www.w3schools.com/css/trolltunga.jpg");
	addCarouselItem("https://i.vimeocdn.com/portrait/3598236_300x300");
	addCarouselItem("http://pauillac.inria.fr/~harley/pics/square.gif");

	// init carousel item images and heights
	updateCarouselImages();
	setCarouselItemHeight();

	// When page resizes, redo carousel item dimensions
	$(window).resize(setCarouselItemHeight);

	// click handler for changing the ad cover photo
	$(".carousel-item").on('click', (event) => {
		let data = $(event.target).data();
		let coverPhoto = $('.cover-photo');
		coverPhoto[0].style.backgroundImage="url('" + data.image + "')";
		coverPhoto.removeClass("no-photo");

		// remove 'selected' class from other items and add to new target
		let cItems = document.querySelectorAll(".carousel-item");
		cItems.forEach((item) => {
			$(item).removeClass('selected');
		});
		$(event.target).addClass("selected");
	});
};

module.exports = {
	initialize
};



