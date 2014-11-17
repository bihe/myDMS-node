/**
 * document model
 */
'use strict';

var mongoose = require('mongoose');
var randomstring = require('randomstring');
var Schema = mongoose.Schema;

var states = 'dirty done'.split(' ');

var documentSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: 'Title cannot be blank'
  },
  fileName: {
    type: String,
    trim: true,
    required: 'Filename cannot be blank'
  },
  alternativeId: {
		type: String,
		trim: true,
		default: ''
  },
  previewLink: {
		type: String,
		trim: true,
		default: ''
  },
  amount: {
    type: Number,
    default: 0
  },
  created: {
		type: Date,
		default: Date.now
	},
  modified: {
    type: Date,
    default: Date.now
  },
	senders: [{ type: Schema.Types.ObjectId, ref: 'Sender' }],
	tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  // state of the document
  state: {
    type: String,
    enum: states,
    default: 'dirty'
  }

});

// add some Middleware magic
documentSchema.pre('save', function (next) {
  if(!this.alternativeId || this.alternativeId === '') {
		// create and set an alternative id
		this.alternativeId = randomstring.generate(8);
  }
  this.modified = new Date();
  next();
});

documentSchema.methods.toString = function() {
	return '[name: ' + this.title + ' (id: ' + this._id +')]';
};

module.exports = mongoose.model('Document', documentSchema);