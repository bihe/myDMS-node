// define google account settings

'use strict';

var google = {};

// drive logic and IDs
google.drive = {};
google.drive.CLIENT_ID = '';
google.drive.CLIENT_SECRET = '';
google.drive.SCOPE = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file'];
google.drive.RETURN_URL = 'http://localhost:3000/drive/return';
google.drive.PARENT_ID = '--FOLDER--ID--';

module.exports = google;