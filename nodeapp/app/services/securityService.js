'use strict';

/**
 * @author Henrik Binggl
 *
 */

var UserService = require('./userService')
  , logger = require('../util/logger')
  , security = require('../config/security')
  , UserService = require('../services/userService')
  , jwt = require('jsonwebtoken')
  , _ = require('lodash');

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
     * Simple route middleware to ensure user is authenticated
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    authRequired: function(req, res, next) {
      /* we need a JWT token as a cookie to procede with the logic
       * if the cookie is not available redirect to the external
       * SSO service login.binggl.net with the current path as
       * a parameter
       */
      var cookies = req.cookies;
       
      if(req.session.authenticated === true && cookies[security.sso.cookie] 
      && !_.isEmpty(req.session.user)
      && !_.isEmpty(cookies[security.sso.cookie])) {
        // is authenicated and a cookie value is available
        // but skip the verification
        // set the user-object in the request
        req.user = req.session.user;
        return next();
      }
      
      if(cookies[security.sso.cookie] && !_.isEmpty(cookies[security.sso.cookie])) {
        var token = cookies[security.sso.cookie];  
        // this is a JWT token - verify the token
        jwt.verify(token, security.sso.secret, function(err, decoded) {
          if(err) {
            console.log('Could not verify token: ' + err);
            return res.redirect(security.sso.errorUrl);
          }
          if(decoded.Claims && decoded.Claims.length > 0) {
            var claim = null;
            var index = _.findIndex(decoded.Claims, function(entry) {
              // entry syntax: name|url|role
              var entries = entry.split('|');
              if(entries && entries.length == 3) {
                if(entries[0] === security.sso.site) {
                  claim = {};
                  claim.role = entries[2];
                  claim.name = entries[0];
                  claim.url = entries[1];
                  return true;
                }
              }
              return false;
            });
            
            if(claim && index > -1) {
              // get the id of the backend store entry
              var userService = new UserService();
              userService.findByName('store').then(function(entry) {
                req.user = {};
                req.user.storageId = entry._id;
                req.user.username = decoded.UserName;
                req.user.displayName = decoded.DisplayName;
                req.user.email = decoded.Email;
                req.user.userId = decoded.UserId;
                req.user.claim = claim;
                
                req.session.authenticated = true;
                req.session.user = req.user;
                
                return next();
              }).catch(function(error) {
                logger.dump(error);
                console.log(error.stack);
                
                console.log('No Claims available!');
                return res.redirect(security.sso.errorUrl);    
                
              }).done();
            }
          } else {
            console.log('No Claims available!');
            return res.redirect(security.sso.errorUrl);    
          }               
        });
      } else {
        req.session.authenticated = false;
        // no cookie availalbe - redirect to the authentication system
        var redirectUrl = security.sso.url 
          + security.sso.siteparam 
          + security.sso.site 
          + '&' 
          + security.sso.urlparam 
          + security.sso.returnUrl;
          
        console.log('Will send auth request to ' + redirectUrl);
        res.render('login', { loginUrl: redirectUrl } );
      }
    }
  };
})();

module.exports = SecurityService;
