// test the basic features of sqlite

'use strict';

var assert = require('assert');
var randomstring = require('randomstring');
var Tag = require('../app/models/tag.js');
var Sender = require('../app/models/sender.js');
var database = require('../app/config/database');
var mongoose = require('mongoose');

var uristring = database.uri;
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});

describe('models', function() {

  describe('Senders', function() {

    it('instantiate a new sender', function() {
      var sender = new Sender({name: 'testsender'});
      assert(sender, 'No sender!');
      assert.equal(sender.name, 'testsender', 'Sender has no name!');
    });

    it('should support basic crud operations', function(done) {
      var sender = new Sender({name: 'testsender'});
      assert(sender, 'No sender!');
      assert.equal(sender.name, 'testsender', 'Sender has no name!');

      sender.save(function (err) {
        assert(!err, 'Could not save');
        
        // find the entry again
        Sender.findOne({}).exec(function (err, foundSender) {
          assert(!err, 'Could not fetch');
          assert.equal(foundSender.name, 'testsender', 'Sender has no name!');
          console.info('Found sender ' + foundSender.toString());
          done();
        });

      });
      
    });

  });

  describe('Tags', function() {
    
    it('instantiate a new tag', function() {
      var tag = new Tag({name: 'testtag'});
      assert(tag, 'No tag!');
      assert.equal(tag.name, 'testtag', 'Tag has no name!');
    });

    it('should support basic crud operations', function(done) {
      var tag = new Tag({name: 'testtag'});
      assert(tag, 'No tag!');
      assert.equal(tag.name, 'testtag', 'Tag has no name!');

      tag.save(function (err) {
        assert(!err, 'Could not save');
        
        // find the entry again
        Tag.findOne({}).exec(function (err, foundTag) {
          assert(!err, 'Could not fetch');
          assert.equal(foundTag.name, 'testtag', 'Tag has no name!');
          console.info('Found tag ' + foundTag.toString());
          done();
        });

      });
    });
  });

  describe('Documents', function() {

  });

});