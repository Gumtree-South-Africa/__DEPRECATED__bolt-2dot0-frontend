let $ = require("../../public/js/libraries/jQuery/jquery-2.0.0.js");

describe("Sample Tests", function () {
	it("should assert true",function () {
		$("body").text("HELLO MY NAME");
		expect(true).toBeTruthy();
	})
})