var BOLT = BOLT || {};

BOLT.Homepage = (function () {
	return {
		setUp : function () {
			this.getTemplateData();
		},

		getTemplateData : function () {
			var html = "";
			var dataObj = {
				name : "Ulises",
				title : "MS"
			};

			var template = Handlebars.template;
			var homepageTemplate = Handlebars.templates['a'];
			if (typeof homepageTemplate === "object") {
				homepageTemplate = template(homepageTemplate);
			}

			if (typeof homepageTemplate === "function") {
				html = homepageTemplate(dataObj);
			}
			
			console.log("The result of HB injection is:");
			console.log(html);

			return html;
		}
	};

})();