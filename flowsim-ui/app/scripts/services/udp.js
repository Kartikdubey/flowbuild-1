'use strict';

angular.module('flowsimUiApp')
  .factory('UDP', function() {

var UDP = {
  name: 'UDP',
  bytes: 8,
  fields:[{
    name: 'Src',
    bitwidth: 16,
    matchable: true,
    setable: true,
    tip: 'Source Port'
  },{
    name: 'Dst',
    bitwidth: 16,
    matchable: true,
    setable: true,
    tip: 'Destination Port'
  }]
};

var Payloads = {
  Type: {
    'payload':'Payload'
  }
};

return {
  UDP: UDP,
  Payloads: Payloads
};

});