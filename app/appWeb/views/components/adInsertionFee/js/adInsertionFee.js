/*eslint no-fallthrough: 0*/

'use strict';

const MAX_TITLE_LENGTH = 30;

class AdInsertionFee {

	componentDidMount(domElement) {
		this._$promoteWithInf = domElement.find("#promote-with-inf");
	}

	updateInsertionFee(adInfo, innsetionFee, categorySelectedName) {
		$(this._$promoteWithInf.find(".ad-first-pic")).css("background-image", "url('" + adInfo.imageUrls[0] + "')");
		$(this._$promoteWithInf.find(".inf-amount")).html(innsetionFee);

		// Current
		if (adInfo.title.length > MAX_TITLE_LENGTH) {
			$(this._$promoteWithInf.find(".ad-title")).html(adInfo.title.substring(0, MAX_TITLE_LENGTH) + ". . . ");
		} else {
			$(this._$promoteWithInf.find(".ad-title")).html(adInfo.title);
		}

		if (adInfo.price) {
			if (adInfo.price.amount) {
				// Display currency for non-locale price
				$(this._$promoteWithInf.find(".ad-price")).html(adInfo.price.amount + " " + (adInfo.price.currency === "MXN" ? "" : adInfo.price.currency));
			} else {
				$(this._$promoteWithInf.find(".ad-price")).toggleClass("hidden", true);
				$(this._$promoteWithInf.find(".ad-price-contact-me")).toggleClass("hidden", false);
			}
		} else {
			$(this._$promoteWithInf.find(".ad-price")).toggleClass("hidden", true);
		}
		$(this._$promoteWithInf.find(".inf-category-name")).html(categorySelectedName);
		//$(this._$promoteWithInf.find(".inf-cancel-button")).prop("href", cancelLink);
		$(this._$promoteWithInf.find(".inf-cancel-button")).click(() => {
			window.BOLT.trackEvents({"event": this.pageType + "UpsellBack"});
		});
		this._$promoteWithInf.toggleClass("hidden", false);
	}
}

module.exports = AdInsertionFee;
