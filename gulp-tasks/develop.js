'use strict';

// ////////////////////////////////////////////////
// devlop Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
    gulp.task('develop', function () {
      console.log('jjjdd: ',process.cwd());
      livereload.listen();
      nodemon({
        script: process.cwd() + '/bin/server',
        ext: 'js coffee hbs',
        stdout: false
      }).on('readable', function () {
        this.stdout.on('data', function (chunk) {
          if(/^Express server listening on port/.test(chunk)){
            livereload.changed(__dirname);
          }
        });
        this.stdout.pipe(process.stdout);
        this.stderr.pipe(process.stderr);
      });
    });
  };
};