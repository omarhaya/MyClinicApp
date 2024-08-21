import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from '@ionic/vue-router'
import routes from './routes'
import { useStoreAuth } from 'src/stores/storeAuth'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // navigation guards
  Router.beforeEach(async (to, from, next) => {
    const storeAuth = useStoreAuth()

    if (!storeAuth.initialized) {
      try {
        await storeAuth.init()
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }

    if (!storeAuth.user.uid && to.name !== 'auth') {
      next({ name: 'auth' })
    } else if (storeAuth.user.uid && to.name === 'auth') {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  })

  return Router
})
