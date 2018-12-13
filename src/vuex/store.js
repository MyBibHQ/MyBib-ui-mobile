import Vue from 'vue';
import Vuex from 'vuex';

import User from '@/classes/User.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: new User(),
    projectsDrawerIsOpen: false
  },
  getters: {
    user (state) {
      return state.user;
    },
    projectsDrawerIsOpen (state) {
      return state.projectsDrawerIsOpen;
    }
  },
  mutations: {
    LOAD_USER (state, user) {
      state.user = user;
    },
    TOGGLE_PROJECTS_DRAWER (state) {
      state.projectsDrawerIsOpen = !state.projectsDrawerIsOpen;
    }
  },
  actions: {
    loadUser (context) {
      return new Promise(async (resolve, reject) => {
        const user = new User();
        await user.init();
        context.commit('LOAD_USER', user);
        resolve(user);
      })
    },
    async toggleProjectsDrawer (context) {
      context.commit('TOGGLE_PROJECTS_DRAWER');
    }
  }
});
