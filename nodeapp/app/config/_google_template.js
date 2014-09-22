// define google account settings

'use strict';

var google = {};

google.CLIENT_ID = '';
google.CLIENT_SECRET = '';
google.SCOPE = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];
google.RETURN_URL = 'http://localhost:3000/auth/google/return';

// drive logic and IDs
google.drive = {};
google.drive.CLIENT_ID = '';
google.drive.CLIENT_SECRET = '';
google.drive.SCOPE = ['https://www.googleapis.com/auth/drive'];
google.drive.RETURN_URL = '';
google.drive.PARENT_ID = '--FOLDER--ID--';

module.exports = google;