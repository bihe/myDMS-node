'use strict';

/**
 * @author Henrik Binggl
 *
 */

var async = require('async')
  , q = require('q')
  , Iron = require('iron')
  , User = require('../models/user')
  , s = require('../config/security');

/**
 * @constructor
 */
function UserService() {
}

/*
 * method, logic implementation
 */
UserService.prototype = (function() {

  // private section

  // public section
  return {

    /**
     * find a user by id
     * @param id {objectid} the id
     *
     * @return {deferred} promise with the given user
     */
    findUserById: function(id) {
      var deferred = q.defer();

      User.findById(id).exec(function (err, user) {
        if(err) {
          return deferred.reject(err);
        }
        return deferred.resolve(user);
      });

      return deferred.promise;
    },

    /**
     * find a user by email
     * @param email {string} the user email
     *
     * @return {deferred} promise with the given user
     */
    findUserByEmail: function(email) {
      var deferred = q.defer()
        , filter = {};

      filter.email = email;
      User.findOne( filter ).exec(function (err, user) {
        if(err) {
          return deferred.reject(err);
        }
        return deferred.resolve(user);
      });

      return deferred.promise;
    },

    /**
     * get the token for a given user-id
     * @param id {objectid} the id
     *
     * @return {deferred} promise with a token
     */
    getTokenFromUser: function(id) {
      var deferred = q.defer();

      User.findById(id).exec(function (err, user) {
        if(err) {
          return deferred.reject(err);
        }
        // decrypt the auth token
        Iron.unseal(user.token, s.secret, Iron.defaults, function(err, unsealed) {
          if(err) {
            return deferred.reject(err);
          }
          return deferred.resolve(unsealed);
        });


      });

      return deferred.promise;
    },

    /**
     * set the token and profile for the given user
     * @param userid {objectid} the id of user
     * @param token {object} a token
     * @param profile {object} a profile
     *
     * @return {deferred} promise
     */
    setTokenAndProfile: function(userid, token, profile) {
      var deferred = q.defer();

      // use iron to encrypt the object
      Iron.seal(token, s.secret, Iron.defaults, function(err, sealed) {
        if(err) {
          return deferred.reject(err);
        }
        User.where({ _id: userid }).update({ $set: { token: sealed, tokenDate: new Date(), profile: profile }}, function(err, numberAffected) {
          if(err) {
            return deferred.reject(err);
          }

          if(numberAffected === 1) {
            return deferred.resolve();
          }

          return deferred.reject(new Error('No update performed!'));
        });
      });

      return deferred.promise;
    }

  };

})();

module.exports = UserService;
