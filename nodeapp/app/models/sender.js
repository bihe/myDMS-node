/**
 * implementation of a Sender model
 */

'use strict';

var mongoose = require('mongoose');
var simpleSchema = require('./schema.js');

module.exports = mongoose.model('Sender', simpleSchema);