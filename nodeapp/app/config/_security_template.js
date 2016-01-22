// define security settings

'use strict';

var config = {};

// encryption key
config.secret = '--SECRET--!';

// sso configuration
config.sso = {};
config.sso.returnUrl = '--RETURN--URL--';
config.sso.secret = '--SECRET--';
config.sso.cookie = 'login_token';
config.sso.errorUrl = 'https://login.binggl.net/403'; 
config.sso.url = 'https://login.binggl.net/auth/flow?';
config.sso.site = 'raspbeat';
config.sso.siteparam = '~site=';
config.sso.urlparam = '~url=';

module.exports = config;