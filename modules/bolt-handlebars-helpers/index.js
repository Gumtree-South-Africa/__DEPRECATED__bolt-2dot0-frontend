var express = require('express');
var kraken  =require('kraken-js');
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

module.exports = function (app) {
    var engines; 

	app.on("start", function () {
		engines = app.kraken.get('view engines') || {};

	    Object.keys(engines).forEach(function (ext) {
	        var spec, module, args, engine;
	        spec = engines[ext];
	        module = require(spec.module);

			// if(Object.isObject(spec.renderer) && spec.isCustom){
			if ((typeof spec.renderer === "object") && spec.isCustom) {
	            //added case
	            args = Array.isArray(spec.renderer['arguments']) ? spec.renderer['arguments'].slice() : [];

	            // Merge the handlebars helper methods
	            args[0] = Object.assign(args[0], config(module));

	            // Create the handlebars instance
	            engine = module.apply(null, args);

	            // Get a hold of the object bound to the engine function.
	            module.instance = engine.boundObject;

	            // Register the locale specific partials
	            config.registerLocalePartials(module);
	        }
	        else {
	            engine = module;
	        }

	        app.engine(ext, engine);
	    });
	});

    return app;
};
