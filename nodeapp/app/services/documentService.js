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
   * a document object is supplied which should be saved
   * based on the supplied id either a new document
   * has to be created, or an existing one has to be updated
   *
   * @return {deferred} a promise with the saved document
   */
  save: function(document) {
    var deferred = q.defer(),
        doc;

    // again use a async approach
    // 1) check if new one -- create a document
    //  or fetch a document
    // 2) update the object with the supplied data
    //  and save the object again
    
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