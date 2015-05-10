(function (ng) {
  'use strict';
  var module = ng.module('hb.infiniScroll', []);

  // credit goes to lorenzofox3 --> http://lorenzofox3.github.io/lrInfiniteScroll/index.html
  // adapted to my needs, yeah - not really, more ore less the same module!
  module.directive('infiniScroll', ['$timeout', '$window',
    function (timeout, $window) {
      return {
        link: function (scope, element, attr) {
          var
            lengthThreshold = attr.scrollThreshold || 50,
            timeThreshold = attr.timeThreshold || 400,
            handler = scope.$eval(attr.infiniScroll),
            promise = null,
            lastRemaining = 9999;

          lengthThreshold = parseInt(lengthThreshold, 10);
          timeThreshold = parseInt(timeThreshold, 10);

          if (!handler || !ng.isFunction(handler)) {
            handler = ng.noop;
          }

          // bind to the window, watch the body
          var bindElement = ng.element($window);
          var compareElement = ng.element('body');

          bindElement.bind('scroll', function () {

            var remaining =
              compareElement[0].scrollHeight - (bindElement.height() + compareElement[0].scrollTop);

            //if we have reached the threshold and we scroll down
            if (remaining < lengthThreshold && (remaining - lastRemaining) < 0) {

              //if there is already a timer running which has no expired yet we have to cancel it and restart the timer
              if (promise !== null) {
                timeout.cancel(promise);
              }
              promise = timeout(function () {
                handler();
                promise = null;
              }, timeThreshold);
            }
            lastRemaining = remaining;
          });
        }

      };
    }
  ]);
})(angular);