'use strict';

/* App Module */

var mydmsApp = angular.module('mydmsApp', ['http-auth-interceptor', 'ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate']);

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

            // Call when the 401 response is returned by the client
            $rootScope.$on('event:auth-loginRequired', function(rejection) {
                $rootScope.authenticated = false;
                if ($location.path() !== "/" && $location.path() !== "") {
                    $location.path('/login').replace();
                }
            });

            // Call when the user is authenticated
           $rootScope.$on('event:auth-authConfirmed', function() {
               $rootScope.authenticated = true;
               //$rootScope.account = Account.get();

               // If the login page has been requested and the user is already logged in
               // the user is redirected to the home page
               if ($location.path() === "/login") {
                   $location.path('/').replace();
               }
            });

            // Call when the user logs in
            $rootScope.$on('event:auth-loginConfirmed', function() {
                $rootScope.authenticated = true;
                //$rootScope.account = Account.get();
                $location.path('').replace();
            });

            // Call when the user logs out
            $rootScope.$on('event:auth-loginCancelled', function() {
                $rootScope.authenticated = false;
                $location.path('');
            });
        }]);
