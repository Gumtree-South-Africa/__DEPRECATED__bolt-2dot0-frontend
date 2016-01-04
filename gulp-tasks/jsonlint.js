'use strict';

// ////////////////////////////////////////////////
// JSON Lint Tasks
// // /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
	  var exitOnJsonlintError = map(function (file, cb) {
	    if (!file.jsonlint.success) {
	      console.error('jsonlint failed');
	      process.exit(1);
	    }
	  });
	  return gulp.src(process.cwd() + "./app/config/*.json")
	      .pipe(jsonlint())
	      .pipe(jsonlint.reporter('fail'))
	      .pipe(exitOnJsonlintError);
  };
};