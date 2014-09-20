'use strict';

/**
 * @author Henrik Binggl
 *
 */

var async = require('async');
var q = require('q');
var fs = require('fs');
var config = require('../config/application');
var googleConfig = require('../config/google');
var googleapis = require('googleapis');
var request = require('request');

/**
 * @constructor
 */
function StorageService() {
}

/*
 * the specific documents are held in a cloud storage system
 * the service implements the basic methods to interact with
 * the storage system.
 */
StorageService.prototype = (function() {

  // private section
  var drive = googleapis.drive({ version: 'v2' });

  /**
   * get the auth client
   *
   * @returns {GoogleApis.auth.OAuth2}
   */
  var authClient = function() {
    var oauth2Client = new googleapis.auth.OAuth2(googleConfig.CLIENT_ID
      , googleConfig.CLIENT_SECRET
      , googleConfig.RETURN_URL);

    return oauth2Client;
  };

  /**
   * get the auth client
   * @param credentials {object} oauth credentials
   *
   * @returns {GoogleApis.auth.OAuth2}
   */
  var authClientUse = function(credentials) {
    var oauth2Client = authClient();

    if(typeof credentials !== 'undefined') {
      oauth2Client.setCredentials(credentials);
    } else {
      throw new Error('No credentials supplied!');
    }
    return oauth2Client;
  };

  /**
   * check the validity of the given credentials
   * @param credentials
   */
  var checkCredentials = function(credentials) {
    if(typeof credentials === 'object' && credentials.access_token) {
      return true;
    }
    return false;
  };

  // public section
  return {

    /**
     * list files from the storage system
     * @param query {string} a query
     * @param credentials {object} the oauth credentials
     *
     * @return {promise} a promise object
     */
    listfiles: function(query, credentials) {
      var deferred = q.defer()
        , error = {};

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }

      try {
        drive.files.list({
          corpus: 'DEFAULT',
          'q': query,
          auth: authClientUse(credentials)
        }, function(err, response) {
          if(err) {
            return deferred.reject(err);
          }
          return deferred.resolve(response);
        });
      } catch(err) {
        return deferred.reject(err);
      }
      return deferred.promise;
    },

    /**
     * check if ghe given folder exists
     * @param {string} folderName
     * @param {string} parent
     * @param {object} credentials
     * @returns {promise|*}
     */
    folderExists: function(folderName, parent, credentials) {
      var deferred = q.defer()
        , error = {}
        , query = 'mimeType = "application/vnd.google-apps.folder" and "' + parent
          + '" in parents and title = "' + folderName
          + '" and explicitlyTrashed = false'
        , result = {};

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }

      try {
        drive.files.list({
          corpus: 'DEFAULT',
          'q': query,
          auth: authClientUse(credentials)
        }, function(err, response) {
          if(err) {
            return deferred.reject(err);
          }

          result.exists = false;
          // check the response object
          // title must match, parent must match
          if(response.items && response.items.length === 1) {
            if(response.items[0].title === folderName && response.items[0].parents[0].id === parent) {
              result.exists = true;
              result.id = response.items[0].id;
              result.title = response.items[0].title;
              result.parent = response.items[0].parents[0].id;

            }
          }
          return deferred.resolve(result);
        });
      } catch(err) {
        return deferred.reject(err);
      }
      return deferred.promise;
    },

    /**
     * create a new folder with the given name
     * @param {string} folderName
     * @param {string} parent
     * @param {object} credentials
     * @returns {promise|*}
     */
    createFolder: function(folderName, parent, credentials) {
      var deferred = q.defer()
        , error = {}
        , result = {};

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }

      try {

        this.folderExists(folderName, parent, credentials).then(function(response) {
          if(response.exists === false) {
            drive.files.insert({
              resource: {
                title: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [ { id: parent } ]
              },
              auth: authClientUse(credentials)
            }, function(err, response) {
              if(err) {
                return deferred.reject(err);
              }

              result.exists = false; // was created
              result.id = response.id;
              result.title = response.title;
              result.parent = response.parents[0].id;

              return deferred.resolve(result);
            });
          } else {
            return deferred.resolve(response);
          }

        }).catch(function (err) {
          return deferred.reject(err);
        }).done();

      } catch(err) {
        return deferred.reject(err);
      }
      return deferred.promise;
    },

    /**
     * get a file
     * @param {string} fileName
     * @param {string} parent
     * @param {object} credentials
     * @returns {promise|*}
     */
    getFile: function(fileName, parent, credentials) {
      var deferred = q.defer()
        , error = {}
        , query = ''
        , result = {};

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }

      try {
        query = '"' + parent + '" in parents and title = "' + fileName
          + '" and explicitlyTrashed = false';
        this.listfiles(query, credentials).then(function(response) {
          result.exists = false;
          // check the response object
          // title must match, parent must match
          if(response.items && response.items.length > 0) {
            if(response.items[0].title === fileName && response.items[0].parents[0].id === parent) {

              result.exists = true;
              result.id = response.items[0].id;
              result.title = response.items[0].title;
              result.parent = response.items[0].parents[0].id;
              result.contentUrl = response.items[0].webContentLink;
              result.previewUrl = response.items[0].alternateLink;
              result.thumb = response.items[0].thumbnailLink;
              result.createdDate = response.items[0].createdDate;

            }
          }
          return deferred.resolve(result);

        }).catch(function (err) {
          return deferred.reject(err);
        }).done();

      } catch(err) {
        return deferred.reject(err);
      }
      return deferred.promise;
    },

    /**
     * upload a file
     * @param {object} file
     * @param {string} file.name the name of the file
     * @param {string} file.mimeType the given mime-type
     * @param {string} file.path the path to the file
     * @param {string} parent
     * @param {object} credentials
     * @returns {Promise.promise|*}
     */
    upload: function(file, parent, credentials) {
      var deferred = q.defer()
        , error = {}
        , result = {}
        , that;

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }
      that = this;
      // read the binary file, either update it or create it
      fs.readFile(file.path, function (err, data) {
        if (err) return deferred.reject(err);

        // check if the file exists
        that.getFile(file.name, parent, credentials).then(function(res) {
          // just update the payload
          if(res.exists === true) {
            drive.files.update({
              fileId: res.id,
              media: {
                mimeType: file.mimeType,
                body: data
              },
              auth: authClientUse(credentials)
            }, function(err, response) {
              if(err) {
                return deferred.reject(err);
              }

              result.exists = true; // was overwritten
              result.id = response.id;
              result.title = response.title;
              result.parent = response.parents[0].id;

              return deferred.resolve(result);
            });
          // create a new one
          } else {
            drive.files.insert({
              resource: {
                title: file.name,
                mimeType: file.mimeType,
                parents: [ { id: parent } ]
              },
              media: {
                mimeType: file.mimeType,
                body: data
              },

              auth: authClientUse(credentials)
            }, function(err, response) {
              if(err) {
                return deferred.reject(err);
              }

              result.exists = false; // was created
              result.id = response.id;
              result.title = response.title;
              result.parent = response.parents[0].id;

              return deferred.resolve(result);
            });
          }

        }).catch(function (err) {
          return deferred.reject(err);
        }).done();

      });

      return deferred.promise;
    }
  };

})();

module.exports = StorageService;
