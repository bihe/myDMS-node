'use strict';

/**
 * @author Henrik Binggl
 *
 */

var async = require('async');
var q = require('q');
var config = require('../config/application');
var googleConfig = require('../config/google');
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
    }
  };

})();

module.exports = StorageService;
