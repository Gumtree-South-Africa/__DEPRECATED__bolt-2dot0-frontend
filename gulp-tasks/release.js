'use strict';

//////////////////////////////////////////////////
// RELEASE Tasks
//// /////////////////////////////////////////////
var exec = require('child_process').exec;

module.exports = function watch(gulp, plugins) {
	return function() {

		function getAppVersion () {
				return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
		};

		function getStaticVersion () {
				return JSON.parse(fs.readFileSync('./server/config/production.json', 'utf8')).static.server.version;
		};

	    // Append release comments to CHANGELOG.md
	    gulp.task('changelog', function () {
			var stream =
				gulp.src('CHANGELOG.md', {buffer: false})
				   .pipe(conventionalChangelog({preset: 'express', releaseCount: 0}))
				   .pipe(gulp.dest('./'));
			return stream;
	    });

	    // Perform Release in Github
	    gulp.task('github-release', function(done) {
			var stream =
				conventionalGithubReleaser( {
					type: 'oauth',
					token: '4545aa5a9c99ea848bd0f72064809b541301bff1' // vrajendiran personal access token for public repo
				}, {
					preset: 'express' // Or to any other commit message convention you use.
				},
				done);
			return stream;
	    });

	    // Commit all files that got updated by release
	    gulp.task('commit-changes', function () {
			var stream =
	    		gulp.src('.')
	        		.pipe(git.add())
	        		.pipe(git.commit('[Prepare Release] Bumped version number --> app: '+ getAppVersion() + ', static: ' + getStaticVersion()));
			return stream;
	    });

	    // Push all committed changes to Git
	    gulp.task('push-changes', function (cb) {
			var stream =
	    		git.push('origin', 'master', cb);
			return stream;
	    });

	    // Create a new Tag in Git
	    gulp.task('create-new-tag', function (cb) {
	    	var stream  =
		    	git.tag(getAppVersion(), '[Release Tag] Created Tag for app with version: ' + getAppVersion(), function (error) {
			        if (error) {
			          return cb(error);
			        }
			        git.push('origin', 'master', {args: '--tags'}, cb);
		    	});
			return stream;
	    });


			gulp.task('push-app-nexus', function(){
				var command = 'curl -v --upload-file ./target/'+ getStaticVersion() +'/app/bolt-2dot0-frontend-' + getStaticVersion() + '.tar.gz -u admin:admin123 http://bolt-ci-nexus-v2-11-9025.phx01.dev.ebayc3.com:8081/nexus/content/repositories/bolt-node-releases/com/ebay/ecg/bolt/node/bolt-2dot0-frontend/'+ getAppVersion() +'/bolt-2dot0-frontend-'+ getAppVersion() + '.tar.gz';
				var stream =
					exec(command, function (err, stdout, stderr) {
				    console.log(stdout);
				    console.log(stderr);
				  });

				return stream;
			});


			gulp.task('push-static-nexus', function(){
				var command = 'curl -v --upload-file ./target/'+ getStaticVersion() +'/static/bolt-2dot0-frontend-static-' + getStaticVersion() + '.tar.gz -u admin:admin123 http://bolt-ci-nexus-v2-11-9025.phx01.dev.ebayc3.com:8081/nexus/content/repositories/bolt-node-releases/com/ebay/ecg/bolt/node/bolt-2dot0-frontend/'+ getAppVersion() +'/bolt-2dot0-frontend-static-'+ getStaticVersion() + '.tar.gz';
				var stream =
				  exec(command, function (err, stdout, stderr) {
				    console.log(stdout);
				    console.log(stderr);
				  });

				return stream;
			})


	    // RELEASE
	    gulp.task('release', function (callback) {
	    	runSequence(
    			'changelog',
    			'commit-changes',
    			'push-changes',
    			'create-new-tag',
    			'github-release',
				  'push-app-nexus',
				  'push-static-nexus',
		        function (error) {
		        	if (error) {
						console.log('RELEASE ERROR');
		        		console.log(error.message);
		        	} else {
		        		console.log('RELEASE FINISHED SUCCESSFULLY');
		        	}
		        	callback(error);
		        });
	    });

	}

}
