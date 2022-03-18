const path = require('path');
const i18n = require('i18n');
const config = require('../config/app.config');

var languageCatalogs = {};

config.languages.forEach((languageCode) => {
  languageCatalogs[languageCode] = require('../locales/' + languageCode +'.js')
});

i18n.configure({
  locales: config.languages,
  defaultLocale: 'en',
  // directory: path.join(__dirname, '/locales'),
  register: global,
  objectNotation: false,
  updateFiles: false,
  staticCatalog: languageCatalogs,
  // setting of log level DEBUG - default to require('debug')('i18n:debug')
  logDebugFn: function (msg) {
    if(process.env.WEBPACK_DEV_SERVER_URL && !process.env.IS_TEST){
      console.log('debug', msg)
    }
  },
 
  // setting of log level WARN - default to require('debug')('i18n:warn')
  logWarnFn: function (msg) {
    if(process.env.WEBPACK_DEV_SERVER_URL && !process.env.IS_TEST){
      console.log('warn', msg)
    }
  },
  // setting of log level ERROR - default to require('debug')('i18n:error')
  logErrorFn: function (msg) {
    if(process.env.WEBPACK_DEV_SERVER_URL && !process.env.IS_TEST){
      console.log('error', msg)
    }
  },
});


// append function t
i18n.t = i18n.__;

i18n.initLocale = function(languageCode, app) {
  if(!languageCode || languageCode === '') {
    i18n.setLocale(app.getLocale())
  }else {
    i18n.setLocale(languageCode)
  }
}

module.exports = i18n;
