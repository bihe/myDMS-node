(function() {
  'use strict';

  // module
  angular
    .module('mydms.ui')
    .controller('UIController', [
      uiController
    ])
    ;

  /*
   * handle the documents
   */
  function uiController() {

    var vm = this;


    // pure UI stuff to display the sidebar
    vm.toggleSidebar = function() {
      var element = angular.element('#sidebar');
      if(element) {
        element.toggle();
      }
    };



    //////////////////

  }

})();
