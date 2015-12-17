var BOLT = BOLT || {};

BOLT.Homepage = (function () {
	return {
		setUp : function () {
			this.getTemplateData();
		},

		getTemplateData : function () {
			var html = "";
			var dataObj = {
				name : "User Precompiled",
				title : "Success!"
			};

			var template = Handlebars.template;
			var homepageTemplate = Handlebars.templates['a'];
			if (typeof homepageTemplate === "object") {
				homepageTemplate = template(homepageTemplate);
			}

			if (typeof homepageTemplate === "function") {
				html = homepageTemplate(dataObj);
			}

			$(".precompiled").html(html);

			return html;
		}
	};

})();