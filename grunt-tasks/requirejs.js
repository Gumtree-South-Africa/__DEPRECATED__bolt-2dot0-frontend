'use strict';


module.exports = function requirejs(grunt) {
	// Options
	return {
        build: {
            options: {
                baseUrl: 'public/js',
                dir: '.build/js',
                optimize: 'uglify'
                // commenting since we dont know the module name
                // modules: [
                //     { name: 'app' }
                // ]
            }
        }
	};
};
