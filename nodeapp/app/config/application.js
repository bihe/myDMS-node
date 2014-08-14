/*
 * application configuration file
 */
var version = require('./version');

var config = {};

// set the application version
config.version = version;

config.application = {};
config.application.basePath = '/';
config.application.secret = 'iF7iephuyowoyaew';

// defint allowed values for uploaded files
config.application.upload = {};
config.application.upload.ctypes = ['image/*', 'application/pdf'];
config.application.upload.extensions = ['pdf', 'png', 'jpeg', 'jpg', 'tiff', 'tif'];
// 10 MB
config.application.upload.maxFileSize = 10485760;
config.application.upload.tempFilePath = 'upload';
config.application.upload.filePath = 'files';

module.exports = config;