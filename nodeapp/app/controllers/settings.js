/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var logger = require('../util/logger' );
var utils = require('../util/utils' );
var config = require('../config/application');
var DocumentService = require('../services/documentService');
var MasterDataService = require('../services/masterDataService');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');


/**
 * process a document and save/update the document
 */
function __processDocument(document, callback) {
  var documentService = new DocumentService(),
      dataService = new MasterDataService(),
      tagList,
      senderList;

  dataService.createAndGetTags(document.tags, true).then(function(list) {
    tagList = list;

    return dataService.createAndGetSenders(document.senders, true);
  })
  .then(function(list) {
    senderList = list;

    document.tags = tagList;
    document.senders = senderList;
    // parse the creation date
    //document.created = moment(document.created, 'YYYY-MM-DD');

    return documentService.save(document);
  })
  .then(function(doc) {
    callback(null, doc);
  })
 .catch(function(error) {
    console.log(error.stack);
    // Handle any error from all above steps
    callback(error);
  })
  .done();
}


/*
 * url: /settings
 * post the import data and create objects based on this data
 */
exports.save = function( req, res, next ) {
  var payload, itemCount = 0,
      masterDataService = new MasterDataService(),
      documentService = new DocumentService(),
      tags = [],
      senders = [];

  try {
    payload = req.body;

    // process all the supplied entries serial
    // tags, senders, documents
    async.waterfall([
      function(callback) {
        // tags first
        if(payload.tags && payload.tags.length > 0) {

          _.forEach(payload.tags, function(tag) {
            tags.push({name: tag, _id: -1});
          });

          masterDataService.createAndGetTags(tags).then(function(list) {
            console.log('tag list: ' +  list);
            itemCount = list.length;

            callback(null, itemCount);
          })
          .catch(function(error) {
            console.log(error.stack);
            return callback(error);
          })
          .done();

        } else {
          callback(null, itemCount);
        }
      },
      function(count, callback) {
        // senders second
        if(payload.senders && payload.senders.length > 0) {

          _.forEach(payload.senders, function(sender) {
            senders.push({name: sender, _id: -1});
          });

          masterDataService.createAndGetSenders(senders).then(function(list) {
            console.log('sender list: ' +  list);
            itemCount = count + list.length;

            callback(null, itemCount);
          })
          .catch(function(error) {
            console.log(error.stack);
            return callback(error);
          })
          .done();
        } else {
          callback(null, itemCount);
        }
      },
      function(count, callback) {
        // process the documents
        if(payload.documents && payload.documents.length > 0) {

          async.each(payload.documents, function(document, cb) {
            // prepare one document, before it can be processed
            tags = [];
            senders = [];

            _.forEach(document.tags, function(tag) {
              tags.push({name: tag, _id: -1});
            });

            _.forEach(document.senders, function(sender) {
              senders.push({name: sender, _id: -1});
            });

            document.tags = tags;
            document.senders = senders;

            __processDocument(document, function(err, doc) {
              if(err) {
                console.log('---- CALL ERROR CALLBACK -----');
                return cb(err);
              }
              if(!doc) {
                return cb(new Error('Document is null!'));
              }

              // update the state of the document
              documentService.endDocumentChange(doc._id)
              .then(function(doc) {
                itemCount = itemCount + 1;
                cb();
              })
              .catch(function(error) {
                console.log(error.stack);
                return cb(error);
              })
              .done();
            });

          }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if(err) {
              return callback(err);
            }

            callback(null, itemCount);
          });

        } else {
          callback(null, itemCount);
        }
      }
    ], function(error, result) {
      // I am done here
      if(error) {
        console.log(error);
        return res.status(500).send('Cannot save settings! ' + error);
      }
      return res.status(200).send('Settings saved! ' + result + ' entries processed!');
    });

  } catch(err) {
    console.log('Got an error: ' + err);
    console.log(err.stack);

    return res.status(500).send('Cannot save settings! ' + err);
  }

};