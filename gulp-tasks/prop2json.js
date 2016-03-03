'use strict';

// ////////////////////////////////////////////////
// Properties to Json Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {

  function arrangeFolder(file){
    var tmpArr = file.split(/_(.+)?/),
        folderName = tmpArr[1].split('.'),
        outputPath = process.cwd() + '/app/locales/json/' + folderName[0] + '/';
    return outputPath;
  }

  gulp.task('prop2json', function(){
    var stream =
      gulp.src(process.cwd() + '/app/locales/src/*.properties')
        .pipe(plugins.props({ outputType: 'json', minify: false, nestedProps: true, space: 4}))
        .pipe(gulp.dest(function(files){
          var fileName = files.history[1].replace(/^.*\/(.*)$/, "$1").toString();
          return arrangeFolder(fileName);
        }))

    return stream;
  })
  
};
