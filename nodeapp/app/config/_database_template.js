// define database settings

'use strict';

var database = {};
database.uri = 'mongodb://localhost/--DATABASENAME--';
database.options = {
  db: { native_parser: true },
  server: { poolSize: 5, socketOptions: { keepAlive: 1 } }
  // user: '--user--',
  // pass: '--pass--'
};

module.exports = database;