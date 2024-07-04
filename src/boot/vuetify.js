import { boot } from 'quasar/wrappers'
import { createApp } from 'vue'
// import App from 'src/pages/App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { app } ) => {

  const vuetify = createVuetify({
    components,
    directives,
  })

  app.use(vuetify)

})
