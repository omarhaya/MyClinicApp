<template>
  <!-- InvoiceModal -->
  <q-dialog
  full-width
  full-height
  allow-focus-outside
  :persistent="checkContent"
  position="left"
  transition-duration="700"
  @shake="closeWithcontent"
  v-model="storeInvoice.invoiceModal"
  class="dialog-addInvoice"
  >
    <q-dialog  v-model="storeInvoice.modalActive">
                 <q-card>
                  <q-card-section>
                    <div class="text-h6">Second dialog</div>
                  </q-card-section>
                  <q-card-section class="row items-center q-gutter-sm">
                    <q-btn v-close-popup="2" label="Close" color="red" />
                    <q-btn v-close-popup label="Return" color="purple" />
                  </q-card-section>
                </q-card>
    </q-dialog>
    <InvoiceModal/>
  </q-dialog>
  <!-- PaymentModal -->
  <q-dialog
  full-width
  full-height
  allow-focus-outside
  :persistent="checkContent"
  position="right"
  transition-duration="700"
  @shake="closeWithcontent"
  v-model="storePayments.paymentModal"
  class="dialog-addInvoice"
  >
    <q-dialog  v-model="storePayments.modalActive">
                 <q-card>
                  <q-card-section>
                    <div class="text-h6">Second dialog</div>
                  </q-card-section>
                  <q-card-section class="row items-center q-gutter-sm">
                    <q-btn v-close-popup="2" label="Close" color="red" />
                    <q-btn v-close-popup label="Return" color="purple" />
                  </q-card-section>
                </q-card>
    </q-dialog>
    <PaymentModal/>
  </q-dialog>

  <!-- <div class="app-content flex flex-column">
        <Modal v-if="modalActive" />
      </div> -->
  <q-layout view="lHh Lpr lFf">
    <q-header class="header" elevated>
      <q-toolbar>
        <q-btn
          v-if="!mobile"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
       <q-toolbar-title>
         <div class="row1">
          <!-- <div class="text-subtitle1 ">{{todaysDate}} <q-spinner-rings color="grey" size="2em"/></div> -->
         </div>
         <!-- <div class="text-h6"> {{todaysDay}} </div> -->

       <q-img
        src="images/head.jpg"
        class="header-image absolute-top"
        />
        </q-toolbar-title>
         <!-- Dark Mode Button -->
        <q-btn round icon="dark_mode" @click="$q.dark.toggle()"></q-btn>
         <!-- User Menu Button -->
        <q-btn v-if="storeAuth.user.id" round>
        <q-avatar size="40px">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          <q-menu >
              <UserMenu
       />
          </q-menu>
        </q-avatar>
      </q-btn>

      </q-toolbar>
    </q-header>
    <q-footer v-if="mobile" reveal bordered class="bg-white text-primary">
        <q-tabs no-caps indicator-color="transparent" class="text-grey" v-model="tab">
          <EssentialLinkMobile
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        </q-tabs>
      </q-footer>
    <q-drawer
        v-else
        v-model="leftDrawerOpen"
         show-if-above
        :mini="miniState"
        @mouseover="checkPopup"
        @mouseout="miniState = true"
        :width="200"
        :breakpoint="500"
        class="bg-grey-3  "
    >
            <q-scroll-area class="fit q-pt-xl inset-shadow">
         <q-list padding>
        <div v-if="storeAuth.user.id">
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        </div>
         <q-item
            v-if="!storeAuth.user.id"
            v-ripple
            to="/auth"
            clickable
            :active="$route.fullPath === '/auth'"
            active-class="my-menu-link"
          >
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>

              <q-item-section>
                Login/Register
              </q-item-section>
            </q-item>
            <q-separator />
          <q-item
              v-ripple
              clickable
              :active="link === '/'"
              @click="link = 'inbox'"
              active-class="my-menu-link"
            >
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>

              <q-item-section>
                Settings
              </q-item-section>
          </q-item>
      </q-list>
        </q-scroll-area>
    </q-drawer>

    <q-page-container padding>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref,computed } from 'vue'
import {useStoreAuth} from 'stores/storeAuth'
import UserMenu from 'src/components/UserMenu.vue'
import { Platform } from 'quasar'
import EssentialLink from 'components/EssentialLink.vue'
import EssentialLinkMobile from 'src/components/EssentialLinkMobile.vue'
import { useStoreInvoices } from '../stores/storeInvoices'
// import Modal from 'src/components/Modal.vue'
import InvoiceModal from 'src/components/InvoiceModal.vue';
import { useQuasar } from 'quasar'
import ModalAddAppointment from 'src/components/PaymentsAndAppointments/ModalAddAppointment.vue'
import PaymentModal from 'src/components/PaymentModal.vue'
import { useStorePayments } from 'src/stores/storePayments'

const $q=useQuasar()


/*
 store
*/
 const storeAuth=useStoreAuth()
 const storeInvoice=useStoreInvoices()
 const storePayments=useStorePayments()
/*
 Drawer Links
*/

const essentialLinks = [
  {
    title: 'DashBoard',
    icon: 'inbox',
    link: '/'
  },
  {
    title: 'Patients List',
    icon: 'recent_actors',
    link: '/patients'
  },
  {
    title: 'Calendar',
    icon: 'calendar_today',
    link: '/Calendar'
  },
  {
    title: 'Invoices',
    icon: 'request_page',
    link: '/Invoices'
  },
  {
    title: 'Payments',
    icon: 'payments',
    link: '/Payments'
  }
]

    const leftDrawerOpen = ref(false)
    const miniState=ref(true)
    const link = ref('')
    const toggleLeftDrawer= ()=> {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    const checkPopup=()=>{
      if (storeInvoice.invoiceModal)
      {miniState.value=true}
    else miniState.value=false
      }

/*
 Invoice PopUp
*/

    const checkContent= computed(()=>{
      return false
    })
    function closeWithcontent () {
      if(checkContent)
      storeInvoice.modalActive=true
    }

/*
 Mobile
*/
   const   mobile=computed(()=>{
          if (Platform.is.desktop){
            return false
          }
          if (Platform.is.mobile){
        return true
          }
        })

</script>
<style lang="sass">
.header-image
   height: 100%
   z-index: -1
   opacity: 0.2

.row1
   height:20px
.q-dialog__inner--minimized
   padding: 0px
   padding-left: 57px !important

.dialog-addInvoice
   z-index: 101
   box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important
   button,
    .button
     cursor: pointer
     padding: 16px 24px
     border-radius: 30px
     border: none
     font-size: 12px
     margin-right: 8px
     color: #fff
   .q-dialog__backdrop
    background: rgb(0 0 0 / 17%)
   .q-dialog__inner > div
    border-radius: 0px
    box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06)




.header
   z-index: 100

</style>

