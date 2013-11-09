'use strict';

var should = require('should');
var assert = require('assert');

describe('SQLite', function(){

	describe('Basic', function() {
  
	  it('should correctly import sqlite3', function(){
	    var db = require('sqlite3');
	    db.should.not.eql(undefined);
	  });

	  it('should create a database connection', function(){
	    var sqlite3 = require('sqlite3').verbose();
			var db = new sqlite3.Database(':memory:');

			db.should.not.eql(undefined);

			var result = db.close();
			result.open.should.be.false;
	  });
	});
});