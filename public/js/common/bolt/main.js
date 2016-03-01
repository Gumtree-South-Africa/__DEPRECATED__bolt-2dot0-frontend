/**
 * Created by moromero on 1/6/14.
 */



// placeholder for Bolt namespace
if(typeof Bolt === "undefined")
	Bolt = Bolt || {};



/* use the extend function */
Bolt.extend = function(){
	if(arguments.length === 0)
		return;
	else if(arguments.length === 1)
		return arguments[0];
	var o, i;
	for(o = 1; o < arguments.length; o++)
		for(i in arguments[o])
			arguments[0][i] = arguments[o][i];
	return arguments[0];
};

(function(){

	var definitions = {};


	function define(definition, dependencies, fn){

		var deps = [];

		for(var i = 0; i < dependencies.length; i++)
			deps.push(definitions[dependencies[i]]);

		if (fn) {
			definitions[definition] = fn.apply(this, deps);
		}
	}


	function require(dependencies, callback){

		var deps = [];

		for(var i = 0; i < dependencies.length; i++)
			deps.push(definitions[dependencies[i]]);

		if(callback)
			callback.apply(this, deps);

	}


	window.define = define;
	window.require = require;



})();


// please replace with lodash
window._ = window._ || {
	debounce: function (fn, interval, immediate) {
		var self = arguments.callee;
		interval = interval || 500;
		return function () {
			if (immediate) {
				fn();
				immediate = false;
			}
			self.timeout = self.timeout !== undefined && clearTimeout(self.timeout);
			self.timeout = setTimeout(fn, interval);
		}
	}
}
