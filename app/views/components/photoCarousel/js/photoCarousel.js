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

let resizeCarousel = () => {
	let width = $('.add-photo-item, .carousel-item').width();
	//fix issue where images would sometimes be very small
	if (width > 10) {
		// set height of carousel items to be same as width (set by slick)
		$('.add-photo-item, .carousel-item').css({'height': width + 'px'});

		// vertical align arrows to new height
		$('.slick-arrow').css({'top': width / 2 + 'px'});
	}
};

let setCoverPhoto = (event) => {
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

	// redraw images, resize items, and add click handler
	updateCarouselImages();
	resizeCarousel();
	$('.carousel-item:first').on('click', setCoverPhoto);
};

let parseFile = (file) => {
	let reader = new FileReader();

	//TODO - check file is supported

	reader.onloadend = () => {
		addCarouselItem(reader.result);
	};
	if (file) {
		reader.readAsDataURL(file);
	}
};

let initialize = () => {
	initSlick();

	// init carousel item images and heights
	updateCarouselImages();
	resizeCarousel();

	// When page resizes, redraw carousel items
	$(window).resize(resizeCarousel);

	//listen for file uploads
	$('#photo-carousel #fileUpload').on("change", (evt) => {
		evt.stopImmediatePropagation();

		// parse file(s)
		let files = evt.target.files;
		for (let i = 0; i < files.length; i++) {
			parseFile(files[i]);
		}

		// TODO - EPS stuff
	});

	// click handler for changing the ad cover photo
	$(".carousel-item").on('click', setCoverPhoto);
};

module.exports = {
	initialize
};



