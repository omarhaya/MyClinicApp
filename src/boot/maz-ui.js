import { boot } from 'quasar/wrappers'
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput'
import 'maz-ui/css/main.css' // Import the CSS for styling

export default boot(({ app }) => {
  app.component('MazPhoneNumberInput', MazPhoneNumberInput)
})
