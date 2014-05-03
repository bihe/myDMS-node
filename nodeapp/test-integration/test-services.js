// test the basic features of sqlite

'use strict';

var assert = require('assert');
var Tag = require('../app/models/tag.js');
var Sender = require('../app/models/sender.js');
var Document = require('../app/models/document.js');
var database = require('../app/config/database');
var mongoose = require('mongoose');
var MasterDataService = require('../app/services/masterDataService');

var uristring = database.uri;
if(mongoose.connection.readyState !== 1) {
  mongoose.connect(uristring, function (err) {
    if (err) {
      console.log('ERROR connecting to: ' + uristring + '. ' + err);
      return;
    }
  });
}


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
          assert.equal(senderList.length, 2, 'Number of senders');

          console.log('\n' + senderList);

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

          console.log('\n' + tagList);

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

  });
});