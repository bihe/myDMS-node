/**
 * implementation of a User model
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  tokenDate: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  token: Schema.Types.Mixed,
  profile: Schema.Types.Mixed
});

userSchema.methods.toString = function() {
  return '[Name: ' + this.displayName + ' (id: ' + this._id +')]';
};

module.exports = mongoose.model('User', userSchema);
