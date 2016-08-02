'use strict';

// ////////////////////////////////////////////////
// Pre-compilation of Handlebars template Tasks
// // /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
    gulp.task('precompile', function () {
      var pagesArr, idx, pageJson, srcFiles, destFile;
      //TODO: remove this to a config file
      var precompileMap = require('../app/config/precompile');

      pagesArr = precompileMap.files;
      for (idx = 0; idx < pagesArr.length; ++idx) {
        pageJson = pagesArr[idx];
        srcFiles = pageJson.src; // Arr with all the source files
        destFile = pageJson.dest;
        // Read each key/value(array)
        gulp.src(srcFiles, {base : './app/appWeb/views/templates/precompile/hbs'})
            .pipe(plugins.handlebars())
            .pipe(plugins.declare({
              namespace: 'Handlebars.templates',
              noRedeclare: true, // Avoid duplicate declarations
            }))
            .pipe(plugins.concat(destFile))
            .pipe(gulp.dest('./public/js/precompiled/'));
      }
    });
  };
};
