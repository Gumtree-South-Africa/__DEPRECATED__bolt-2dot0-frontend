'use strict';

// insert test area into the page for use by jasmine
$('body').append('<div id="testArea"></div>');

require('./spec/searchBarSpec/searchBarSpec.js');
require('./spec/headerSpec.js');
require('./spec/postAdSpec.js');
require('./spec/adTileSpec.js');
require('./spec/tileGridSpec.js');
require("./spec/editAdSpec.js");
require("./spec/loginFormSpec.js");
