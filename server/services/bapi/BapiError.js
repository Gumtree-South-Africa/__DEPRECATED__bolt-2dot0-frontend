"use strict";

class ExtendableError extends Error {
	constructor(msg) {
		super(msg);
		this.name = this.constructor.name;
		this.message = msg;
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(msg)).stack;
		}
	}
}

class BapiError extends ExtendableError {
	constructor(msg, options) {
		super(msg);
		options = options || {};
		this.statusCode = options.statusCode;
		this.bapiJson = options.bapiJson;
	}

	/**
	 * returns statusCode from the error obj or returns passed in default
	 * @param defaultStatusCode
	 * @returns statusCode  (int)
	 */
	getStatusCode(defaultStatusCode) {
		return this.statusCode || defaultStatusCode;
	}

	/**
	 * cleans bapiJson to remove unnecessary information that is noise
	 */
	cleanBapiJson() {
		// strip out what we don't want to log from bapi
		this.bapiJson.details.forEach((item) => {
			delete item._links;
		});
	}

	/**
	 * parses bapi json into slimmer version to return to client
	 */
	parseBapiJson() {
		this.parsedBapiJson = {
			message: this.bapiJson.message
		};
	}

	/**
	 * returns parsed bapi json for client
	 * @returns Object: slimmed bapi data to return the the client
	 */
	getParsedBapiData() {
		if (!this.bapiJson) {
			return null;// no bapi json to parse
		}

		if (!this.parsedBapiJson) {
			this.parseBapiJson(); // json hasnt been parsed yet
		}

		return this.parsedBapiJson;
	}

	/**
	 * logs error message, stack and bapiJson(if available) to server logs
	 * @returns Object: slimmed bapi data to return the the client
	 */
	logError() {
		let returnData;
		console.error(this.message);
		if (this.bapiJson) {
			this.cleanBapiJson();
			console.error(`bapiJson: ${JSON.stringify(this.bapiJson, null, 4)}`);
			// for now, were just passing the message to the client
			// todo: map the bapiJson for best exposure to client
			returnData = this.getParsedBapiData();
		}
		console.error(this.stack);

		return returnData;
	}
}

module.exports = BapiError;


