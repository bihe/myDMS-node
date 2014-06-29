'use strict';

/**
 * @author Henrik Binggl
 * Service to handle document interaction; persistance, ...
 *
 * Use promise approach to chain the logic with other
 * necessary logic
 */

var async = require('async');
var q = require('q');
var Document = require('../models/document');
var _ = require('lodash');
var u = require('../util/utils');

/**
 * @constructor
 */
function DocumentService() {
}

/* 
 * method, logic implementation
 */
DocumentService.prototype = {

  /**
   * save the document or create a new one, depending on the 
   * supplied id
   *
   * @return {deferred} a promise with the saved document
   */
  save: function(document) {
    var deferred = q.defer(),
        doc, self;

    // again use a async approach
    // 1) check if new one -- create a document
    //  or fetch a document
    // 2) update the object with the supplied data
    //  and save the object again
    self = this;
    async.series([
      // 1) check the supplied documentId
      function(callback) {
        try {
          if(document._id === -1) {
            doc = new Document({title: document.title});
            callback(null);
          } else {
            // try to find the document
            Document.findById(document._id).exec(function (err, foundDoc) {
              if(err) {
                return callback(err);
              }

              if(!foundDoc) {
                return callback(new Error('No entry found'));
              }

              doc = foundDoc;
              callback(null);
            });
          }
        } catch(err) {
          callback(err);
        }
      },
      // 2) update the object and save it
      function(callback) {
        try {

          doc.title = document.title;
          doc.fileName = document.fileName;
          doc.previewLink = document.previewLink;
          doc.amount = document.amount;
          doc.senders = document.senders;
          doc.tags = document.tags;

          if(document.created && _.isString(document.created)) {
            doc.created = u.parseDate(document.created);
            // special case, when a created string is passed on
            // use this also as a modified date
            doc.modified = doc.created;
          }
          if(document.alternativeId) {
            doc.alternativeId = document.alternativeId;
          }

          doc.save(function(err, d) {
            if(err) {
              return callback(err);
            }

            if(!d) {
              return callback(new Error('Item not saved!'));
            }

            doc = d;
            callback(null);
          });

        } catch(err) {
          callback(err);
        }
      }
    ],
    function(error,result) {
      // I am done here
      if(error) {
        return deferred.reject(error);
      }
      deferred.resolve(doc);
    });

    return deferred.promise;
  }
};

module.exports = DocumentService;