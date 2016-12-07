/*eslint no-fallthrough: 0*/

'use strict';

class AdInsertionFee {

	componentDidMount(domElement) {
		this._$promoteWithInf = domElement.find("#promote-with-inf");
	}

	updateInsertionFee(adInfo, innsetionFee, categorySelectedName, cancelLink) {
		$(this._$promoteWithInf.find(".ad-first-pic")).css("background-image", "url('" + adInfo.imageUrls[0] + "')");
		$(this._$promoteWithInf.find(".inf-amount")).html(innsetionFee);
		$(this._$promoteWithInf.find(".ad-title")).html(adInfo.title);
		$(this._$promoteWithInf.find(".ad-price")).html(adInfo.price.amount + " " + (adInfo.price.currency === "MXN" ? "" : adInfo.price.currency));
		$(this._$promoteWithInf.find(".inf-category-name")).html(categorySelectedName);
		$(this._$promoteWithInf.find(".inf-cancel-button")).prop("href", cancelLink);
		this._$promoteWithInf.toggleClass("hidden", false);
	}
}

module.exports = AdInsertionFee;
