/**
 * document model
 */

'use strict';

require('class4js');

var Document = $class({
	
	/**
	 * document including meta-data
	 * @coonstructor
	 */
	__construct__: function () {
		this.id = -1;
		this.alternativeId = '';
		this.fileName = '';
		this.title = '';
		this.previewLink = '';
		// use the format yyyy-MM-dd
		this.created = '';
		this.senders = [];
		this.tags = [];
	},

	/**
	 * string representation of a document
	 * @returns {string}
	 */
	toString: function() {
		return this.id + ': ' + this.title;
	}
});

module.exports = Document;