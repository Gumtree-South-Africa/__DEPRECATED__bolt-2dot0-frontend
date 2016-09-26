"use strict";

class Logger {
	logError(errObj) {
		if (errObj.logError) {
			return errObj.logError();
		} else {
			console.error(errObj.message);
			console.error(errObj.stack);
		}
	}
}


module.exports = new Logger();
