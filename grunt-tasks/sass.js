'use strict';


module.exports = function sass(grunt) {
    // Options
    return {
        build: {
            options: {
                outputStyle: 'compressed'
            },
            cwd: 'public/components/header/styles',
            src: '**/*.scss',
            dest: '.build/css/',
            expand: true,
            ext: '.css'
        }
    };
};
