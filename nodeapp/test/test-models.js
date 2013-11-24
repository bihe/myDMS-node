// test the basic features of sqlite

'use strict';

var PersitenceModel = require('../models/persistenceModel');
var Tag = require('../models/tag');
var Sender = require('../models/sender');
var TagDao = require('../models/tagDao');
var SenderDao = require('../models/senderDao');
var assert = require('assert');
var fs = require('fs');
var randomstring = require("randomstring");


describe('models', function() {

  var tempDB = '';
  it('create a physical database file', function() {

    tempDB = 'test/tmp/' + randomstring.generate(7);

    var pm = new PersitenceModel(tempDB, true);
    pm.setup().then(function(result) {

      assert(result, 'Could not create the necessary tables');

      console.log('Remove the temp-db: ' + tempDB);

      fs.unlinkSync(tempDB);
      
    }).done();

  });

  describe('Senders', function() {

    it('instantiate a new sender', function() {
      var sender = new Sender(1, 'testsender');
      assert.equal(sender.id, 1, 'Id does not match!')
      assert.equal(sender.name, 'testsender', 'Name of sender is incorrect!');
    });

    it('should support basic crud operations', function() {

      var sender = new Sender(1, 'sender1');
      var senderDao= new SenderDao(':memory:', true);
      
      senderDao.add(sender).then(function(id) {

        assert.equal(id, 1, 'The inserted id does not match');
        sender.name = 'sender2';
        return senderDao.add(sender);

      }).then(function(id) {
        assert.equal(id, 2, 'The inserted id does not match');

        return senderDao.list();

      }).then(function(result) {
        assert.equal(result.length, 2, 'Number of retrieved elements not equal!');

        return senderDao.list('ender2');
      }).then(function(result) {
        assert.equal(result.length, 1, 'Number of retrieved elements not equal!');
        assert.equal(result[0].name, 'sender2', 'Number of retrieved elements not equal!');

        return senderDao.delete(1);
      }).then(function(changes) {
        assert(changes > 0, 'No changes done by delete');

        return senderDao.list();
      }).then(function(result) {

        assert.equal(result.length, 1, 'Number of retrieved elements not equal!');
        assert.equal(result[0].name, 'sender2', 'Number of retrieved elements not equal!');

        senderDao.close();

      })
      .done();

    });

  });

  describe('Tags', function() {
    
    it('instantiate a new tag', function() {
      var tag = new Tag(1, 'testtag');
      assert.equal(tag.id, 1, 'Id does not match!')
      assert.equal(tag.name, 'testtag', 'Name of tag is incorrect!');
    });

    it('should support basic crud operations', function() {
      
      var tagDao;
      var tag = new Tag(1, 'testtag1');
      var tagDao = new TagDao(':memory:', true);
        
      tagDao.add(tag).then(function(id) {
        assert.equal(id, 1, 'The inserted id does not match');
        tag.name = 'tag2';
        return tagDao.add(tag);

      }).then(function(id) {
        assert.equal(id, 2, 'The inserted id does not match');

        return tagDao.list();

      }).then(function(result) {
        assert.equal(result.length, 2, 'Number of retrieved elements not equal!');

        return tagDao.list('ag2');
      }).then(function(result) {
        assert.equal(result.length, 1, 'Number of retrieved elements not equal!');
        assert.equal(result[0].name, 'tag2', 'Number of retrieved elements not equal!');

        return tagDao.delete(1);
      }).then(function(changes) {
        assert(changes > 0, 'No changes done by delete');

        return tagDao.list();
      }).then(function(result) {

        assert.equal(result.length, 1, 'Number of retrieved elements not equal!');
        assert.equal(result[0].name, 'tag2', 'Number of retrieved elements not equal!');
        
      })
      .done();

    });

  });

});