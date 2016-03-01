'use strict';

//////////////////////////////////////////////////
// Distribution package Task
//// /////////////////////////////////////////////

var cwd = process.cwd(),
    appVersion = require(cwd + "/server/config/production.json").static.server.version;

module.exports = function watch(gulp, plugins) {
	return function(){
    gulp.task('pak:dist', function(){
      gulp.src(['./**/*', '!./{target,target/**}', '!./{public,public/**}'], {base: './'})
       .pipe(gulp.dest('./target/' + appVersion + '/tmp'))
       .on('end', function(){
         gulp.src(cwd + "/target/" + appVersion + '/tmp/**/*/')
          .pipe(tar('bolt-2dot0-frontend-' + appVersion + '.tar'))
          .pipe(gzip())
          .pipe(gulp.dest('./target/' + appVersion + '/dist'))
          .on('end', function(){
            gulp.src(['./target/'+ appVersion + '/tmp'], {read: false})
             .pipe(clean());
              console.log('Congratulations!!! DIST PACKAGING DONE SUCCESSFULLY');
            })
       })
    });
  }
}
