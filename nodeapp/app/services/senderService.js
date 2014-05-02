'use strict';

/**
 * @author Henrik Binggl
 * encapsulate the logic to handle senders in own module
 *
 * Promises and async is nice but ...
 * "Harmony, thou yield generators, where are thee?"
 */

var async = require('async');
var q = require('q');
var _ = require('lodash');
var Sender = require('../models/sender');

/**
 * @constructor
 */
function SenderService() {
}

/* 
 * method, logic implementation
 */
SenderService.prototype = {
  
  /**
   * Supply a list of objects. The list contains __existing objects__
   * and __new__ object. The new objects are created, the existing 
   * objects are verified, if they are correct.
   * return a list of resulting sender-objects
   *
   * @return {deferred} a promis with a list of sender-objects
   */
  createAndGetSenders: function( objectList ) {
    // the objectList needs to be iterated, check each entry
    // if it is available, if not create the object and put it into
    // a list, which is returned later
    var deferred = q.defer();
    var sender;
    var senders = [];
    var totalLenght = objectList.length;

    async.series([
      function( callback ) {
        _.forEach( objectList, function( object, index ) {
          if( object._id === -1 ) {
            // those entries will be created
            sender = new Sender( { name: object.name } );
            sender.save(function( err, s ) {
              if( err ) {
                // indicate an error
                return callback( err );
              }
              senders.push( s );
              // if this is the last index we are done here
              if( index === (totalLenght - 1) ) {
                callback( null ); // done
              }

            });

          } else {

            // existing entries supplied by UI 
            // I am not sure of that - check again if those entries are real!
            Sender.findById( object._id ).exec(function ( err, s ) {
              if( err ) {
                // indicate an error
                return callback( err );
              }
              senders.push( s );
              // if this is the last index we are done here
              if( index === (totalLenght - 1) ) {
                callback( null ); // done
              }
            });
          }
        });
      }
    ],
    function( error, result ) {
      // I am done here
      if( error ) {
        return deferred.reject( error );
      }
      deferred.resolve( senders );
    });

    return deferred.promise;
  }
};

module.exports = SenderService;