/**
 * HomePage Jasmine Test Spec
 */
var request = require("request");

var base_url = "http://gumtree.co.za.localhost:8000/"

describe("Server to hit HomePage", function() {
  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it("returns Gumtree", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(body).toContain("<h1>Welcome to Gumtree!");
        done();
      });
    });
  });
});