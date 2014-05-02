// test the basic features of sqlite

'use strict';

var assert = require('assert');
var Tag = require('../app/models/tag.js');
var Sender = require('../app/models/sender.js');
var Document = require('../app/models/document.js');
var database = require('../app/config/database');
var mongoose = require('mongoose');
var SenderService = require('../app/services/senderService');

var uristring = database.uri;
mongoose.connect(uristring, function (err) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});

describe('models', function() {

  before(function(){
    Sender.remove({name: 'Sender1'}, function(err) {
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
          senderService = new SenderService();

      objectList.push({ _id: -1, name: 'Sender1' }); // new one
      // find the entry
      Sender.findOne({name: 'testsender'}).exec(function (err, foundSender) {
        assert(!err, err);
        objectList.push(foundSender);
        
        senderService.createAndGetSenders(objectList).then(function(senderList) {
          assert(senderList, 'No Senders returned !' );
          assert.equal(senderList.length, 2, 'Number of senders');

          console.log(senderList);

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

  });
});