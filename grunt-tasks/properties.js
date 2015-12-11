'use strict';


module.exports = function properties(grunt) {

    var _ = require('lodash'),
        Q = require('Q'),
        glob = require("glob"),
        fs = require('fs'),
        watching = false;

    // Properties
    grunt.task.registerTask('properties', 'Convert properties to Json', function(target) {

        // this requires spawn:false in grunt watch options for this task
        if(watching){
            return console.log("running from watch task: DIE");
        } else {
            console.log("running...");
        }

        // tell grunt we are an async task and to wait for us
        var done = this.async();

        var sources = glob.sync("./app/locales/src/*.properties"),
            output = process.cwd() + "/app/locales/json",
            Properties2Json = require(process.cwd() + '/scripts/properties2Json.js'),
            deferreds,
            dfd,
            re = /^.*\/(.*)_([a-z]{2})_([A-Z_]{2,6})\.properties$/m,
            outputPath;

        // create a list of files that are missing
        var paths = _.filter(sources,function(v){
            var re = /^.*\/(.*)_([a-z]{2})_([A-Z_]{2,6})\.properties$/m,
                outputPath = v.replace(re, output + "/$2_$3/$1.json");
            try {
                var data = require(outputPath);
            } catch(e){
                return v;
            }
            return false;
        });

        if(!paths.length)
            return done();

        // show list of missing files
        console.log(paths);

        // generate each file and wait for them to complete to call `done()`
        var promises = _.map(paths,function(v){
            return new Properties2Json(v,output,{});
        });
        Q.all(promises)
            .then(function(){
                grunt.log.writeln("Done");
                done()
            })

        console.log("running successful");
    });

    // Watch .properties Files
    grunt.event.on('watch', function(action, filepath, target) {
        watching = true;
        if(action==='changed' && target==='properties'){
            // make sure we are running from the scripts folder
            var input = process.cwd() + "/" + filepath,
                output = process.cwd() + "/" + grunt.config.data.watch.properties.dest,
                fix = grunt.config.data.watch.properties.fix,
                Properties2Json = require(process.cwd() + '/scripts/properties2Json.js'),
                props = new Properties2Json(input,output,{fix:grunt.config.data.watch.properties.fix || false});
        }
    });

    // return properties options
    var config = {
        dest: './locales/json/',
        fix: false,
        options: {
            spawn:false
        }
    };

    return config;
    
};
