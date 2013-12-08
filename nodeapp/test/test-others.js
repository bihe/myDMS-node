// test the basic features of sqlite

'use strict';

var async = require('async');
var assert = require('assert');
var _ = require('lodash');

describe('others', function() {
  describe('async', function() {
    it('async serial', function(done) {

      async.series([
          function(callback) {
            
            setTimeout( function() { callback(null, 1); }, 200);
            
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

          assert.equal(result.length, 2, 'Wrong number of entries returned');
          assert.equal(result[0], 1, 'Wrong entry at index 0');
          assert.equal(result[1], 2, 'Wrong entry at index 0');

          console.log(result);

          done();
        }
      );

    });
  });
});