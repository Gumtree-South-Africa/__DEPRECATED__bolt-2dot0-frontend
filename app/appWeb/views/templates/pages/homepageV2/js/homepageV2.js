'use strict';

// this is where we require what the page needs, so we can bundle per-page

require('app/appWeb/views/components/tileGrid/js/tileGrid.js').initialize();
require('app/appWeb/views/components/headerV2/js/header.js').initialize();
require('app/appWeb/views/components/footerV2/js/footer.js').initialize();
require('app/appWeb/views/components/gpsMap/js/markerClusterer.js');
require('app/appWeb/views/components/gpsMap/js/gpsMap.js').initialize();
require('app/appWeb/views/components/welcomeModal/js/welcomeModal.js').initialize();
require('app/appWeb/views/components/searchbarV2/js/searchbarV2.js').initialize();
