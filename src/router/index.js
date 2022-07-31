import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
/** middleware Pipeline for multiple middlewares */
import middlewarePipeline from './middlewarePipeline'
/** Middlewares */
import guest from './middlewares/guest'
// import auth from './middlewares/auth'
/** Store */
import store from '../store'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: {
      middleware: [ guest ]
    },
    component: Home
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (!to.meta.middleware) {
    return next()
  }
  const middleware = to.meta.middleware
  const context = {
    to,
    from,
    next,
    store
  }
  return middleware[0]({
      ...context,
      next: middlewarePipeline(context, middleware, 1)
  })
})

export default router
