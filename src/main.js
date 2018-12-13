// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import store from './vuex/store';
import App from './App';
import router from './router';

import MuseUI from 'muse-ui';
import VueScrollTo from 'vue-scrollto';
import VueAnalytics from 'vue-analytics';
import VueTapTarget from 'vue-tap-target';
import VueI18n from 'vue-i18n';

import Config from './config.js';
import i18nMessages from './i18n/messages.js';

Vue.use(MuseUI);
Vue.use(VueScrollTo);
Vue.use(VueAnalytics, {
  id: 'UA-125886622-3',
  router
})
Vue.use(VueTapTarget);
Vue.use(VueI18n);

Vue.config.productionTip = false;

const i18n = new VueI18n({
  locale: 'en-US',
  messages: i18nMessages
});

/* eslint-disable no-new */
new Vue({
  i18n: i18n,
  store,
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});

Config.loadServerSideConfig()
  .then(() => {
    return store.dispatch('loadUser');
  })
  .then((user) => {
    if (user && user.language) {
      i18n.locale = user.language
    }
  });
