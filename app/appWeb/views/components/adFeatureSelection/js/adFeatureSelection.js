/*eslint no-fallthrough: 0*/

'use strict';

let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');
let clientHbs = require("public/js/common/utils/clientHandlebars.js");

let clientHbsInitialized = false;
// List of supported feature here
const FEATURES_LIST = ["bumpUpXY", "topAd", "hpGallery", "urgent", "highlight", "srpGallery", "WebSiteUrl"];

function initializeClientHbsIfNot() {
	if (!clientHbsInitialized) {
		clientHbsInitialized = true;
		clientHbs.initialize();
	}
}

class AdFeatureSelection {
	constructor() {
		initializeClientHbsIfNot();
		this.propertyChanged = new SimpleEventEmitter();
		this.pageType = "";
	}

	componentDidMount(domElement) {
		this.$form = domElement.find(".ad-features");
	}
	/**
	 * renders the feature attributes using handlebars client side templating
	 * @param modelData js object to use for templating
	 * @private
	 */
	render(modelData, adId, insertionFee, cancelLink) {
		// empty the contents of the form
		this.$form.empty();
		this.insertionFee = 0;

		if (modelData) {
			// generate the dom string using handlebars
			let newDomString = clientHbs.renderTemplate(`adFeatureSelection`, modelData);
			// unwrapping the dom to remove the div already in the page as this.$form
			this.$form.append($(newDomString).unwrap());
			window.scrollTo(0, 0);
			this._bindEvent();
		}

		modelData.forEach((feature) => {
			let name = feature.name;
			feature.featureOptions.forEach((option) => {
				if (option.selectedFromPreview) {
					$(this.$form.find("input[name='" + name + "']")).prop("disabled", true).prop("checked", true).addClass("disabled");
					$(this.$form.find("label[for='" + name + "']")).addClass("disabled");
					$(this.$form.find("select[name='" + name + "']")).prop("disabled", true).addClass("disabled").toggleClass("select-disable", true);
				}
			});
			if (feature.featureOptions.length === 1) {
				$(this.$form.find("select[name='" + name + "']")).prop("disabled", true).toggleClass("select-disable", true);
			}
		});
		if (insertionFee) {
			$(this.$form.find(".cancel-link")).prop("href", "/my/ads.html");
		} else {
			$(this.$form.find(".cancel-link")).prop("href", cancelLink);
		}

		if(insertionFee) {
			let infInput = $(document.createElement('input')).attr("name", "insertionFee").addClass("hidden").val(adId + "|insertionFee");
			this.$form.find(".insertionFee-wrapper").html(infInput);
			this.insertionFee = insertionFee;
			this._updateCheckoutPrice();
		}
	}

	_bindEvent() {

		// Feature Checkbox event
		$(this.$form.find(".input-checkbox")).on("click", (e) => {
			this._updateCheckoutPrice();
			let featureName = $(e.currentTarget).attr("name");
			let checked = $(e.currentTarget).prop("checked");
			if (checked) {
				window.BOLT.trackEvents({"event": featureName + "Selected", "eventLabel": ""});
			} else {
				window.BOLT.trackEvents({"event": featureName + "Deselected", "eventLabel": ""});
			}
		});
		$(this.$form.find(".feature-description .label-of-checkbox")).on("click", (e) => {
			let featureName = $(e.currentTarget).attr("name");
			$("input[name='" + featureName + "']").click();
		});

		// Feature option event
		$(this.$form.find("select")).change((e) => {
			let featureName = $(e.currentTarget).attr("name");
			let duration = this._getFeatureOptionDuration(featureName);
			window.BOLT.trackEvents({"event": featureName, "eventLabel": duration});
			this._updateCheckoutPrice();
		});

		$(this.$form.find(".feature-more")).on("click", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			let featureName = $(e.currentTarget).attr("name");
			window.BOLT.trackEvents({"event": featureName + "MoreInfo", "eventLabel": ""});
			FEATURES_LIST.forEach((item) => {
				if (item !== featureName) {
					this.$form.find(".title-" + item).toggleClass("hidden", true);
					this.$form.find(".info-" + item).toggleClass("hidden", true);
				}
			});
			this.$form.find(".feature-info-overlay").toggleClass("hidden", false);
		});

		$(this.$form.find(".feature-info-overlay")).on("click", (e) => {
			let target = $(e.target);
			if (target.hasClass("feature-overlay-modal")
			|| (target.hasClass("modal-container"))
			|| (target.hasClass("feature-title"))
			|| (target.hasClass("feature-content-info"))
			|| (target.hasClass("modal-wrapper"))
			|| (target.hasClass("close-footer"))
			|| (target.hasClass("btn-wrapper"))) {
				return;
			}
			e.preventDefault();
			e.stopImmediatePropagation();
			this.$form.find(".feature-title,.feature-content-info").toggleClass("hidden", false);
			this.$form.find(".feature-info-overlay").toggleClass("hidden", true);
		});

		// Feature checkout submit event
		$(this.$form.find(".checkout-button")).on("click", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			window.BOLT.trackEvents({"event": "FeatureAdBegin", "eventLabel": ""});
			let cloneForm = $(this.$form.find("#promote-checkout-form")).clone(true);
			// Clean unsupported fields for 1.0 promote
			for (let input of cloneForm.find("input[type='checkbox']")) {
				if (!input) {
					continue;
				}
				let name = $(input).prop("name");
				if (!($(input).prop("checked")) || ($(input).prop("disabled"))) {
					$(cloneForm.find("select[name='" + name + "']")).prop("name", ""); // Don't checkout un-submit feature
				} else {
					$(cloneForm.find("select[name='" + name + "']")).prop("disabled", false); // enable for submit
					let val = $(this.$form.find("#promote-checkout-form")).find("select[name='" + name + "']").val();
					$(cloneForm.find("select[name='" + name + "']")).val(val);
				}
			}
			cloneForm.find("input[type='checkbox']").prop('name','');
			$(cloneForm.attr("id","")).toggleClass("hidden", true);
			cloneForm.appendTo("body").submit();
		});

		$(this.$form.find(".desktop-cancel .cancel-link")).click(() =>{
			if (this.insertionFee) {
				window.BOLT.trackEvents({"event": this.pageType + "UpsellBack", "eventLabel": ""});
			} else {
				window.BOLT.trackEvents({"event": this.pageType + "ViewMyAd", "eventLabel": ""});
			}
		});

		$(this.$form.find(".checkout-cancel .cancel-link")).click(() =>{
			if (this.insertionFee) {
				window.BOLT.trackEvents({"event": this.pageType + "UpsellBack", "eventLabel": ""});
			} else {
				window.BOLT.trackEvents({"event": this.pageType + "ViewMyAd", "eventLabel": ""});
			}
		});
	}

	_updateCheckoutPrice() {
		let price = this.insertionFee;
		for (let input of this.$form.find("input[type='checkbox']")) {
			if (input && $(input).prop("checked") && !$(input).prop("disabled")) {
				let name = $(input).prop("name");
				price += this._getFeatureOptionPrice(name);
			}
		}
		this.$form.find(".price-amount").text("$" + price);
		if (price) {
			this.$form.find(".mobile-cancel").toggleClass("hidden", true);
			this.$form.find(".desktop-cancel").find(".cancel-link").toggleClass("hidden", true);
			this.$form.find(".mobile-checkout").toggleClass("hidden", false);
			this.$form.find(".desktop-checkout").toggleClass("hidden", false);
		} else {
			this.$form.find(".mobile-cancel").toggleClass("hidden", false);
			this.$form.find(".desktop-cancel").find(".cancel-link").toggleClass("hidden", false);
			this.$form.find(".mobile-checkout").toggleClass("hidden", true);
			this.$form.find(".desktop-checkout").toggleClass("hidden", true);
		}

	}

	_getFeatureOptionPrice(feature) {
		let select = this.$form.find("select[name='" + feature + "']");
		let selectVal = select.val();
		return new Number(select.find("option[value='" + selectVal + "']").html().match(/\$(\d+)+/)[1]);
	}
	_getFeatureOptionDuration(feature) {
		let select = this.$form.find("select[name='" + feature + "']");
		let selectVal = select.val();
		return select.find("option[value='" + selectVal + "']").html().split("|")[0];
	}
}

module.exports = new AdFeatureSelection();
