'use strict';

/**
 * @ngdoc function
 * @name flowsimUiApp.controller:DialogProfileMatchCtrl
 * @description
 * # DialogProfileMatchCtrl
 * Controller of the flowsimUiApp
 */
angular.module('flowsimUiApp')
  .controller('DialogProfileMatchCtrl', function ($scope, $modalInstance, 
                                                  match, tableName, tableId) {
    $scope.match     = match;
    $scope.tableName = tableName;
    $scope.tableId   = tableId;

    $scope.ok = function() {
      $modalInstance.close($scope.match);
    };
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });
