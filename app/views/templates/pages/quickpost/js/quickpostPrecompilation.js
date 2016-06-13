var BOLT = BOLT || {};

BOLT.Quickpost = (function () {
	return {
		setUp : function () {
			this.getTemplateData();
		},

		getData : function(){
			$('#location').on('keyup', function(){
					$.ajax({
							url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&address=' + $('#location').val(),
							dataType: 'JSON',
							type: 'GET',
							success: function(resp){
									console.log(resp);
									if (resp.results instanceof Array) {
											for (var idx=0; idx<resp.results.length; idx++) {
													var address = resp.results[idx].formatted_address;
													var latitude = resp.results[idx].geometry.location.lat;
													var longitude = resp.results[idx].geometry.location.lng;
													console.log('#################  ', idx);
													console.log(address);
													console.log(latitude);
													console.log(longitude);
												var context = resp.results;
												this.getTemplateData(context);
												return context;
											}
									}
							}
					})
				})
			},

		getTemplateData : function (data) {
			var html = "";
			var dataObj = {
				name : "User Precompiled",
				title : "Success!"
			};

			var template = Handlebars.template;
			var QuickpostTemplate = Handlebars.templates['a'];
			if (typeof QuickpostTemplate === "object") {
				QuickpostTemplate = template(QuickpostTemplate);
			}

			if (typeof QuickpostTemplate === "function") {
				html = QuickpostTemplate(data);
			}

			$(".precompiled").html(html);

			return html;
		}
	};

})();
