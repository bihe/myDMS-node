/*
 * implement a basic mongoose schema
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var simpleSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Title cannot be blank'
  },
  created: {
		type: Date,
		default: Date.now
	}
});

simpleSchema.methods.toString = function() {
	return '[name: ' + this.name + ' (id: ' + this._id +')]';
};

module.exports = simpleSchema;
