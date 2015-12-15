var express = require('express');
//var kraken  =require('kraken-js');
var config = require('./handlebars-helpers');

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
        	"defaultLayout" : "../../app/views/templates/layouts/hbs/main",
        	"partialsDir": ["./app/views/templates/hbs/partials"],
        	"extname": ".hbs",
        	"i18n" : "config:i18n"
        }
    ]
};

module.exports = function (app, locale) {
    var engineExt = app.get('view engine'),
		engine,
	    module = require('express-handlebars');

	var args = Array.isArray(hbsConfig['arguments']) ? hbsConfig['arguments'].slice() : [];

	// Merge the handlebars helper methods
	args[0] = Object.assign(args[0], config(module));

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
