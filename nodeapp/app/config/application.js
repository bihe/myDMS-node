/*
 * application configuration file
 */
var version = require('./version');

var config = {};

// set the application version
config.version = version;

config.application = {};
config.application.secret = 'iF7iephuyowoyaew';

module.exports = config;