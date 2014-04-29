'use strict';

/*
 * simple helpfer function to dump a object to console
 */
exports.getExtension = function( filename ) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
};