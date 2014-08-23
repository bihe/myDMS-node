'use strict';

/*
 * get the file-extension
 */
module.exports.getExtension = function( filename ) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
};


/**
 * parse a date in yyyy-MM-dd or dd.MM.yyyy format
 *
 * @param {String} input - the date string in format yyyy-MM-dd or dd.MM.yyyy
 * @param {bool} endOfDay - add time to be end of day (optional)
 * @return {Date} the parsed date
 */
module.exports.parseDate = function (input, endOfDay) {
  var parts = input.split('-'),
      date, year, month, day;

  endOfDay = typeof endOfDay !== 'undefined' ? endOfDay : false;

  if(!parts || parts.length !== 3) {
    parts = input.split('.');

    if(parts && parts.length === 3) {
      year = parseInt(parts[2],10);
      month = parseInt(parts[1], 10)-1;
      day = parseInt(parts[0], 10);
    }
    
  } else {
    year = parseInt(parts[0],10);
    month = parseInt(parts[1], 10)-1;
    day = parseInt(parts[2], 10);
  }

  if(parts && parts.length === 3) {
    // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    if(endOfDay === true) {
      date = new Date(year, month, day, 23, 23, 59); // Note: months are 0-based
    } else {
      date = new Date(year, month, day, 0, 0, 0); // Note: months are 0-based
    }
    console.log(date);
    return date;
  }
  return null;
};