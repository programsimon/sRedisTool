import Vue from 'vue'
import App from './App.vue'
// import router from './router'
import VueI18n from 'vue-i18n'
import ElementUI, { install } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { v4 as uuidv4 } from 'uuid'
import VueClipboard from 'vue-clipboard2'
import _ from 'lodash'

const config = require('./config/app.config');

Vue.use(VueI18n)
Vue.use(VueClipboard)
Vue.use(ElementUI,{
  i18n: (key, value) => i18n.t(key, value)
})
Vue.config.productionTip = false

const i18n = function() {
  var languageCatalogs = {};

  config.languages.forEach((languageCode) => {
    languageCatalogs[languageCode] = Object.assign(
      require('./locales/' + languageCode +'.js'),
      require('element-ui/lib/locale/lang/' + languageCode).default
      )
  })
  
  return new VueI18n({
    locale: navigator.language,
    messages: languageCatalogs,
    availableLocales: config.languages
  })
}()

Vue.prototype.$uuid = uuidv4

new Vue({
  // router,
  i18n,
  render: function (h) { return h(App) }
}).$mount('#app')