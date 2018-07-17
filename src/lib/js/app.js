'use strict';

/* create the app */
var app = angular.module('app', [
  'ngResource',
  'ngSanitize',
  'ngCookies',
  'ui.router',
  'ui.bootstrap'
  ]);

/* @@include('app/constants.js') */
/* @@include('app/filters.js') */
/* @@include('app/routing.js') */
/* @@include('app/factories.js') */
/* @@include('app/services.js') */
/* @@include('app/controllers.js') */
/* @@include('app/directives.js') */



app.config([
  '$httpProvider',
  function($httpProvider) {
    $httpProvider.interceptors.push('httpErrorInterceptor');
  }
])