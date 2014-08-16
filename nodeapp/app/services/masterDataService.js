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
MasterDataService.prototype = (function() {
  
  /**
   * Supply a list of objects. The list contains __existing objects__
   * and __new__ object. The new objects are created, the existing 
   * objects are verified, if they are correct.
   * return a list of resulting sender-objects
   *
   * @param {array} objectList - the list to process
   * @param {String} type - which type to handle sender|tag
   * @param {bool} allowEmptyList - should an empty list be allowed?
   * @return {deferred} a promise with a list of sender-objects
   */
  var __handleSendersAndTags = function( objectList, type, allowEmptyList ) {
    // the objectList needs to be iterated, check each entry
    // if it is available, if not create the object and put it into
    // a list, which is returned later
    var deferred = q.defer(),
        item,
        model,
        items = [],
        totalLenght = 0;

    if(!objectList || objectList.length === 0) {
      if(allowEmptyList === false) {
        deferred.reject( new Error('empty list supplied!') );
        return deferred.promise;
      } else {
        objectList = [];
      }
    }

    totalLenght = objectList.length;

    // create an alias
    if( type === 'sender' ) {
      model = Sender;
    } else if( type === 'tag') {
      model = Tag;
    }

    async.series([
      function( callback ) {
        try {
          // iterate over the objectlist , use feature of the async lib
          // list is processed in order but asynchronously
          if(objectList.length > 0) {
            async.eachSeries( objectList, function( object , cb ) {

              if( object._id <= -1 ) {

                // check if an entry with the given name already exists
                model.findOne({name: object.name}).exec(function ( err, s ) {
                  if( err ) {
                    // indicate an error
                    return cb( err );
                  }

                  if(s) {
                    // found one entry with the given name
                    // use this one
                    items.push( s );

                    cb( null ); // done                  
                  } else {
                    // aah: no entry found - create a new one
                    if( type === 'sender' ) {
                      item = new Sender( { name: object.name } );
                    } else if( type === 'tag') {
                      item = new Tag( { name: object.name } );
                    }
                    
                    item.save(function( err, s ) {
                      if( err ) {
                        // indicate an error
                        return cb( err );
                      }

                      if(!s) {
                        return cb(new Error('Item not saved!'));
                      }

                      items.push( s );
                      
                      cb( null ); // done
                    });
                  }

                });

              } else {

                // existing entries supplied by UI 
                // I am not sure of that - check again if those entries are real!
                model.findById( object._id ).exec(function ( err, s ) {
                  if( err ) {
                    // indicate an error
                    return cb( err );
                  }

                  if(!s) {
                    return cb(new Error('No entry found'));
                  }
                  items.push( s );
                  
                  cb( null ); // done
                });
              }
            }, function( err ) {
              if( err) {
                console.log(err);
                return callback( err );  
              }
              callback( null ); // done
            });
          } else {
            callback( null );
          }
        } catch ( err ) {
          callback( err );
        }
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
  };


  // export public methods
  return {
    /**
     * handle existing and new Senders and return and
     * consolidated list
     *
     * @param {array} objectList - the list to process
     * @param {bool} allowEmptyList - should an empty list be allowed?
     * @return {deferred} a promise with a list of sender-objects
     */
    createAndGetSenders: function( objectList, allowEmptyList ) {
      allowEmptyList = typeof allowEmptyList !== 'undefined' ? allowEmptyList : false;
      return __handleSendersAndTags( objectList, 'sender', allowEmptyList );
    },

    /**
     * handle existing and new Tags and return a
     * consolidated list
     *
     * @param {array} objectList - the list to process
     * @param {bool} allowEmptyList - should an empty list be allowed?
     * @return {deferred} a promise with a list of sender-objects
     */
    createAndGetTags: function( objectList, allowEmptyList ) {
      allowEmptyList = typeof allowEmptyList !== 'undefined' ? allowEmptyList : false;
      return __handleSendersAndTags( objectList, 'tag', allowEmptyList );
    }
  };

})();

module.exports = MasterDataService;
