/// <reference path="../typings/mocha/mocha.d.ts"/>
// test the models

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Tag = require('../app/models/tag.js');
var Sender = require('../app/models/sender.js');
var Document = require('../app/models/document.js');
var User = require('../app/models/user.js');
var database = require('../app/config/database');
var config = require('../app/config/application');
var mongoose = require('mongoose');
var logger = require('../app/util/logger');
var MasterDataService = require('../app/services/masterDataService');
var DocumentService = require('../app/services/documentService');
var UserService = require('../app/services/userService');

var logger = require('../app/util/logger');

var uristring = database.uri + '_integration';

console.log(uristring);
if(mongoose.connection.readyState !== 1) {
  mongoose.connect(uristring, database.options, function (err) {
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

describe('MongoDB', function() {
  describe('module', function() {
    it('should be imported', function(done) {
      var mongoose = require('mongoose');
      assert(mongoose, 'Could not import!');
      done();
    });
  });
});

describe('Backend', function() {

  before(function(done) {
    // clean house before starting tests
    User.remove({}, function(err) {
      if(err) {
        console.log(err);
      }

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

            var sender = new Sender({name: 'testsender'});
            sender.save(function (err) {
              assert(!err, err);

              var tag = new Tag({name: 'testtag'});
              tag.save(function (err) {
                assert(!err, err);

                done();
              });
            });
          });
        });
      });
    });
  });

  // close the mongo connection - not strictly necessary but
  // keep your  house clean
  after(function(done) {
    // clean house before starting tests
    User.remove({}, function(err) {
      if(err) {
        console.log(err);
      }

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
  });

  describe('Users', function() {
    it('should save a new user', function(done) {
      var user = new User({displayName: 'Test User', email: 'test@example.com'});

      user.save(function(err) {
        assert(!err, err);
        User.findOne({}).exec(function(err, foundUser) {
          assert(!err, err);
          foundUser.token = { a: 'b', c: { aa: 'bb', c: 'cc', d: 'dd'}};

          foundUser.save(function(err) {

            User.findOne({}).exec(function(err, foundUser) {
              assert(!err, err);
              console.log(foundUser);

              assert.equal(foundUser.token.a, 'b', 'User object path does not match b!');
              assert.equal(foundUser.token.c.c, 'cc', 'User object path does not match cc!');

              done();
            });
          });
        });

      });

    });

    it('find a user by email', function(done) {
      var user = new User({displayName: 'Test User', email: 'test@example.com'});

      user.save(function(err) {
        assert(!err, err);

        var userService = new UserService();

        userService.findUserByEmail('test@example.com').then(function(user) {
          assert(user, 'No user!');
          assert.equal(user.email, 'test@example.com', 'Wrong email!');
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



      Document.findOne({title: 'TEST'}).populate('tags senders').exec(function (err, foundDoc) {

        assert(!err, err);

        testDocument = foundDoc;
        testDocument.amount = 2;

        console.log('#### testdocument #### ' + testDocument);
        logger.dump(testDocument);

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
          assert.equal(doc.amount, 2, 'Wrong amount');

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

    it('Delete files in the temp folder', function(done) {
      var documentService = new DocumentService()
        , folder = ''
        , folders = [];

      folder = path.join(__dirname, '..', config.application.upload.tempFilePath);
      folders.push(folder);

      // create test files
      fs.writeFile(path.join(folder, 'tempfil1'), 'content', function(err) {
        assert(!err, 'Error thrown!');

        fs.writeFile(path.join(folder, 'tempfil2'), 'content', function(err) {
          assert(!err, 'Error thrown!');

          documentService.clearFiles(folders).then(function(numFiles) {
            //console.log('deletedFiles: ' + numFiles);

            assert.equal(numFiles, 2, 'Wrong number of files deleted!');

            done();

          }).catch(function(error) {
             console.log(error.stack);
             // Handle any error from all above steps
             assert(!error, 'Error thrown!');
           })
          .done();

        });
      });

    });
  });

});
