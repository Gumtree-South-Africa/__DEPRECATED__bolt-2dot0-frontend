var BOLT = BOLT || {};

BOLT.Homepage = (function () {

	return {
		setUp : function () {
			this.getTemplateData();
		},

		getTemplateData : function () {
			console.log("getting template data!");
			var dataObj = {
				name : "Videep",
				title : "Master"
			};

			var homepageTemplate = Handlebars.templates['a.hbs'];
			var html = homepageTemplate(dataObj);

			console.log("The result of HB injection is:");
			console.log(html);
		}
	};

})();

BOLT.Homepage.getTemplateData();