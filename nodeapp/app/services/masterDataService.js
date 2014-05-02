'use strict';

/**
 * @author Henrik Binggl
 * encapsulate the logic to handle senders, tags in own module
 *
 * Promises and async is nice but ...
 * "Harmony, thou yield generators, where are thee?"
 */

var async = require('async');
var q = require('q');
var _ = require('lodash');
var Sender = require('../models/sender');
var Tag = require('../models/tag');

/**
 * @constructor
 */
function MasterDataService() {
}

/* 
 * method, logic implementation
 */
MasterDataService.prototype = {
  
  /**
   * handle existing and new Senders and return a
   * consolidated list
   *
   * @return {deferred} a promis with a list of sender-objects
   */
  createAndGetSenders: function( objectList ) {
    return this.__handleSendersAndTags( objectList, 'sender' );
  },

  /**
   * handle existing and new Tags and return a
   * consolidated list
   *
   * @return {deferred} a promis with a list of sender-objects
   */
  createAndGetTags: function( objectList ) {
    return this.__handleSendersAndTags( objectList, 'tag' );
  },


  /**
   * Supply a list of objects. The list contains __existing objects__
   * and __new__ object. The new objects are created, the existing 
   * objects are verified, if they are correct.
   * return a list of resulting sender-objects
   *
   * @param {String} type - which type to handle sender|tag
   * @return {deferred} a promis with a list of sender-objects
   */
  __handleSendersAndTags: function( objectList, type ) {
    // the objectList needs to be iterated, check each entry
    // if it is available, if not create the object and put it into
    // a list, which is returned later
    var deferred = q.defer(),
        item,
        model,
        items = [],
        totalLenght = objectList.length;

    // create an alias
    if( type === 'sender' ) {
      model = Sender;
    } else if( type === 'tag') {
      model = Tag;
    }

    async.series([
      function( callback ) {
        _.forEach( objectList, function( object, index ) {
          if( object._id === -1 ) {
            // those entries will be created
            if( type === 'sender' ) {
              item = new Sender( { name: object.name } );
            } else if( type === 'tag') {
              item = new Tag( { name: object.name } );
            }
            
            item.save(function( err, s ) {
              if( err ) {
                // indicate an error
                return callback( err );
              }
              items.push( s );
              // if this is the last index we are done here
              if( index === (totalLenght - 1) ) {
                callback( null ); // done
              }

            });

          } else {

            // existing entries supplied by UI 
            // I am not sure of that - check again if those entries are real!
            model.findById( object._id ).exec(function ( err, s ) {
              if( err ) {
                // indicate an error
                return callback( err );
              }
              items.push( s );
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
      deferred.resolve( items );
    });

    return deferred.promise;
  }
};

module.exports = MasterDataService;