// test the basic features of sqlite

'use strict';

var sqlite3 = require('sqlite3');
var assert = require('assert');

describe('sqlite', function() {

	describe('Basic', function() {

		var db;
		before(function(done) {
			db = new sqlite3.Database(':memory:', done);
		});

		var inserted = 0;
		var retrieved = 0;

		var count = 1000;

		it('should run serial', function(done) {
			db.serialize(function() {
				db.run('CREATE TABLE foo (txt text, num int, flt float, blb blob)');

				var stmt = db.prepare('INSERT INTO foo VALUES(?, ?, ?, ?)');
				for (var i = 0; i < count; i++) {
					stmt.run('String ' + i, i, i * Math.PI, function(err) {
						if (err) throw err;
						inserted++;
					});
				}
				stmt.finalize();

				db.all('SELECT txt, num, flt, blb FROM foo ORDER BY num', function(err, rows) {
					if (err) throw err;
					for (var i = 0; i < rows.length; i++) {
						assert.equal(rows[i].txt, 'String ' + i, 'String does not match!');
						assert.equal(rows[i].num, i, 'Incorrect num value');
						assert.equal(rows[i].flt, i * Math.PI, 'Incorrect flt value');
						assert.equal(rows[i].blb, null);
						retrieved++;
					}
					done();
				});
			});
		});		
	});
});