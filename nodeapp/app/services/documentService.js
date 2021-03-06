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
var mv = require('mv');
var Document = require('../models/document');
var config = require('../config/application');
var _ = require('lodash');
var u = require('../util/utils');
var logger = require('../util/logger');
var StorageService = require('./storageService');
var google = require('../config/google');

/**
 * @constructor
 */
function DocumentService() {
}

/*
 * method, logic implementation
 */
DocumentService.prototype = (function() {

  /**
   * move a file. wrap existing function in promise
   * @param path1 {String} filesystem path
   * @param path2 {String} filesystem path
   *
   * @return {deferred} a promise
   */
  var moveFile = function(path1, path2) {
    var deferred = q.defer();

    mv(path1, path2, function(error) {
      if(error) {
        return deferred.reject(error);
      }
      deferred.resolve();
    });

    return deferred.promise;
  };

  /**
   * update the document statue
   * @param id {ObjectId} the id of the documnet
   * @param state {String} the document state
   *
   * @return {deferred} a promise object of the Document
   */
  var stateUpdate = function(id, newState) {
    var deferred = q.defer();

    Document.findById(id).exec(function (err, document) {
      if(err) {
        return deferred.reject(err);
      }

      if(!document) {
        return deferred.reject(new Error('No entry found'));
      }

      // update the state field
      document.state = newState;
      document.update({ state: newState}, function(error) {
        if(error) {
          return deferred.reject(error);
        }
        console.log('after update: ' + document);
        deferred.resolve(document);
      });

    });

    return deferred.promise;
  };


  // those methods are public accessible
  return {
    /**
     * save the document or create a new one, depending on the
     * supplied id
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
            if(!document._id || document._id === -1) {
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
            doc.state = 'dirty';
            doc.modified = new Date();

            if(document.created && _.isString(document.created)) {
              doc.created = u.parseDate(document.created);
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
      function(error, result) {
        // I am done here
        if(error) {
          return deferred.reject(error);
        }
        deferred.resolve(doc);
      });

      return deferred.promise;
    },

    /**
     * take care of the temp uploaded file and move it to the final
     * destination. use the storageservice to interact with the backend system.
     * additionally update the filepath for the document object
     * @param document {Document} the document object
     * @param savedDocument {object} the saved document
     * @param credentials {object} credentials to interact with the storage service
     *
     * @return {deferred} a promise with the Document object
     */
    handleDocumentUpload: function(document, savedDocument, credentials) {
      var deferred = q.defer()
        , uploadPath
        , file = {}
        , self
        , tempFilename
        , fileName = ''
        , folderName
        , storageService = new StorageService();

      self = this;
      tempFilename = savedDocument.tempFilename;

      if(tempFilename && tempFilename !== '') {

        // create a folder
        folderName = moment(document.created).format('YYYY_MM_DD');
        storageService.createFolder(folderName, google.drive.PARENT_ID, credentials).then(function(result) {
          fileName = document.fileName;
          document.fileName = '/' + folderName + '/' + document.fileName;

          uploadPath = path.join(__dirname, '../../', config.application.upload.tempFilePath) + '/' + tempFilename;

          console.log('Will move file from temp path ' + uploadPath + ' to backend location ' + folderName);
          file.name = fileName;
          file.mimeType = savedDocument.contentType;
          file.path = uploadPath;

          return storageService.upload(file, result.id, credentials);
        }).then(function() {
          return self.save(document);
        }).then(function(doc) {
          // remove the uploaded file
          fs.unlink(uploadPath, function (err) {
            if (err) {
              return deferred.reject(err);
            }
            deferred.resolve(doc);
          });

        }).catch(function(error) {
          return deferred.reject(error);
        }).done();

      } else {
        // there is no tempfile - so no need to post-process the document
        deferred.resolve(document);
      }

      return deferred.promise;
    },

    /**
     * start the document edit process by updating the document status
     * @param id {ObjectId} the id of the documnet
     *
     * @return {deferred} a promise object
     */
    beginDocumentChange: function(id) {
      return stateUpdate(id, 'dirty');
    },

    /**
     * end the document edit process by updating the document status
     * @param id {ObjectId} the id of the documnet
     *
     * @return {deferred} a promise object
     */
    endDocumentChange: function(id) {
      return stateUpdate(id, 'done');
    },

    /**
     * get a document object by the id
     * @param id
     * @returns {Promise.promise|*}
     */
    getDocumentById: function(id) {
      var deferred = q.defer();

      Document.findById(id, function (err, document) {
        if (err) {
          return deferred.reject(err);
        }
        deferred.resolve(document);
      });

      return deferred.promise;
    },

    /**
     * remove the files of given folders
     * @param folders {array} list of folders
     *
     * @return {deferred} a promise object - number of files removed
     */
    clearFiles: function(folders) {
      var deferred = q.defer()
        , numEntries = 0
        , i = 0
        , filesToDelete = [];

      if(!folders || folders.length === 0) {
        return deferred.reject(new Error('No folder paths supplied!'));
      }

      // sequential approach
      // 1. collect the files
      // 2. delete them
      async.series([
        // prepare
        function(callback) {
          async.eachSeries(folders, function(folder, cb) {
            fs.readdir(folder, function(error, files) {
              if(error) {
                return cb(error);
              }

              for(i=0; i<files.length; i++) {
                filesToDelete.push(path.join(folder, files[i]));
              }

              cb(null);
            });
          }, function(err){
            if(err) {
              return callback(err);
            }
            callback(null);
          });
        },
        // action
        function(callback) {
          async.each(filesToDelete, function(file, cb) {

            fs.unlink(file, function(error) {
              if(error) {
                return cb(error);
              }

              numEntries++;
              cb(null);
            });
          }, function(err){
            if(err) {
              return callback(err);
            }
            callback(null);
          });
        }
      ], function (err, result) {
          if(err) {
            console.log('clearFiles: ' + err);
            console.log(err);
            return deferred.reject(err);
          }

          deferred.resolve(numEntries);
      });

      return deferred.promise;
    },

    /**
     * clean all database entries which are left-overs from save attemptes
     * @returns {Promise.promise|*}
     */
    cleanStaleDatabaseEntries: function() {
      var deferred = q.defer()
        ;

      Document.remove({ state: 'dirty' }, function(err, numberRemoved) {
        if(err) {
          return deferred.reject(err);
        }
        deferred.resolve(numberRemoved.ok);
      });

      return deferred.promise;
    }
  };
})();

module.exports = DocumentService;
