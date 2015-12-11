'use strict';


module.exports = function copyto(grunt) {
    // Options
    return {
        build: {
            files: [{
                cwd: 'public',
                src: ['**/*'],
                dest: '.build/'
            }],
            options: {
                ignore: [
                    'public/css/**/*',
                    'public/js/**/*',
                    'public/templates/**/*'
                ]
            }
        }
    };
};
