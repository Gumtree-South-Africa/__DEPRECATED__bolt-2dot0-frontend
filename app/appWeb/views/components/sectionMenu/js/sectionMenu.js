'use strict';

let initialize = () => {

	$(document).ready(() => {
		$('.sectionMenuWrapper li').on('click', function() {
			let $this = $(this);

			$this.siblings().each(function() {
				let $that = $(this);
				if ($that.find('a').hasClass('active')) {
					$that.find('a').removeClass('active');
				}
			});

			if (!$this.find('a').hasClass('active')) {
				$this.find('a').addClass('active');
			}
		});
	});
};


module.exports = {
	initialize
};
