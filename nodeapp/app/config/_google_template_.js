// define google account settings

'use strict';

var google = {};

google.CLIENT_ID = '';
google.CLIENT_SECRET = '';
google.SCOPE = 'https://www.googleapis.com/auth/drive';
// the callback url for google oauth
google.redirectUrl = 'http://localhost:3000/oauth/callback';
// the return url for google openid
google.returnUrl = 'http://www.example.com/auth/google/return';
// realm used for passport google authentication
google.realm = 'http://www.example.com';

module.exports = google;