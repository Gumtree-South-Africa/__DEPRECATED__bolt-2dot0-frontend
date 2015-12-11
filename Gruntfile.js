'use strict';


module.exports = function (grunt) {
	var path = require('path');

 	// measures the time each task takes
  	require('time-grunt')(grunt);
	
	// loads all grunt tasks
	require('load-grunt-config')(grunt, {
        // path to task.js files, defaults to grunt dir
        configPath: path.join(process.cwd(), 'grunt-tasks'),

        // auto grunt.initConfig
        init: true,

        // data passed into config.  Can use with <%= test %>
        data: {
            test: false
        },

        // can optionally pass options to load-grunt-tasks.
        // If you set to false, it will disable auto loading tasks.
        loadGruntTasks: {
            pattern: '*',
            config: require('./package.json'),
            scope: 'devDependencies'
        },

        //can post process config object before it gets passed to grunt
        postProcess: function(config) {},

        //allows to manipulate the config object before it gets merged with the data object
        preMerge: function(config, data) {}
    });
    
    // Register group tasks
    grunt.registerTask('build', ['properties', 'newer:jshint', 'newer:jsonlint', 'makara-amdify', 'newer:sass', 'newer:requirejs', 'copyto']);
    grunt.registerTask('test', [ 'newer:jshint', 'newer:mochacli' ]);
    grunt.registerTask('git-commit', ['jshint', 'jsonlint']);

    // grunt.registerTask('styles', 'groups svgmin and grunticon', ['concurrent:compass', 'copy:styles']);

};
