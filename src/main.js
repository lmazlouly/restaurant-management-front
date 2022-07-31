import Vue from 'vue'
import axios from './plugins/axios'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
// Moment for date format
import moment from 'moment'
// Sweet Alert
import VueSweetalert2 from 'vue-sweetalert2';
Vue.use(VueSweetalert2);
// If you don't need the styles, do not connect
import 'sweetalert2/dist/sweetalert2.min.css';
import './assets/styles.css'
import store from './store'

Vue.config.productionTip = false

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('DD/MM/YYYY')
  }
})

// import dotEnv from 'dotenv'
// dotEnv.config();
new Vue({
  axios,
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')