'use strict';

// ////////////////////////////////////////////////
// Component Tasks : to create components
// Script to create: gulp component -n [name-of-the-component]
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function (){
    var componentExist = false,
    err = {
      'message': 'There already is a component with the same name' 
    };
 
	gulp.task('component', function() {
	  
	  var componentName = argv.n;
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
	      return gulp.src(process.cwd() + '/app/views/components/__default/**/*',
	        {
	           base: process.cwd() + '/app/views/components/__default'
	        })
	       .pipe(gulp.dest(process.cwd() + '/app/views/components/'+ componentName))
	    }
	  });

	});
  };
};