var BOLT = BOLT || {};

alert ("Homepage!");

BOLT.Homepage = (function () {

	return {
		setUp : function () {
			this.getTemplateData();
		},

		getTemplateData : function () {
			var dataObj = {
				name : "Ulises",
				title : "MS"
			};

			var homepageTemplate = Handlebars.templates['HomePage.html'];
			var html = homepageTemplate(dataObj);

			console.log("The result of HB injection is:");
			console.log(html);
		}
	};

})();