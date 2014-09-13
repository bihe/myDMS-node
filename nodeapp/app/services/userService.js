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
     * find a user by openId
     * @param email {string} the user email
     *
     * @return {deferred} promise with the given user
     */
    findUserByOpenId: function(openid) {
      var deferred = q.defer()
        , filter = {};
      // TODO: encrypt openid string

      filter.openid = openid;
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
        // TODO: decrypt token
        return deferred.resolve(user.token);
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
      // TODO: encrypt token
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
