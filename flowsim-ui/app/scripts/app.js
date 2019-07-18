'use strict';

/**
 * @ngdoc overview
 * @name flowsimUiApp
 * @description
 * # flowsimUiApp
 *
 * Main module of the application.
 */
angular
  .module('flowsimUiApp', [
    'ngResource',
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'ui.bootstrap',
    'hc.marked',
    'ui.router',
    'angulartics',
    'angulartics.google.analytics',
    'ct.ui.router.extras'
  ])
  .controller( "myController", function($scope,$window) {
     var flag = 1;
     $scope.Calling = function(){
         console.log("enter mute calling");
         $window.location.href = "#subscriber/login";
       };
  })
  .config(function ($tooltipProvider, $stateProvider, markedProvider) {
    markedProvider.setOptions({gfm: true});
    $tooltipProvider.options({
      popupDelay: 800
    });
    $stateProvider
      .state('/', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .state('packet', {
        url: '/packet',
        templateUrl: 'views/packet.html',
        controller: 'PacketCtrl'
      })
      .state('profile', {
        url: '/profile',
        resolve: {
          profileList: function(fgStore){
            return fgStore.get('profile').then(function(names){
              return names;
            });
          }
        },
        views: {
          '': {
            templateUrl: 'views/profile.html',
            controller: 'ProfileCtrl'
          },
          'config@profile': {
            template: '<ui-view/>'
          }
        }
      })
      .state('profile.editor', {
        abstract: true,
        template: '<ui-view/>'
      })
      .state('profile.editor.datapath', {
        templateUrl: 'views/profile/datapath.html'
      })
      .state('profile.editor.ports', {
        templateUrl: 'views/profile/ports.html'
      })
      .state('profile.editor.tables', {
        templateUrl: 'views/profile/tables.html'
      })
      .state('profile.editor.meters', {
        templateUrl: 'views/profile/meters.html'
      })
      .state('profile.editor.groups', {
        templateUrl: 'views/profile/groups.html'
      })
      .state('switch', {
        url: '/switch',
        resolve: {
          switchList: function(fgStore){
            return fgStore.get('switch').then(function(names){
              return names;
            });
          }
        },
        views: {
          '': {
            templateUrl: 'views/switch.html',
            controller: 'SwitchCtrl'
          },
          'config@switch': {
            template: '<ui-view/>'
          }
        }
      })



.state('switches', {
        url: '/switches',
        resolve: {
          switchList: function(fgStore){
            return fgStore.get('switches').then(function(names){
              return names;
            });
          }
        },
        views: {
          '': {
            templateUrl: 'views/switches.html',
            controller: 'SwitchCtrl'
          },
          'config@switch': {
            template: '<ui-view/>'
          }
        }
      })




      .state('switch.editor', {
        abstract: true,
        templateUrl: 'views/fgswitch.html'
      })
      .state('switch.editor.datapath', {
        template: '<fg-switch-dp/>'
      })
      .state('switch.editor.ports', {
        template: '<fg-switch-ports/>'
      })
      .state('switch.editor.tables', {
        template: '<fg-switch-tables/>'
      })
      .state('switch.editor.groups', {
        templateUrl: 'views/switch/groups.html'
      })
      .state('switch.editor.meters', {
        templateUrl: 'views/switch/meters.html'
      })
      .state('simulation', {
        deepStateRedirect: true,
        sticky: true,
        views: {
          '': {
            url: '/simulation',
            templateUrl: 'views/simulation.html',
            controller: 'SimulationCtrl as SimCtrl'
          },
          'controls@simulation': {
            templateUrl: 'views/simulation/controls.html'
          },
          'stages@simulation': {
            template: '<ui-view/>'
          }
        },
        onExit: function(Simulation){
          Simulation.Simulation.stop();
        }
      })
      .state('simulation.stages', {
        abstract: true,
        template: '<ui-view/>'
      })
      .state('simulation.stages.setup', {
        url: '/simulation',
        sticky: true,
        deepStateRedirect: true,
        resolve: {
          traceList: function(fgStore){
            return fgStore.get('trace').then(function(names){
              return names;
            });
          },
          packetList: function(fgStore){
            return fgStore.get('packet').then(function(names){
              return names;
            });
          },
          switchList: function(fgStore){
            return fgStore.get('switch').then(function(names){
              return names;
            });
          }
        },
        templateUrl: 'views/simulation/setup.html',
        controller: 'SimSetupCtrl as SimSetupCtrl'
      })
      .state('simulation.stages.arrival', {
        templateUrl: 'views/simulation/arrival.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('simulation.stages.extraction', {
        templateUrl: 'views/simulation/extraction.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('simulation.stages.choice', {
        templateUrl: 'views/simulation/choice.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('simulation.stages.selection', {
        templateUrl: 'views/simulation/selection.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('simulation.stages.execution', {
        templateUrl: 'views/simulation/execution.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('simulation.stages.groups', {
        templateUrl: 'views/simulation/groups.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('simulation.stages.egress', {
        templateUrl: 'views/simulation/egress.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('simulation.stages.final', {
        templateUrl: 'views/simulation/egress.html',
        sticky: true,
        deepStateRedirect: true
      })
      .state('subscriber', {
        url: '/subscriber',
        templateUrl: 'views/subscriber.html'
      })
      .state('subscriber.login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .state('subscriber.register', {
        url: '/register',
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .state('subscriber.update', {
        url: '/update',
        templateUrl: 'views/update.html',
        controller: 'UpdateCtrl'
      })
      .state('subscriber.verify', {
        url: '/verify/:token',
        templateUrl: 'views/verify.html',
        controller: 'VerifyCtrl'
      })
      .state('subscriber.forgot', {
        url: '/forgot',
        templateUrl: 'views/forgot.html',
        controller: 'ForgotCtrl'
      })
      .state('subscriber.reset', {
        url: '/reset/:token',
        templateUrl: 'views/reset.html',
        controller: 'ResetCtrl'
      })
      .state('documentation', {
        url: '/documentation',
        templateUrl: 'views/documentation.html',
        controller: 'DocumentationCtrl'
      })
      .state('Main' ,{
        url: '*path',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  });
