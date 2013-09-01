'use strict';


// Declare app level module which depends on filters, and services
angular.module('myDMS', ['myDMS.filters', 'myDMS.services', 'myDMS.directives', 'myDMS.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: '/ui/partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: '/ui/partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
