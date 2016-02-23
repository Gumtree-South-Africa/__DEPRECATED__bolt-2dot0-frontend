'use strict';

// ////////////////////////////////////////////////
// Bundling Tasks
// ///////////////////////////////////////////////

module.exports = function watch(gulp, plugins) {
	return function(){
    var appVersion = require(process.cwd() + "/server/config/production.json").static.server.version;
    var folderList = [];

    gulp.task('pak', function() {
      gulp.src(process.cwd() + "/" + "public/**/*/")
        .pipe(tar('bolt-2dot0-frontend-static-'+ appVersion +'.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('./target/' + appVersion + '/static'))
				.on('end', function(){
	          console.log('Congratulations!!! STATIC PACKAGING DONE SUCCESSFULLY');
	      })
    })
  }
}
