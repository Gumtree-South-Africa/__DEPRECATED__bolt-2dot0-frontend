'use strict';


module.exports = function watch(grunt) {
    // Watch .properties Files
    /*grunt.event.on('watch', function(action, filepath, target) {
        if(action==='changed' && target==='properties'){
            var input = filepath;
            var output = grunt.config.data.watch.properties.dest;
            var fix = grunt.config.data.watch.properties.fix;
            var Properties2Json = require('../scripts/properties2Json.js');
            var props = new Properties2Json(input,output,fix);
        }
    });*/

    // Options
    return {
        config: {
            files: [
                'config/config{,.*}.json',
                'config/development{,.*}.json',
            ],
            livereload: true,
            tasks: ['jsonlint']
        },

        properties: {
            files: ['./locales/src/*.properties'],
            dest: 'locales/json/',
            tasks: ['properties'],
            fix:false,
            options: {
                spawn: false
            }
        },


        handlebars: {
            files: [
                './views/**/*.hbs'
            ],
            dest: './public/js/precompiled/',
            tasks: ['handlebars'],
            livereload: true,
            fix: false,
            options: {
                spawn: true,
                livereload: true
            }
        },

        styles: {
            files: [
                'public/styles/**/*.scss',
                'views/components/*/styles/**/*.scss',
            ],
            livereload: true,
            tasks: ['styles']
        }

    };

};
