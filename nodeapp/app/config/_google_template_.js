// define google account settings

'use strict';

var google = {};

google.CLIENT_ID = '';
google.CLIENT_SECRET = '';
google.SCOPE = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/drive'];
google.RETURN_URL = 'http://localhost:3000/auth/google/return';

module.exports = google;