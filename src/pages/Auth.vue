<template>
  <ion-page>
    <!-- <ion-header :translucent="true" collapse="fade">
     <ion-toolbar >

      </ion-toolbar>
    </ion-header> -->
  <ion-content :fullscreen="true">
    <img src="~assets/wave.png" class="wave" alt="login-wave">
    <div class="row q-pt-xl" style="height: 80vh">
      <div class="col-0 col-md-6 flex justify-center content-center  ">
        <img src="~assets/login.svg" class="responsive" alt="login-image">
      </div>
      <div v-bind:class="{'justify-center': $q.screen.md || $q.screen.sm ||$q.screen.xs}"
           class="col-12 col-md-6 flex content-center">
        <q-card v-bind:style="$q.screen.lt.sm ? {'width': '80%'} : {'width': '50%'}">
          <q-card-section>
            <q-avatar size="103px" class="absolute-center shadow-10">
              <img src="~assets/avatar.svg" alt="avatar">
            </q-avatar>
          </q-card-section>
          <q-card-section>

          </q-card-section>
          <q-card-section>
            <div class="auth">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="register" label="Register" />
            <q-tab name="login" label="Login" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="register">
              <q-form class="q-gutter-md" @submit.prevent="onSubmit" @reset="onReset">
            <q-input
              v-model="credentials.email"
              label="Username/Email"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type something']"
            />
              <q-input label="Password"
              type="password"
              v-model="credentials.password"
              lazy-rules
              :rules="[
               val => val && val.length > 0  || 'Please type your password',
               val => val && val.length > 8 || 'password should be more than 8 letters and numbers'
               ]"/>

              <q-input
              label="Practice Name"
              v-model="credentials.practicename"
              lazy-rules
              :rules="[ val => val.length < 20 || 'Please Shorter Name']"/>

              <q-toggle v-model="accept" label="I accept the license and terms" />

            <div>
            <div>
              <q-btn :loading="storeAuth.loading"color="primary" label="Register" type="submit" rounded></q-btn>
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
              <div class="text-center q-mt-sm q-gutter-lg">
                <router-link class="text-white" to="/login">Esqueceu a senha?</router-link>
              </div>
              <div class="text-red">{{storeAuth.errorMessageRegister}}</div>
            </div>
          </q-form>
            </q-tab-panel>
            <q-tab-panel name="login">
              <q-card-section>
          <div class="q-pt-lg">
            <div class="col text-h6 ellipsis flex justify-center">
              <h5 class="text-h5 text-uppercase q-my-none text-weight-regular">Login Form</h5>
            </div>
          </div>
        </q-card-section>
           <q-form class="q-gutter-md" @submit.prevent="onSubmit" @reset="onReset">
            <q-input
              v-model="credentials.email"
              label="Username/Email"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type something']"
            />
              <q-input label="Password"
              type="password"
              v-model="credentials.password"
              lazy-rules
              :rules="[
               val => val && val.length > 0  || 'Please type your password',
               val => val && val.length > 8 || 'password should be more than 8 letters and numbers'
               ]"/>
               <div class="text-red">{{storeAuth.errorMessageLogin}}</div>
            <div>
              <q-btn :loading="storeAuth.loading" class="full-width" color="primary" label="Login" type="submit" rounded></q-btn>
              <div class="text-center q-mt-sm q-gutter-lg">
                <router-link class="text-black" to="/login">Forgot Password?</router-link>
              </div>

            </div>
          </q-form>
            </q-tab-panel>
          </q-tab-panels>

  </div>
          </q-card-section>

        </q-card>
      </div>
    </div>
</ion-content>
</ion-page>
</template>
<script setup>
    import { ref,reactive } from 'vue'
    import { useQuasar } from 'quasar'
    import {useStoreAuth} from 'stores/storeAuth'
    import {IonPage, IonHeader, IonToolbar, IonTitle, IonContent ,IonButtons, IonButton} from '@ionic/vue';

    /*
     store
    */
    const storeAuth=useStoreAuth()
    const $q = useQuasar()
    const accept = ref(false)

    const tab = ref('login')
    /*
      credentials
    */
     const credentials = reactive ({
      email:ref(null),
      password:ref(null),
      practicename:ref(null)
     })
    const onSubmit = ()=> {
            if (accept.value == true&&tab.value=='register') {
            storeAuth.registerUser(credentials)
            }
            else if (tab.value=='login'){
                storeAuth.loginUser(credentials)
            }
          }
    const onReset= ()=> {
            credentials.email= null
            credentials.password= null
            accept.value = false
            storeAuth.errorMessageRegister=''
          }


    </script>
<!--
  // <script>
  // import { useQuasar } from 'quasar'
  // import { mapActions } from 'vuex'
  // let $q
  // export default {
  //   name: 'Login',
  //   data () {
  //     return {
  //       login: {
  //         username: 'Joabson',
  //         password: 'a2d4g6j8'
  //       }
  //     }
  //   },
  //   methods: {
  //     ...mapActions('auth', ['doLogin']),
  //     async submitForm () {
  //       if (!this.login.username || !this.login.password) {
  //         $q.notify({
  //           type: 'negative',
  //           message: 'Os dados informados são inválidos.'
  //         })
  //       } else if (this.login.password.length < 6) {
  //         $q.notify({
  //           type: 'negative',
  //           message: 'A senha deve ter 6 ou mais caracteres.'
  //         })
  //       } else {
  //         try {
  //           await this.doLogin(this.login)
  //           const toPath = this.$route.query.to || '/admin'
  //           this.$router.push(toPath)
  //         } catch (err) {
  //           if (err.response.data.detail) {
  //             $q.notify({
  //               type: 'negative',
  //               message: err.response.data.detail
  //             })
  //           }
  //         }
  //       }
  //     }
  //   },
  //   mounted () {
  //     $q = useQuasar()
  //   }
  // }
  // </script> -->

  <style scoped>
  .Auth{
    box-sizing: border-box;
  }
  .q-card{
    box-sizing: border-box;
  }
  .wave {
    position: fixed;
    height: 100%;
    left: 0;
    bottom: 0;
    z-index: -1;
  }
  </style>
