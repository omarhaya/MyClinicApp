import { boot } from 'quasar/wrappers'
// import App from 'src/pages/App.vue'
import router from '/src/router';
import { IonicVue } from '@ionic/vue';
/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import '/src/theme/variables.css';


export default boot(async ( { app } ) => {
  app.use(IonicVue).use(router);
})
