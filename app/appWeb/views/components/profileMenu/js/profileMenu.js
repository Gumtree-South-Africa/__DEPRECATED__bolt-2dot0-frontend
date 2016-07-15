'use strict';

let StringUtilsV2 = require("public/js/common/utils/StringUtilsV2");

let initialize = () => {
	function revealUrl(obfuscateUrl) {
		return StringUtilsV2.rot13(obfuscateUrl);
	}

	// Change spans to a tags and set href
	$(".rot-link-toConvert").each(function() {
		let $this = $(this), unmaskedUrl = "";
			unmaskedUrl = revealUrl($this.data("o-uri"));
			$this.removeAttr("data-o-uri");

		if (unmaskedUrl) {
			$this.attr("href", unmaskedUrl);

			if ($this.data("target") !== null) {
				$this.attr("target", $this.data("target"));
				$this.removeAttr("data-target");
			}
			//create new A tag
			let $newTag = $("<a></a>").append($this.contents().clone());
			$.each(this.attributes, function(i, attrib) {
				$newTag.attr(attrib.name, attrib.value);
			});
			$this.replaceWith($newTag);
		}
	});
};

module.exports = {
	initialize
};
