import { boot } from 'quasar/wrappers'
// import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import VueVirtualScroller from 'vue-virtual-scroller'

export default boot(async ( { app } ) => {
  // app.use(IonicVue).use(router);
  app.use(VueVirtualScroller)
})
