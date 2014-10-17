'use strict';

/**
 * @author Henrik Binggl
 *
 */

var async = require('async');
var q = require('q');
var fs = require('fs');
var logger = require('../util/logger');
var config = require('../config/application');
var googleConfig = require('../config/google').drive;
var googleapis = require('googleapis');

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

  /**
   * check if the access_token needs to be refreshed
   * @param credentials {object}
   *
   * @return {promise} a promise object - returning the oauth credentials
   */
  var checkTokenRefresh = function(credentials) {
    var deferred = q.defer()
      , oauth2client
      , expiryDate
      , isTokenExpired;

    oauth2client = authClientUse(credentials);
    expiryDate = oauth2client.credentials.expiry_date;
    isTokenExpired = expiryDate ? expiryDate <= (new Date()).getTime() : false;

    // seems to be expired
    if (isTokenExpired) {
      console.log('Refresh the access_token!');
      oauth2client.refreshAccessToken(function(err, newCredentials) {
        if(err) {
          return deferred.rejec(err);
        }
        return deferred.resolve(newCredentials);
      });
    } else {
      console.log('Use existing token!');
      deferred.resolve(credentials);
    }
    return deferred.promise;
  };


  // public section
  return {

    /**
     * get the authentication URL
     *
     * @return {string} the generated auth URL
     */
    generateAuthUrl: function() {
      var authUrl = authClient().generateAuthUrl({ scope: googleConfig.SCOPE, access_type: 'offline', approval_prompt: 'force' });
      return authUrl;
    },

    /**
     * get the oauth token of the supplied code
     * @param code
     *
     * @return {promise} a promise object - returning the oauth credentials
     */
    exractToken: function(code) {
      var deferred = q.defer();

      // request access token
      authClient().getToken(code, function(err, tokens) {
        if(err) {
          console.log(err);
          return deferred.reject(err);
        }
        try {
          console.log(tokens);
          return deferred.resolve(tokens);

        } catch (error) {
          return deferred.reject(error);
        }
      });

      return deferred.promise;
    },

    /**
     * revoke the token 
     * @param credentials
     * 
     * @return {promise} a promise object 
     */
    revokeToken: function(credentials) {
      var deferred = q.defer()
        , error = {};

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }

      // revoke the token
      authClient().revokeToken(credentials.access_token, function(err, response) {
        if(err) {
          return deferred.reject(err);
        }
        return deferred.resolve(response);
      });

      return deferred.promise;
    },

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
        checkTokenRefresh(credentials).then(function(cred) {
          drive.files.list({
            corpus: 'DEFAULT',
            'q': query,
            auth: authClientUse(cred)
          }, function(err, response) {
            if(err) {
              return deferred.reject(err);
            }
            return deferred.resolve(response);
          });
        }).catch(function(error) {
          return deferred.reject(error);
        }).done();
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
        checkTokenRefresh(credentials).then(function(cred) {

          drive.files.list({
            corpus: 'DEFAULT',
            'q': query,
            auth: authClientUse(cred)
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
        }).catch(function(error) {
          return deferred.reject(error);
        }).done();
      } catch(err) {
        console.log('error!');
        console.log(err.stack);
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
        , result = {}
        , self;

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }

      try {
        self = this;
        checkTokenRefresh(credentials).then(function(cred) {
          return this.folderExists(folderName, parent, cred);
        }).then(function(response) {
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
        , result = {}
        , self;

      if(checkCredentials(credentials) === false) {
        error = new Error('credentials not valid!');
        error.code = 500;
        deferred.reject(error);
        return deferred.promise;
      }

      try {
        self = this;
        query = '"' + parent + '" in parents and title = "' + fileName
          + '" and explicitlyTrashed = false';
        checkTokenRefresh(credentials).then(function(cred) {
          return self.listfiles(query, cred);
        }).then(function(response) {
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

          if(res.exists === true) {
            // just update the payload
            checkTokenRefresh(credentials).then(function(cred) {
              drive.files.update({
                fileId: res.id,
                media: {
                  mimeType: file.mimeType,
                  body: data
                },
                auth: authClientUse(cred)
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
            }).catch(function(error) {
              return deferred.reject(error);
            }).done();

          // create a new one
          } else {
            checkTokenRefresh(credentials).then(function(cred) {
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

                auth: authClientUse(cred)
              }, function(err, response) {
                if(err) {
                  return deferred.reject(err);
                }

                if(response) {
                  result.exists = false; // was created
                  result.id = response.id;
                  result.title = response.title;
                  result.parent = response.parents[0].id;

                  return deferred.resolve(result);
                } else {
                  return deferred.reject(new Error('Got no result from drive api!'));
                }
              });
            }).catch(function(error) {
              return deferred.reject(error);
            }).done();
          }

        }).catch(function (err) {
          return deferred.reject(err);
        }).done();

      });

      return deferred.promise;
    },

    /**
     * check for token expiry. if expired, fetch a new one
     * and return the new credentials
     * @param {object} credentials
     *
     * @returns {Promise.promise|*}
     */
    handleTokenRefresh: function(credentials) {
      var deferred = q.defer();

      checkTokenRefresh(credentials).then(function(cred) {
        return deferred.resolve(cred);
      }).catch(function(error) {
        return deferred.reject(error);
      }).done();

      return deferred.promise;
    }
  };

})();

module.exports = StorageService;
