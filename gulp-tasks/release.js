'use strict';

//////////////////////////////////////////////////
//Clean Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
    var appVersion = require(process.cwd() + "/server/config/production.json").static.server.version;

    gulp.task('changelog', function () {
      return gulp.src('CHANGELOG.md', {
        buffer: false
      })
        // .pipe(conventionalChangelog({
        //   preset: 'angular' // Or to any other commit message convention you use.
        // }))
        .pipe(gulp.dest('./'));
    });


    gulp.task('github-release', function(done) {
      conventionalGithubReleaser({
        type: "oauth",
        token: '0126af95c0e2d9b0a7c78738c4c00a860b04acc8' // change this to your own GitHub token or use an environment variable
      }, {
        preset: 'angular' // Or to any other commit message convention you use.
      }, done);
    });

    gulp.task('commit-changes', function () {
      return gulp.src('.')
        .pipe(git.add())
        .pipe(git.commit('[Prerelease] Bumped version number: '+ appVersion));
    });


    gulp.task('push-changes', function (cb) {
      git.push('origin', 'master', cb);
    });


    gulp.task('create-new-tag', function (cb) {
      var version = getPackageJsonVersion();
      git.tag(version, 'Created Tag for version: ' + version, function (error) {
        if (error) {
          return cb(error);
        }
        git.push('origin', 'master', {args: '--tags'}, cb);
      });

      function getPackageJsonVersion () {
        // We parse the json file instead of using require because require caches
        // multiple calls so the version number won't be updated
        return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
      };
    });


    gulp.task('release', function (callback) {
      runSequence(
        'bumpup',
        'changelog',
        //'commit-changes',
        //'push-changes',
      //  'create-new-tag',
      //  'github-release',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');
          }
          callback(error);
        });
     });
   }
 }
