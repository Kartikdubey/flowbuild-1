'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.regex
 * @description
 * # regex
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('Regex', function() {

return {
  Identifier: /^[a-zA-Z_][a-zA-Z_0-9.-]*$/
};

});
