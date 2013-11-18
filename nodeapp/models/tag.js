/**
 * implementation of a Tag model
 */

'use strict';

/**
 * a Tag has a id and a name
 * @constructor 
 * @param {int} id - the id of the tag
 * @param {string} name - the name of the tag
 */
function Tag(id, name) {
  this.id = id;
  this.name = name;
}


/**
 * toString implementation
 * @returns {string} a string representation of a tag
 */
Tag.prototype.toString = function() {
  return this.id + ': ' + this.name;
};

module.exports = Tag;