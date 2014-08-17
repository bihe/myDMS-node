// define google account settings

'use strict';

var google = {};

google.CLIENT_ID = '';
google.CLIENT_SECRET = '';
google.SCOPE = 'https://www.googleapis.com/auth/drive';
google.redirectUrl = 'http://localhost:3000/oauth/callback';

module.exports = google;