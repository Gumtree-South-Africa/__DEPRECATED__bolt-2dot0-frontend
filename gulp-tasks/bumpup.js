'use strict';

//////////////////////////////////////////////////
// Bump Up release version Task
//// /////////////////////////////////////////////

var cwd = process.cwd();

module.exports = function watch(gulp, plugins) {
	return function(){
    gulp.task('bumpup', function(){
      gulp.src([ 
                cwd + '/server/config/production.json',
                cwd + '/server/config/lnp.json',
                cwd + '/server/config/pp.json'
                //TODO: add localhost once assets are deployed in apache
                //cwd + '/server/config/localhost.json',
              ])
        .pipe(bump({key: 'static.server.version', type:'patch'}))
        .pipe(gulp.dest('./server/config/'));
    });
  }
}
