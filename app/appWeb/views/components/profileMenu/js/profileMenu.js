'use strict';

(function() {
	let BOLT;
	if (!BOLT) {
		BOLT = {};
	}
	BOLT.UTILS = BOLT.UTILS || {};
	BOLT.StringUtils = BOLT.StringUtils || {};

	function revealUrl(obfuscateUrl) {
		return BOLT.StringUtils.rot13(obfuscateUrl);
	}

	// Change spans to a tags and set href
	$(".sudo-link-toConvert").each(function() {
		let $this = $(this), unmaskedUrl = "";

		if ($this.data("o-uri-back") !== null) {
			unmaskedUrl = revealUrl($this.data("o-uri-back")) + "?redirect=" + window.location.href;
			$this.removeAttr("data-o-uri-back");
		} else {
			unmaskedUrl = revealUrl($this.data("o-uri"));
			$this.removeAttr("data-o-uri");
		}

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
})();


