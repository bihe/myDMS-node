'use strict';

/**
 * @author Henrik Binggl
 * Service to handle document interaction; persistance, ...
 *
 * Use promise approach to chain the logic with other
 * necessary logic
 */

var fs = require('fs');
var path = require('path');
var async = require('async');
var q = require('q');
var moment = require('moment');
var Document = require('../models/document');
var config = require('../config/application');
//var u = require('../util/utils');

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
          //doc.modified = new Date();

          // if(document.created && _.isString(document.created)) {
          //   doc.created = u.parseDate(document.created);
          // }

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
  },

  /**
   * retrieve the binary content of the document
   * @param id {objectid} the document id
   * 
   * @return {deferred} a promise with a stream object
   */
  getBinary: function(id) {
    var deferred = q.defer(),
      fileName,
      filePath,
      readStream;
      
    Document.findById(id).exec(function (err, foundDoc) {
      if(err) {
        return deferred.reject(err);
      }

      if(!foundDoc) {
        return deferred.reject(new Error('No entry found'));
      }

      // got the document, now read the data from the specified file
      fileName = foundDoc.fileName;
      filePath = path.join(__dirname, '../../', config.application.upload.filePath) + '/' + fileName;

      console.log('read file: ' + filePath);

      fs.exists(filePath, function(exists) {
        if (!exists) {
          return deferred.reject(new Error('The file '  + filePath + ' does not exist!'));
        }
        readStream = fs.createReadStream(filePath);
        deferred.resolve(readStream);
      });

    });

    return deferred.promise;
  },

  /**
   * creates a folder for the document based on the creation date
   * if the folder exists only return the foldername
   * @param document {Document} the document object
   *
   * @return {String} folderName
   */
  createDir: function(document) {
    var deferred = q.defer(),
      dirPath,
      dirName;

    dirName = moment(document.created).format('YYYY_MM_DD');
    dirPath = path.join(__dirname, '../../', config.application.upload.filePath) + '/' + dirName;

    fs.exists(dirPath, function(exists) {
      if (exists) {
        return deferred.resolve(dirName);
      }
      // create the dir
      fs.mkdir(dirPath, function(error){
        if(error){
          return deferred.reject(error);
        }

        return deferred.resolve(dirName);
      });
    });
    
    return deferred.promise;
  }
};

module.exports = DocumentService;