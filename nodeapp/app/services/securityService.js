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
 * method, logic implementation
 */
SecurityService.prototype = (function() {

  // private section

  // public section
  return {

    /**
     * associate a given user the the id, profile provided by the external auth service
     * @param identifier
     * @param profile
     * @param callback
     */
    findUser: function(identifier, profile, callback) {
      var userService = new UserService();
      // use the first email!
      userService.findUserByEmail(profile.emails[0].value).then(function(user) {
        callback(null, user);
      }).catch(function(error) {
        console.error('Could not find the user! ' + error);
        callback(error, null);
      }).done();
    },

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    authRequired: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/login')
    }


//    // Passport session setup.
////   To support persistent login sessions, Passport needs to be able to
////   serialize users into and deserialize users out of the session.  Typically,
////   this will be as simple as storing the user ID when serializing, and finding
////   the user by ID when deserializing.  However, since this example does not
////   have a database of user records, the complete Google profile is serialized
////   and deserialized.
//    passport.serializeUser(function(user, done) {
//      done(null, user);
//    });
//
//  passport.deserializeUser(function(obj, done) {
//    done(null, obj);
//  });
  };

})();

module.exports = SecurityService;
