/**
 * implementation of a Sender model
 */

'use strict';

/**
 * a Sender has a id and a name
 * @constructor 
 * @param {int} id - the id of the Sender
 * @param {string} name - the name of the Sender
 */
function Sender(id, name) {
  this.id = id;
  this.name = name;
}


/**
 * toString implementation
 * @returns {string} a string representation of a Sender
 */
Sender.prototype.toString = function() {
  return this.id + ': ' + this.name;
};

module.exports = Sender;