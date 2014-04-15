'use strict';

/* App Module */

var mydmsApp = angular.module('mydmsApp', ['ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate']);

mydmsApp
    .config(['$routeProvider', '$httpProvider', '$translateProvider',
        function ($routeProvider, $httpProvider, $translateProvider) {
            $routeProvider
                /*.when('/login', {
                   templateUrl: 'views/login.html',
                    controller: 'LoginController'
                })
                */
                .otherwise({
                    templateUrl: 'views/main.html',
                    controller: 'MainController'
                })

            // Initialize angular-translate
            $translateProvider.useStaticFilesLoader({
                prefix: './i18n/',
                suffix: '.json'
            });

            $translateProvider.preferredLanguage('en');

            // remember language
            $translateProvider.useCookieStorage();
        }])
        .run(['$rootScope', '$location',
            function($rootScope, $location) {
            $rootScope.$on("$routeChangeStart", function(event, next, current) {
                // Check if the status of the user. Is it authenticated or not?
                // AuthenticationSharedService.authenticate({}, function() {
                //     $rootScope.authenticated = true;
                // });
            });
        }]);
