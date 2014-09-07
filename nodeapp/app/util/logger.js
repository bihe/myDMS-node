'use strict';

/*
 * simple helper function to dump a object to console
 */

module.exports = {
  dump: function( object ) {
    console.log(JSON.stringify(object, null, 4));
  },

  logDump: function( logMessage, object ) {
    console.log(logMessage + ': ' + JSON.stringify(object, null, 4));
  }
};