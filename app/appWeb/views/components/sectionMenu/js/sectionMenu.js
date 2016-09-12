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

		// append locationID to trending link
		$('.sectionMenuWrapper a').on('click', (evt) => {
			let link = $(evt.target);
			let href = link.attr('href');

			if (href === "#") {
				return;
			}

			let locId = $('input[name="locId"]').val();
			if (locId && locId.length > 0) {
				href = href.substr(0, href.length - 2) + 'l' + locId + 'p1';
				link.attr('href', href);
			}
		});
	});
};


module.exports = {
	initialize
};
