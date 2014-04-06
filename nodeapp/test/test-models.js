// test the basic features of sqlite

'use strict';

var PersitenceModel = require('../models/persistenceModel');
var Tag = require('../models/tag');
var Sender = require('../models/sender');
var Document = require('../models/document');
var TagDao = require('../models/tagDao');
var SenderDao = require('../models/senderDao');
var DocumentDao = require('../models/documentDao');
var assert = require('assert');
var fs = require('fs');
var randomstring = require("randomstring");


describe('models', function() {

  describe('Senders', function() {

    it('instantiate a new sender', function() {
      var sender = new Sender(1, 'testsender');
      assert.equal(sender.id, 1, 'Id does not match!')
      assert.equal(sender.name, 'testsender', 'Name of sender is incorrect!');
    });

    it('should support basic crud operations', function() {

      var sender = new Sender(1, 'sender1');
      var senderDao;
      var pm = new PersitenceModel(':memory:', true);
      pm.setup().then(function(result) {
        senderDao = new SenderDao('', pm.db);
        return senderDao.add(sender);

      }).then(function(id) {

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
      
      var tag = new Tag(1, 'testtag1');
      var tagDao;
      var pm = new PersitenceModel(':memory:', true);
      pm.setup().then(function(result) {
        tagDao = new TagDao('', pm.db);
        return tagDao.add(tag);

      }).then(function(id) {
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
        assert.equal(result[0].name, 'tag2', 'Tagname does not match!');

        return tagDao.delete(1);
      }).then(function(changes) {
        assert(changes > 0, 'No changes done by delete');

        return tagDao.list();
      }).then(function(result) {

        assert.equal(result.length, 1, 'Number of retrieved elements not equal!');
        assert.equal(result[0].name, 'tag2', 'Tagname does not match!');

        return tagDao.byName('tag2');
        
      }).then(function(tag) {
        assert.equal(tag.name, 'tag2', 'Tagname does not match!');

        return tagDao.byName('tag1');
      }).then(function(tag) {

        assert.equal(tag.id, -1, 'TagID does not match!');
        assert.equal(tag.name, null, 'Tagname does not match!');
      })
      .done();

    });

  });

  describe('Documents', function() {

    it('should insert a new document', function() {

      var docDao;
      var doc = new Document({title: 'testDoc', alternativeId: randomstring.generate(7), fileName: 'testFilename', amount: 100.7});
      var tag = new Tag(1, 'test');
      var tag1 = new Tag(2, 'test1');
      doc.tags.push(tag);
      doc.tags.push(tag1);

      var pm = new PersitenceModel(':memory:', true);
      pm.setup().then(function(result) {

        pm.db.on('trace', function(param) {
          
          console.log('[' + new Date().getTime() + '] :: trace: ' + param);
          
        });

        docDao = new DocumentDao('', pm.db);
        return docDao.add(doc);

      }).then(function(id) {
        
        assert.equal(id, 1, 'The inserted id does not match');

        // todo: retrieve the number of tags with the document objct
        var tagDao = new TagDao('', pm.db);
        tagDao.list().then(function(result) {
          assert.equal(result.length, 2, 'Number of tags is wrong');
        }).done();

        return docDao.get(1);
      }).then(function(doc) {

        assert.equal(doc.id, 1, 'The id does not match');
        assert.equal(doc.title, 'testDoc', 'The title does not macht');
        assert.equal(doc.amount, 100.7, 'The amount does not macht');
        assert.equal(doc.fileName, 'testFilename', 'The fileName does not macht');
        assert(doc.alternativeId !== '', 'No alternative id available');


        doc.title = 'update1';
        doc.amount = 1000;
        doc.previewLink = 'update1';
        doc.fileName = 'update1';
        // todo: tags should be read from model
        doc.tags.push(tag);
        doc.tags.push(tag1);

        return docDao.update(doc);

      }).then(function(numchanges) {
        assert.equal(numchanges, 1, 'Number of changes done wrong');

        return docDao.get(1);
      }).then(function(doc) {

        assert.equal(doc.id, 1, 'The id does not match');
        assert.equal(doc.title, 'update1', 'The title does not macht');
        assert.equal(doc.amount, 1000, 'The amount does not macht');
        assert.equal(doc.fileName, 'update1', 'The fileName does not macht');
        assert.equal(doc.previewLink, 'update1', 'The previewLink does not macht');
        assert(doc.alternativeId !== '', 'No alternative id available');
      })
      .done();
    });
  });

});