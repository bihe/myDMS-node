// test the basic features of sqlite

'use strict';

var assert = require('assert');
var Tag = require('../app/models/tag.js');
var Sender = require('../app/models/sender.js');
var Document = require('../app/models/document.js');
var database = require('../app/config/database');
var mongoose = require('mongoose');
var logger = require('../app/util/logger');
var MasterDataService = require('../app/services/masterDataService');
var DocumentService = require('../app/services/documentService');

var uristring = database.uri;
if(mongoose.connection.readyState !== 1) {
  mongoose.connect(uristring, function (err) {
    if (err) {
      console.log('ERROR connecting to: ' + uristring + '. ' + err);
      return;
    }
  });
}

// use JSON testdata
/*jshint multistr: true */
var testData = '{\
  "_id": -1,\
  "title": "TEST",\
  "fileName": "20050714Bewerbung.pdf",\
  "amount": "1",\
  "senders": [\
      {\
          "name": "Sender1",\
          "_id": -1\
      }\
  ],\
  "tags": [\
      {\
          "name": "Tag1",\
          "_id": -1\
      }\
  ],\
  "originalFilename": "20050714Bewerbung.pdf",\
  "tempFilename": "dEOqGvoe.pdf",\
  "size": 37415\
}';
var testDocument = JSON.parse(testData);


describe('Services', function() {

  before(function(){
    Sender.remove({name: 'Sender1'}, function(err) {
      if(err) {
        console.log(err);
      }
    });

    Tag.remove({name: 'Tag1'}, function(err) {
      if(err) {
        console.log(err);
      }
    });

    Document.remove({title: 'TEST'}, function(err) {
      if(err) {
        console.log(err);
      }
    });

  });

  // close the mongo connection - not strictly necessary but
  // keep your  house clean
  after(function() {
    mongoose.connection.close();
  });

  describe('Services', function() {

    it('should handle a list of senders', function(done) {
      var objectList = [],
          dataService = new MasterDataService();

      objectList.push({ _id: -1, name: 'Sender1' }); // new one
      // find the entry
      Sender.findOne({name: 'testsender'}).exec(function (err, foundSender) {
        assert(!err, err);
        objectList.push(foundSender);
        
        dataService.createAndGetSenders(objectList).then(function(senderList) {
          assert(senderList, 'No senders returned !' );
          console.log(senderList);
          assert.equal(senderList.length, 2, 'Number of senders');

          assert.notEqual(senderList[0]._id, -1, 'Wrong id');
          assert.equal(senderList[1].name, 'testsender', 'Wrong name');

          done();
        })
        .catch(function(error) {
          console.log(error.stack);
          // Handle any error from all above steps
          assert(!error, 'Error thrown!');
        })
        .done();

      });

    });

    it('should handle a list of tags', function(done) {
      var objectList = [],
          dataService = new MasterDataService();

      objectList.push({ _id: -1, name: 'Tag1' }); // new one
      // find the entry
      Tag.findOne({name: 'testtag'}).exec(function (err, foundTag) {
        assert(!err, err);
        objectList.push(foundTag);
        
        dataService.createAndGetTags(objectList).then(function(tagList) {
          assert(tagList, 'No tags returned !' );
          assert.equal(tagList.length, 2, 'Number of tags');

          assert.notEqual(tagList[0]._id, -1, 'Wrong id');
          assert.equal(tagList[1].name, 'testtag', 'Wrong name');

          done();
        })
        .catch(function(error) {
          console.log(error.stack);
          // Handle any error from all above steps
          assert(!error, 'Error thrown!');
        })
        .done();

      });
    });

    it('should save a NEW document object', function(done) {
      var documentService = new DocumentService(),
          dataService = new MasterDataService(),
          tagList,
          senderList;

      dataService.createAndGetTags(testDocument.tags).then(function(list) {
        tagList = list;

        assert(list, 'No tags supplied');

        return dataService.createAndGetSenders(testDocument.senders);
      })
      .then(function(list) {
        senderList = list;

        assert(list, 'No senders supplied');

        testDocument.tags = tagList;
        testDocument.senders = senderList;

        return documentService.save(testDocument);
      })
      .then(function(doc) {
        assert(doc, 'No document returned !' );
        assert.equal(doc.title, 'TEST', 'Wrong title');
        assert.equal(doc.senders.length, 1, 'Wrong number of senders');


        console.log('\n' + doc);
        logger.dump(doc);

        done();
      })
     .catch(function(error) {
        console.log(error.stack);
        // Handle any error from all above steps
        assert(!error, 'Error thrown!');
      })
      .done();

    });


    it('should update a document object', function(done) {
      var documentService = new DocumentService(),
          dataService = new MasterDataService(),
          tagList,
          senderList;

      Document.findOne({title: 'testdocument'}).exec(function (err, foundDoc) {
        assert(!err, err);

        testDocument._id = foundDoc._id;
        testDocument.title = foundDoc.title;
        testDocument.amount = foundDoc.amount;

        dataService.createAndGetTags(testDocument.tags).then(function(list) {
          tagList = list;

          assert(list, 'No tags supplied');

          return dataService.createAndGetSenders(testDocument.senders);
        })
        .then(function(list) {
          senderList = list;

          assert(list, 'No senders supplied');

          testDocument.tags = tagList;
          testDocument.senders = senderList;

          return documentService.save(testDocument);
        })
        .then(function(doc) {
          assert(doc, 'No document returned !' );
          assert.equal(doc.title, 'testdocument', 'Wrong title');
          assert.equal(doc.senders.length, 1, 'Wrong number of senders');


          console.log('\n' + doc);
          logger.dump(doc);

          done();
        })
       .catch(function(error) {
          console.log(error.stack);
          // Handle any error from all above steps
          assert(!error, 'Error thrown!');
        })
        .done();

      });

    });
      
  });
});
