'use strict';

/**
 * @author Henrik Binggl
 *
 */

var async = require('async')
  , q = require('q')
  , User = require('../models/user');

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
     * find a user by email
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
        if(user) {
          return deferred.resolve(user);
        }

        return deferred.reject(new Error('No user found for email ' + email));
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
        if(user) {
          return deferred.resolve(user);
        }

        return deferred.reject(new Error('No user found for email ' + email));
      });

      return deferred.promise;
    },

    /**
     * set the token for the given user
     * @param userid {objectid} the id of user
     * @param token {object} a token
     *
     * @return {deferred} promise
     */
    setToken: function(userid, token) {
      var deferred = q.defer();

      User.where({ _id: userid }).update({ $set: { token: token, tokenDate: new Date() }}, function(err, numberAffected) {
        if(err) {
          return deferred.reject(err);
        }

        if(numberAffected === 1) {

          return deferred.resolve();
        }

        return deferred.reject(new Error('No update performed!'));
      });

      return deferred.promise;
    }

  };

})();

module.exports = UserService;
