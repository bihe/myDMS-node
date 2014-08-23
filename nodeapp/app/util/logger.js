'use strict';

/*
 * simple helper function to dump a object to console
 */
exports.dump = function( object ) {
  console.log(JSON.stringify(object, null, 4));
};