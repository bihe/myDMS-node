'use strict';

/**
 * @author Henrik Binggl
 *
 */

var UserService = require('./userService')
  , logger = require('../util/logger')
  , security = require('../config/security')
  ;

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
      // the necessary jwt token is held in a cookie
      // retrieve the token validate the token.
      // otherwie redirect to the login service
      
      res.redirect(security.ssoUrl + '?token=' + security.ssoToken + '&redirect=' + encodeURIComponent(security.ssoReturnUrl));
    }
 
  };

})();

module.exports = SecurityService;
