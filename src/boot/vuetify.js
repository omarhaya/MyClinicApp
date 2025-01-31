import { boot } from 'quasar/wrappers'
import { createApp } from 'vue'

// Import Vuetify
// import 'vuetify/styles'
// import '../css/vuetify-overrides.css'  // Add this line after vuetify styles
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'



// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { app } ) => {

  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      themes: {
        light: {
          colors: {
            primary: '#5cbe95',
            "on-primary": "#ffffff",
            // secondary: '#f4f4f5',
            // accent: '#9C27B0',
            'primary-darken-1': '#0c0a09',
            'secondary-darken-1': '#0c0a09',
            'button-hover': '#0c0a09',
          },
          variations: {
            colors: ['hover'],
            lighten: 1,
            darken: 1,
          },
        },
        dark: {
          colors: {
            primary: '#56dca8',
            secondary: '#c0ccf5',
            accent: '#9C27B0',
            'primary-darken-1': '#0c0a09',
            'secondary-darken-1': '#0c0a09',
            'button-hover': '#0c0a09',
          },
          variations: {
            colors: ['hover'],
            lighten: 1,
            darken: 1,
          },
        },
      },
    },
  })

  app.use(vuetify)

})
