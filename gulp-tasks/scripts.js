'use strict';

/ ////////////////////////////////////////////////
//
// EDIT CONFIG OBJECT BELOW !!!
// 
// jsFiles => list of javascript files (in order) to concatenate
// buildFilesFoldersRemove => list of files to remove when running final build
// // //////////////////////////////////////////////

var jsFiles = require(process.cwd() + '/app/config/components_en_ZA.json'),
    jsNeededForPage = {};

//converting to actual path
for (var key in jsFiles){
  for(var i=0; i<jsFiles[key].length; i++){
    jsNeededForPage[key] = [];
    jsNeededForPage[key][i] = process.cwd() + '/app/views/components/' + jsFiles[key][i] + '/js/*.js';
  }
}

// ////////////////////////////////////////////////
// Scripts Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins, concat, uglify, errorlog, rename) {
  return function(){
	  gulp.task('scripts', function() {
	  for (var key in jsFiles){
	    gulp.src(jsNeededForPage[key])
	    .pipe(concat('temp.js'))
	        .pipe(uglify())
	        .on('error', errorlog)  
	        .pipe(rename(key + '.min.js'))  // <- HERE
	        .pipe(gulp.dest('./.build/js/'))

	        .pipe(reload({stream:true}));
	  }
	});
  };
};