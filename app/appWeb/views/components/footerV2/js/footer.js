'use strict';


let _toggleCategory = (e) => {
	$(e.currentTarget).parents('.footer-inner-wrappper').toggleClass('expanded');
	if (this.$footerLinks.find('div:nth-child(4)').hasClass('expanded')) {
		if (this.$footerLinks.find('div:nth-child(5)').hasClass('expanded')) {
			this.$seoLinks.addClass('mobile-extra-height');
		} else {
			this.$seoLinks.removeClass('mobile-extra-height');
		}
		this.$seoLinks.addClass('display-mobile');
		this.$seoLinks.css('display', 'block');
	} else {
		this.$seoLinks.removeClass('display-mobile');
		this.$seoLinks.css('display', 'none');
	}

	if ($(e.currentTarget).find('.menu-items').hasClass('hide')) {
		$(e.currentTarget).find('.chevron').css({
			'transform': 'rotate(270deg)'
		});
	} else {
		$(e.currentTarget).find('.chevron').css({
			'transform': 'rotate(90deg)'
		});
	}

	$(e.currentTarget).find('.menu-items').toggleClass('hide');
};


let initialize = () => {
	$(document).ready(() => {
		this.$seoLinks = $('.seo-links');
		this.$footerLinks = $('.footer-links');
		$('.menu-items').addClass('hide');
		$('.footer-inner-wrappper').removeClass('inner');
		$('.menu-category').on('click', (e) => {
			_toggleCategory(e);
		});
	});

};

module.exports = {
	initialize
};
