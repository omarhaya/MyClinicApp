<template>

        <div class=" no-wrap q-pa-xs" style="max-width: 300px">

          <div class=" text-h6 q-mb-sm q-ml-sm">Personal Info.</div>

          <div class="row items-center q-ml-sm">
          <div class="column">
            <q-avatar size="57px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </div>
            <div v-if="storeAuth.user.uid" class=" column  q-ml-md q-mt-xs q-pt-md q-mb-lg">
            <div class="text-subtitle2">{{storeAuth.user.email}}</div>
            <div class="text-subtitle align-center" v-if="storeAuth.user.admin">Admin</div>
            <div class="text-subtitle align-center" v-if="storeAuth.user.doctor">Doctor</div>
            </div>

            <q-separator class="q-mx-xl" />

            <q-btn
              class="q-mb-sm"
              v-if="storeAuth.user.uid"
              color="primary"
              label="Logout"
              push
              size="sm"
              @click="storeAuth.logoutUser"
              v-close-popup
            />
          </div>
        </div>

</template>

<script setup>
import { ref } from 'vue'
import {useStoreAuth} from 'stores/storeAuth'
/*
 store
*/
const storeAuth=useStoreAuth()

     const mobileData= ref(true)
     const bluetooth= ref(false)

</script>
