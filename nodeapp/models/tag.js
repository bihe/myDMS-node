// define a tag model

'use strict';

// a Tag has a id and a name
// --------------------------------------------------------------------------
function Tag(id, name) {
  this.id = id;
  this.name = name;
}

// toString implementation
// --------------------------------------------------------------------------
Tag.prototype.toString = function() {
  return this.id + ': ' + this.name;
};

module.exports = Tag;