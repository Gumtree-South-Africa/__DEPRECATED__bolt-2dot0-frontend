'use strict';

module.exports = function(config){
  var obj = {
    host : config.get('BAPI.server.host'),
    port : config.get('BAPI.server.port'),
    parameters : config.get('BAPI.server.parameters'),
    path : "/",
    method : "",
    headers: {}
  };
  return obj;
};