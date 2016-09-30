'use strict';

let StringUtilsV2 = require("public/js/common/utils/StringUtilsV2");

class ProfileMenu {
	_revealUrl($dom) {
		let unmaskedUrl = StringUtilsV2.rot13($dom.data("o-uri")) || "";
		$dom.removeAttr("data-o-uri");

		if (unmaskedUrl) {
			$dom.attr("href", unmaskedUrl);

			if ($dom.data("target") !== null) {
				$dom.attr("target", $dom.data("target"));
				$dom.removeAttr("data-target");
			}
			//create new A tag
			let $newTag = $("<a></a>").append($dom.contents().clone());
			$.each(this.attributes, function(i, attrib) {
				$newTag.attr(attrib.name, attrib.value);
			});
			$dom.replaceWith($newTag);
		}
	}

	initialize() {
		// Change spans to a tags and set href
		$(".rot-link-toConvert").each((i, dom) => {
			this._revealUrl($(dom));
		});
	}
}

module.exports = new ProfileMenu();
