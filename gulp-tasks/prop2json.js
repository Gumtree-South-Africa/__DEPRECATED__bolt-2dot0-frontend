'use strict';

// ////////////////////////////////////////////////
// Properties to Json Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins, concat, uglify, errorlog, rename) {

  function arrangeFolder(file){
    var tmpArr = file.split(/_(.+)?/),
        folderName = tmpArr[1].split('.'),
        outputPath = process.cwd() + '/app/locales/json/' + folderName[0] + '/';
    return outputPath;
  }

  return function(){
    gulp.task('prop2json', function(){
        gulp.src(process.cwd() + '/app/locales/src/*.properties')
          .pipe(props({ outputType: 'json', minify: false, nestedProps: true, space: 4}))
          .pipe(rename(function(path){
              path.basename = 'translation';
          }))
          .pipe(gulp.dest(function(files){
            var fileName = files.history[1].replace(/^.*\/(.*)$/, "$1").toString();
            return arrangeFolder(fileName);
          }))
    })
  }
}