/**
 * implementation of a Tag model
 */

'use strict';

var mongoose = require('mongoose');
var simpleSchema = require('./schema.js');

module.exports = mongoose.model('Tag', simpleSchema);