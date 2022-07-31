import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    storage: window.sessionStorage,
  })],
  state: {
    authToken: null,
    permissions: [],
    role: {},
  },
  mutations: {
    changeAuthToken: (state, token) => {
      state.authToken = token
    },
    changePermissions: (state, permissions) => {
      state.permissions = permissions
    },
    changeRole: (state, role) => {
      state.role = role
    },
  },
  actions: {
  },
  getters: {
    loggedIn(state) {
      if ( state.authToken ) {
        return true
      }
      return false
    },
    hasPerm: (state) => (permissionName) => {
      return state.permissions.find(perm => perm.name == permissionName) ? true:false
    }
  },
  modules: {
  }
})