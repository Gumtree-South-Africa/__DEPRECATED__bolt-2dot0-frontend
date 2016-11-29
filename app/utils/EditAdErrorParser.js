"use strict";

class EditAdErrorParser {

	parseError(messageString) {
		if (messageString) {
			let sections = messageString.split(",");

			return sections[0].trim().split(":")[1].trim();
		} else {
			return null;
		}
	}

	parseErrors(errors) {
		let returnObj = [];

		errors.forEach((err) => {
			let parsedVal = this.parseError(err.message);

			if (parsedVal.indexOf("categoryAttribute") >= 0) {
				if (err.code === 'INVALID_PARAM_DEP2ATTRIBUTE') {
					// Error message for DEP2ATTRIBUTE is "categoryAttribute-<dependentAttribute>-<errorField>"
					returnObj.push(parsedVal.split("-")[2].trim());
				} else {
					returnObj.push(parsedVal.split("-")[1].trim());
				}
			} else {
				returnObj.push(parsedVal);
			}
		});

		return returnObj;
	}

}

module.exports = new EditAdErrorParser();
