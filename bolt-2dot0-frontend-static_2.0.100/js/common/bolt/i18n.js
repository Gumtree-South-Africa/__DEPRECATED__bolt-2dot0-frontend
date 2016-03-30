/**
 * Created by moromero on 1/14/14.
 */



/*
 var i18n = function(){ console.error("Translations could not be loaded"); };
$(function(){
	$.getJSON("{{this}}", function(I18N){
		i18n = function(){
			var key = arguments[0];
			if(typeof I18N[key] === "undefined")
				console.error("The translation '" + key + "' you requested was not loaded into your view. Please check your controller and make sure to enable localization using the setOutputLocalization(true, 'namespace') method under your PageFooterModel;");
			var i,
				args = $.makeArray(arguments).splice(1,2),
				val = I18N[key];
			for(i = 0; i < args.length; i++){
				val = val.split("{" + i + "}").join( args[i] );
			}
			return val;
		}

		if(typeof Handlebars !== "undefined")
			Handlebars.registerHelper("i18n", function(){
				return i18n.apply(this, arguments);
			});
	});
});
*/


var BOLT = BOLT || {};
BOLT.TRANSLATIONS = (function($, win){

	var translations = {};


	function translate(){
		var key = arguments[0];
		if(typeof translations[key] === "undefined")
			console.error("The translation '" + key + "' you requested was not loaded into your view. Please check your controller and make sure to enable localization using the setOutputLocalization(true, 'namespace') method under your PageFooterModel;");
		var i,
			args = $.makeArray(arguments).splice(1,2),
			val = translations[key];
        if (typeof val !== "undefined") {
            for (i = 0; i < args.length; i++) {
                val = val.split("{" + i + "}").join(args[i]);
            }
        }
		return val;
	}

	if(typeof Handlebars !== "undefined")
		Handlebars.registerHelper("i18n", translate);


	define("I18N", [], function(){



		var scopes = [],
			callbacks = [],
			initialized;

		function loadTranslations(namespaces, callback){
			if(typeof namespaces !== "string")
				namespaces = namespaces.join(",");
			if(namespaces) {
				$.ajax({
					url: Bolt.LOCALIZEAPIROOTURL + "/" + namespaces + "/cb/l18nCb",
					jsonpCallback: "l18nCb",
					dataType: "jsonp",
					scriptCharset:"UTF-8",
					success: function(response){
						// concatinate with old translations
						for(var trans in response) {
							translations[trans] = response[trans];
                        }
						if(callback) {
							callback(translations);
                        }
                        $(document).trigger("i18n_ready", [true]);
					}
				});
            }
			initialized = true;
		}


		function getScope(namespaces, callback){
			if(!initialized){
				scopes = scopes.concat(typeof namespaces === "string" ? namespaces.split(",") : namespaces);
				callbacks.push(callback);
			}else{
				loadTranslations(namespaces, callback);
			}
		}


		function BoltI18N(){
			this.load = getScope;
			this.translate = translate;
		};



		$(function(){
			var ns;
			if(Bolt.i18nBeSupport)
				ns = scopes.concat((Bolt.i18nBeSupport || "").split(","));
			else
				ns = scopes;
			if(ns.length > 0)
				loadTranslations(ns, function(){
					for(var c = 0; c < callbacks.length; c++)
						(callbacks[c] || function(){})();
				});
		});


		return BoltI18N;


	});




	define("i18n", ["I18N"], function(I18N){

		Bolt.i18n = new I18N;
		return Bolt.i18n;

	});

     // Public methods
     return {
         getTranslations : function () {
             return translations;
         },
         getTranslationsByKey : function (key) {
             if (typeof key === "string") {
                return translations[key];
             }
             return null;
         }
     };


})(jQuery, window);


