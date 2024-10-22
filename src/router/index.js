import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from '@ionic/vue-router'
import routes from './routes'
import { useStoreAuth } from 'src/stores/storeAuth'

export default route(function (/* { store, ssrContext } */) {
  // Check if the app is running in Electron
  const isElectron = process.env.MODE === 'electron';

  // Choose the appropriate history mode
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (
      isElectron
        ? createWebHashHistory // Use hash mode in Electron
        : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)
    );

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Ensure the history mode is correctly set based on the environment
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Navigation guards
  Router.beforeEach(async (to, from, next) => {
    const storeAuth = useStoreAuth()

    if (!storeAuth.initialized) {
      try {
        console.log('storeAuth.loadingApp',storeAuth.loadingApp)
        // Show loading while authentication is being initialized
        storeAuth.loadingApp=true // Add loadingApp logic in your store
        await storeAuth.init()
        console.log('storeAuth.loadingApp',storeAuth.loadingApp)
        storeAuth.loadingApp=false
        console.log('storeAuth.loadingApp',storeAuth.loadingApp)
      } catch (error) {
        console.error('Initialization error:', error)
        storeAuth.loadingApp=false
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
