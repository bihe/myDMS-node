// test async library

'use strict';

var async = require('async');
var assert = require('assert');

describe('Other logic', function() {
  describe('Try the async library', function() {
    it('async serial', function(done) {

      async.series([
          function(callback) {

            setTimeout( function() { callback(null, 1); }, 200);

          },
          function(callback) {

            setTimeout( function() { callback(null); }, 150);

          },
          function(callback) {

            setTimeout( function() { callback(null, 2); }, 100);

          }
        ],
        function(error, result) {
          if(error) {
            console.log('error: ' + error);
            throw new Error(error);
          }

          assert(result, 'No result returned!');

          assert.equal(result.length, 3, 'Wrong number of entries returned');
          assert.equal(result[0], 1, 'Wrong entry at index 0');
          assert.equal(result[2], 2, 'Wrong entry at index 1');

          console.log(result);

          done();
        }
      );

    });
  });
});
