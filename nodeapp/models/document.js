/**
 * document model
 */

'use strict';

function Document() {
	this.id = -1;
	this.alternativeId = '';
	this.fileName = '';
	this.title = '';
	this.previewLink = '';
	// use the format yyyy-MM-dd
	this.created = '';
	this.amount = 0.0;
	this.senders = [];
	this.tags = [];
}

/**
 * document including meta-data
 * @coonstructor
 */
Document.prototype = {
	/**
	 * string representation of a document
	 * @returns {string}
	 */
	toString: function() {
		return this.id + ': ' + this.title;
	}
};

module.exports = Document;