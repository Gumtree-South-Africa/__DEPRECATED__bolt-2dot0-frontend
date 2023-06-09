var express = require('express');
//var kraken  =require('kraken-js');
var config = require('./handlebars-helpers');

var Handlebars = require("handlebars");
// var HandlebarsIntl = require('handlebars-intl');

// Register the helpers
//HandlebarsIntl.registerWith(Handlebars);

/* Code that we use to retrieve the object bound to a function */
var _bind = Function.prototype.apply.bind(Function.prototype.bind);
Object.defineProperty(Function.prototype, 'bind', {
    value: function(obj) {
        var boundFunction = _bind(this, arguments);
        boundFunction.boundObject = obj;
        return boundFunction;
    }
});

//TODO: read this is from app config
var hbsConfig = {
    "arguments": [
        {
        	"defaultLayout" : "../../app/appWeb/views/templates/layouts/hbs/main",
        	"partialsDir": [
                "./app/appWeb/views/templates/partials",
                "./app/appWeb/views/components/searchbar/views/dependencies"
            ],
        	"extname": ".hbs",
        	"i18n" : "config:i18n"
        }
    ]
};

// module.exports = function (app, locale, module) {
module.exports = function (app, locale, module, i18nObj) {
    var engineExt = app.get('view engine'),
		engine; // ,
	    // module = require('express-handlebars');

    // Create a new instance of handlebars
    hbsConfig["arguments"][0]["handlebars"] = Handlebars.create();
    // HandlebarsIntl.registerWith(hbsConfig["arguments"][0]["handlebars"]);

	var args = Array.isArray(hbsConfig['arguments']) ? hbsConfig['arguments'].slice() : [];

	// Merge the handlebars helper methods
	// args[0] = Object.assign(args[0], config(module));
    args[0] = Object.assign(args[0], config(module, i18nObj));

	// Create the handlebars instance
	engine = module.apply(null, args);

	// Get a hold of the object bound to the engine function.
	module.instance = engine.boundObject;


	// Register the locale specific partials
    if (locale) {
	   config.registerLocalePartials(module, locale);
    }

	app.engine(engineExt, engine);

    return app;
};
