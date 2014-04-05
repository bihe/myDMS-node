// test mongodb functionality

'use strict';

var assert = require('assert');

describe('mongo', function() {
    describe('module', function() {
        
        it('should be imported', function(done) {
            var mongoose = require('mongoose');
            assert(mongoose, 'Could not import!');
            done();
        });
        
    });
});