'use strict';

let $ = require("jquery");

// insert test area into the page for use by jasmine
$('body').append('<div id="testArea"></div>');

require('./spec/searchBarSpec/searchBarSpec.js');
