// test the models

'use strict';

var assert = require('assert');
var Tag = require('../app/models/tag.js');
var Sender = require('../app/models/sender.js');
var Document = require('../app/models/document.js');
var database = require('../app/config/database');
var mongoose = require('mongoose');

var uristring = database.uri + '_integration';
console.log(uristring);
if(mongoose.connection.readyState !== 1) {
  mongoose.connect(uristring, function (err) {
    if (err) {
      console.log('ERROR connecting to: ' + uristring + '. ' + err);
      return;
    }
  });
}

describe('Models', function() {

  before(function(done) {
    // clean house before starting tests
    Tag.remove({}, function(err) {
      if(err) {
        console.log(err);
      }

      Sender.remove({}, function(err) {
        if(err) {
          console.log(err);
        }

        Document.remove({}, function(err) {
          if(err) {
            console.log(err);
          }
          done();
        });
      });
    });

  });

  // close the mongo connection - not strictly necessary but
  // keep your  house clean
  after(function(done) {

    // clean house before starting tests
    Tag.remove({}, function(err) {
      if(err) {
        console.log(err);
      }

      Sender.remove({}, function(err) {
        if(err) {
          console.log(err);
        }

        Document.remove({}, function(err) {
          if(err) {
            console.log(err);
          }
          mongoose.connection.close();
          done();
        });
      });
    });
  });

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
        assert(!err, err);
        
        // find the entry again
        Sender.findOne({}).exec(function (err, foundSender) {

          console.log(foundSender);

          assert(!err, err);
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
        assert(!err, err);
        
        // find the entry again
        Tag.findOne({}).exec(function (err, foundTag) {
          assert(!err, err);
          assert.equal(foundTag.name, 'testtag', 'Tag has no name!');
          console.info('Found tag ' + foundTag.toString());
          done();
        });

      });
    });
  });

  describe('Documents', function() {
    it('instantiate a new document', function() {
      var doc = new Document({title: 'testdocument'});
      
      assert(doc, 'No doc!');
      assert.equal(doc.title, 'testdocument', 'Doc has no title!');
    });

    it('should support basic crud operations', function(done) {
      var doc = new Document({title: 'testdocument'});
      
      assert(doc, 'No doc!');
      assert.equal(doc.title, 'testdocument', 'Doc has no title!');

      doc.fileName = 'test.pdf';


      var tag = new Tag({ name: 'testtag1'});
      tag.save(function(err){
        assert(!err, err);
        console.log('use tagId: ' + tag._id);
        doc.tags.push(tag._id);

        doc.save(function(err) {
          assert(!err, err);

          assert.notEqual(doc.alternativeId, '', 'Pre save magic did not work!');

          Document.findOne({ title: 'testdocument'}).exec(function (err, foundDoc) {
            assert(!err, err);
            assert.equal(foundDoc.title, 'testdocument', 'Document has no name!');
            console.info('Found document ' + foundDoc.toString());

            // use the reference to find the selected tag
            var objectId = doc.tags[0];
            Tag.findOne( { _id: objectId }).exec(function(err, foundTag) {
              assert(!err, err);
              assert(foundTag, 'Tag not found');
              assert.equal(foundTag.name, 'testtag1', 'Tag name does not match!');

              console.info('Found tag ' + foundTag.toString());
            });

            done();
          });
        });

      });

      

    });
  });

});