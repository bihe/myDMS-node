/**
 * implementation of a User model
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  displayName: {
    type: String,
    trim: true,
    required: 'Displayname cannot be blank'
  },
  email: {
    type: String,
    trim: true
  },
  thumb: {
    type: String,
    trim: true
  },
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
