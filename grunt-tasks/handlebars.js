'use strict';

module.exports = function (grunt) {
    var srcFiles,
        outputDir,
        outputFile,
        exec,
        hbsProcess,
        fullCommand,
        hbsCommand = "./node_modules/express-handlebars/node_modules/handlebars/bin/handlebars";
    
    // Register the handlebars task
    grunt.task.registerTask('handlebars', 'Precompile handlebars hbs files', function() {});

    /* *************************** */

    /* *************************** */
    grunt.config('handlebars', {
        options: {
            extend: true,
            cwd: hbsCommand,
            dest: './public/js/precompiled/js/hbs',
            namespace: 'Handlebars.templates',
            processName: function (filePath) {
                return filePath.split('/').pop();
            }
        },
        compile: {
            files: [
                {
                    dest: './precompiled/en_ZA/homepage.html.js',
                    src: [
                        './views/templates/pages/homepage/views/hbs/PreCompile/DateInput.html',
                        './views/templates/pages/homepage/views/hbs/a.html',
                        './views/templates/pages/homepage/views/hbs/b.html'
                    ]
                },
                {
                    dest: './precompiled/es_MX/homepage.html.js',
                    src: [
                        './views/templates/pages/homepage/views/hbs/PreCompile/DateInput.html',
                        './views/templates/pages/homepage/views/hbs/a.html',
                        './views/templates/pages/homepage/views/hbs/b.html'
                    ]
                },
                {
                    dest: './precompiled/es_AR/homepage.html.js',
                    src: [
                        './views/templates/pages/homepage/views/hbs/PreCompile/DateInput.html',
                        './views/templates/pages/homepage/views/hbs/a.html',
                        './views/templates/pages/homepage/views/hbs/b.html'
                    ]
                }   

            ]
        }
    });
    /* ************** */


    // Watch .hbs Files
    grunt.event.on('watch', function(action, filepath, target) {
        if (action==='changed' && target==='handlebars') {

            // Get the list of source files. Add the file that got modified
            srcFiles = grunt.config.data.handlebars.pre;

            // console.log("src files:");
            // console.log(srcFiles);

            // console.log("Filepath:");
            // console.log(filepath);

            // Adding the filepath to the srcfiles array if it is not present.
            if (srcFiles instanceof Array && srcFiles.indexOf(filepath) === -1) {
                srcFiles.push(filepath);
            }

            // Get the output file path and name
            outputDir = grunt.config.data.handlebars.dest;
            outputFile = outputDir + "templates.js";

            // Create a new child process to make the handlebars call
            exec = require("child_process").exec,
            fullCommand = hbsCommand + " " + srcFiles.join(" ") + " -f " + outputFile;

            console.log("The full command is:");
            console.log(fullCommand);

            // Execute the handlebars command. Generate the output.
            hbsProcess = exec(fullCommand, 
                    function(error, stdout, stderr) {
                        // console.log("stdout" + stdout);
                        if (stderr) {
                            console.log("stderr" + stderr);
                        }
                    }
            );
        }
    });

    // return handlebars options
    return {
        dest: './public/js/precompiled/',
        fix: false,
        options: {
            spawn: true,
            livereload:true
        },
        pre: ['./views/templates/pages/homepage/views/hbs/PreCompile/a.hbs', './views/templates/pages/homepage/views/hbs/PreCompile/b.hbs']
    };
   
};
