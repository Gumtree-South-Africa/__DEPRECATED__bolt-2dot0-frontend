'use strict';


// Helper functions to gather metrics data
//========================================

var usage = require('usage'), fs = require('fs'), os = require('os'), path = require('path'), MAX_HEAP = 1.2e9, // 1.2GB
	maxFileDescriptors;


// Collect memory statistics
module.exports.updateMemory = function updateMemory(stats) {
	var mem = process.memoryUsage();
	stats.rss = Math.round(mem.rss / 1e3); //Kbytes
	stats.heap_used = Math.round(mem.heapUsed / 1e3); //Kbytes
	stats.heap_max = Math.round(mem.heapTotal / 1e3); //Kbytes
};

module.exports.updateFileDescriptorCount = function updateFileDescriptorCount(stats) {
	var procPath = '/proc/' + process.pid + '/fd', openFdCount;

	try {
		openFdCount = fs.readdirSync(procPath).length;
	} catch (e) {
		openFdCount = 0; // Cannot determine it. Maybe no procfs as on OSX
	}
	stats.availableFileDescriptors = maxFileDescriptors - openFdCount;
};

// Run once at start to get max file descriptors for the process.
module.exports.determineMaxFileDescriptors = function determineMaxFileDescriptors(callback) {
	if (os.platform() === 'win32') {
		callback(null, 0);
	}
	var exec = require('child_process').exec;

	exec('ulimit -n', function(error, stdout) {
		var fdMax = parseInt(stdout, 10);
		if (error !== null) {
			console.error(genLogMsg('Cannot determine max file descriptors ' + error));
			callback(error, 0);
		} else {
			maxFileDescriptors = fdMax;
			callback(null, fdMax);
			return;
		}
	});
};

// Get cpu usage, finalize GC overhead based on total CPU vs % GC used
module.exports.finalUpdateStats = function finalUpdateStats(stats, durationSeconds, callback) {
	usage.lookup(process.pid, {
		keepHistory: true
	}, function(err, result) {
		var cpusec = 0, cpuMsec = 0, gcOverhead = 0;

		if (err) {
			console.log(genLogMsg(err));
			return callback('error', err);
		} else {
			// In durationSeconds clock time, we have used result.cpu % in active CPU work.
			// Compute how many seconds that percentage amounts to.
			if (result.cpu && result.cpu !== 0) {
				cpusec = durationSeconds * (result.cpu / 100);
				cpuMsec = cpusec * 1000;
			}

			// stat.gcInterval holds total msec spent in GC work. Compute GC % of CPU used
			if (stats.gcInterval !== 0 && cpuMsec !== 0) {
				gcOverhead = stats.gcInterval / cpuMsec;
			}
			stats.gcInterval = gcOverhead;
			stats.cpu = result.cpu;
			return callback(null, stats);
		}
	});

};


function shutdown(force) {
	if (!force && process.send) {
		process.emit('SIGTERM');
		setTimeout(function() {
			shutdown(true);
		}, 40000).unref();
	} else {
		process.exit(1);
	}
}

// Check if too little memory left to keep handling requests. If so,
// close server to gracefully finish outstanding ones.
// Note that this is also checked on the non-request path so req may not be available.
module.exports.checkHeapFull = function checkHeapFull(req, intervalId) {
	var mem = process.memoryUsage();

	if (mem.heapUsed > MAX_HEAP) {
		console.error(genLogMsg('Exiting node process as memory usage > 1.2GB ' + mem.heapUsed));
		clearInterval(intervalId);
		// TODO Can this be done by emit of a shutdown event?
		if (req) {
			var server = req.socket.server;
			server.close();
		}

		shutdown();
	}
};


function pad(n) {
	return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

function timestamp() {
	var d = new Date();
	var time = [
		pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())
	].join(':');
	return [d.getYear() % 100, d.getMonth() + 1, d.getDate()].join('-') + ':' + time;
}

function genLogMsg(msg) {
	return timestamp() + ' ' + msg;
}

module.exports.genLogMsg = genLogMsg;
