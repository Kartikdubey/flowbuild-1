'use strict';

/**
 * @ngdoc directive
 * @name flowsimUiApp.directive:fgList
 * @description
 * # fgList
 */
angular.module('flowsimUiApp')
  .directive('fgList', function () {

    return {
      restrict: 'E',                      // HTML Element
      transclude: true,                   // Copy element body in
      templateUrl: 'views/fglist.html',         // Location of template
      scope: {
        onInit: '&',                      // callback for initializing items
        onAdd: '&',                       // callback for adding item
        onDel: '&',                       // callback for deleting item
        onSet: '&',                        // callback for changing item focus
        category: '@'
      },
      controller: function($scope,$http) {
        $scope.itemName = '';             // input name to create item
        $scope.focus    = -1;                // item with current focus
        $scope.errorMsg = '';         // input name error message

        $scope.items = [];                // display list of items
        $scope.init = false;              // dislay list initialization state

        $scope.clearState = function() {
          $scope.itemName = '';
          $scope.errorMsg = '';
        };

        $scope.shiftFocus = function(pos) {
          if(pos >= -1 && pos < $scope.items.length) {
            $scope.clearState();
            $scope.focus = pos;                   // Update the local focus
            $scope.onSet()($scope.items[pos]);    // Update the parent with name
          }
        };

        $scope.addItem = function() {
			     
			/*	 $http({
                   url : "http://10.177.125.6:8181/onos/v1/devices",
				   data: {"username": "onos", "password": "rocks"},
                  method : 'GET',
                 headers : {
                       
                   Authorization: 'Basic b25vczpyb2Nrcw=='
                   }
					}).success(function(data){
						console.log(data);
						alert("login Successfully");
					}).error(function(error){
						console.log(error);
						alert("login error");
					})*/
          $scope.onAdd()($scope.itemName, function(err) {
            if(err) {
              $scope.itemName = '';
              $scope.errorMsg = err;
            } else {
              $scope.items.push($scope.itemName);
              $scope.shiftFocus($scope.items.length-1);
            }
          });
        };

        $scope.delItem = function(pos) {
          var item;
          if(pos >= -1 && pos < $scope.items.length) {
            item = $scope.items.splice(pos, 1);
            if(pos < $scope.focus) {
              $scope.shiftFocus($scope.focus-1);
            }
            if(pos === $scope.focus && pos === $scope.items.length) {
              $scope.shiftFocus($scope.focus-1);
            }
            if(pos === $scope.focus){
              $scope.shiftFocus($scope.focus);
            }
            $scope.onDel()(item);
            $scope.clearState();
          }
        };

        $scope.onInit()(function(err, result) {
          if(err) {
            console.log(err.details);
          } else {
            $scope.items = result;
            if(result.length > 0) {
              $scope.shiftFocus(0);
            }
          }
        });

        $scope.$on('$destroy', function(){
          $scope.itemName = '';
          $scope.focus = -1;
          $scope.items = [];
          $scope.init = false;
        });

      }
    };
  });
