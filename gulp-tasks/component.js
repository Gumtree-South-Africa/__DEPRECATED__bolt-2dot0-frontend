'use strict';

// ////////////////////////////////////////////////
// Component Tasks : to create components
// Script to create: gulp component -n [name-of-the-component]
// ///////////////////////////////////////////////
var del = require('del');

module.exports = function watch(gulp, plugins) {
  return function (){
    var componentName,
        componentExist = false,
        cwd = process.cwd(),
        err = {
          'message': 'There already is a component with the same name'
        };

  	gulp.task('component', function() {
  	  componentName = argv.n;
  	  var emitter = walkdir(process.cwd() + '/app/views/components', {no_recurse: true}, function(dir, stat, depth){
  	    var base = path.basename(dir);
  	    if(componentName.toString() == base){
  	      console.log(new Error(err.message));
  	      componentExist = true;
  	      this.end();
  	    }
  	  });

  	  emitter.on('end', function(){
  	    if(!componentExist){
    	      gulp.src(cwd + '/app/views/components/__default/**/*',
    	        {
    	           base:cwd + '/app/views/components/__default'
    	        })
    	       .pipe(gulp.dest(cwd + '/app/views/components/'+ componentName))
             .on('end', function(){
               gulp.src(cwd + '/app/views/components/'+ componentName +'/views/tmphbs/**/*.hbs')
                 .pipe(plugins.rename(function (path) {
                   path.basename = path.basename.replace(/default/ig, componentName);
                 }))
                 .pipe(gulp.dest(cwd + '/app/views/components/'+ componentName +'/views/hbs'))
                 .on('end', function(){
                   del([cwd + '/app/views/components/'+ componentName +'/views/tmphbs']);
                 });
             })

    	  }
  	  });

      return emitter;
  	});
  };
};
