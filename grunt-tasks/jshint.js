'use strict';


module.exports = function jshint(grunt) {
    // Options
    return {
        files: [
            'controllers/**/*.js',
            'lib/**/*.js',
            'models/**/*.js'
        ],
        options: {
            jshintrc: '.jshintrc'
        }
    };
};
