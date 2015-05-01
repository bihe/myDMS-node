'use strict';

/**
 * @author Henrik Binggl
 *
 */

var UserService = require('./userService')
  , logger = require('../util/logger');

/**
 * @constructor
 */
function SecurityService() {
}

/*
 * SecurityService implements necessary methods for passport
 * authentication logic
 */
SecurityService.prototype = (function() {

  // private section

  // public section
  return {

    /**
     * find an user by the supplied profile data for oauth
     * @param accessToken
     * @param refreshToken
     * @param profile
     * @param callback
     */
    findOAuthUser: function(accessToken, refreshToken, profile, callback) {
      var userService = new UserService()
        , foundUser = null;

      userService.findUserByEmail(profile.emails[0].value).then(function(user) {
        if (!user) {
          console.info('Could not find the user!');
          return callback(null, false, { message: 'The supplied Google account is not allowed to use this service!' });
        }

        foundUser = user;
        console.info('Got authenticated user: ' + foundUser.displayName);

        return userService.setProfile(user._id, profile._json);

      }).then(function() {

        callback(null, foundUser);
      }).catch(function(error) {
        console.error('Could not find the user! ' + error);
        callback(error, null);
      }).done();
    },

    /**
     * Simple route middleware to ensure user is authenticated
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    authRequired: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/auth/login')
    },

    /**
     * To support persistent login sessions, Passport needs to be able to
     * serialize users into and deserialize users out of the session.
     * @param user
     * @param callback
     */
    serializeUser: function(user, callback) {
      // simple logic, just use the id of the user!
      callback(null, user._id);
    },

    /**
     * deserialize the user from the session
     * @param obj
     * @param callback
     */
    deserializeUser: function(obj, callback) {
      // just return the id
      callback(null, obj);

      /* rather resource hungry, only load the user when needed!

      // in the session the user-id was serialized
      // use the id to load the user again
      var userService = new UserService();
      userService.findUserById(obj).then(function(user) {
        callback(null, user);
      }).catch(function(error) {
        console.error('Could not find the user! ' + error);
        callback(error, null);
      }).done();

      */
    }
  };

})();

module.exports = SecurityService;
