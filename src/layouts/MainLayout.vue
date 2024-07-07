<template>
  <!-- InvoiceModal -->
  <q-dialog
  v-if="!mobile"
  full-width
  full-height
  allow-focus-outside
  :persistent="checkContent"
  position="left"
  transition-duration="700"
  @shake="closeWithcontent"
  v-model="storeInvoices.invoiceModal"
  class="dialog-addInvoice"
  >
    <q-dialog  v-model="storeInvoices.modalActive">
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
  <v-bottom-sheet  v-if="mobile" v-model="storeInvoices.invoiceModal" scrollable inset>
      <v-card
        height="auto"
      >
      <InvoiceModal/>
      </v-card>
    </v-bottom-sheet>
  <q-dialog

  full-width
  full-height
  allow-focus-outside
  :persistent="checkContent"
  position="bottom"
  transition-duration="700"
  @shake="closeWithcontent"

  class="dialog-addInvoice"
  >
    <q-dialog  v-model="storeInvoices.modalActive">
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
  v-if="!mobile"
  full-width
  full-height
  allow-focus-outside
  :persistent="checkContent"
  :position="$route.path === '/Treasury' ? 'right' : 'left'"
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

  <v-bottom-sheet  v-if="mobile" v-model="storePayments.paymentModal" scrollable inset>
      <v-card
        height="auto"
      >
      <PaymentModal/>
      </v-card>
    </v-bottom-sheet>

     <!-- ExpenseModal -->
  <q-dialog
  v-if="!mobile"
  full-width
  full-height
  allow-focus-outside
  :persistent="checkContent"
  :position="$route.path === '/Treasury' ? 'right' : 'left'"
  transition-duration="700"
  @shake="closeWithcontent"
  v-model="storeExpenses.expenseModal"
  class="dialog-addInvoice"
  >
    <q-dialog  v-model="storeExpenses.modalActive">
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
    <ExpenseModal/>
  </q-dialog>

 <!-- <ion-header :style="{ 'transform': `translateY(${storeSettings.toolbarHidden ? '-100%' : '0'})`, 'transition': 'transform 0.5s ease-in-out'}">
    <ion-toolbar>

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

        </q-toolbar-title>

        <q-btn round icon="dark_mode" @click="$q.dark.toggle()"></q-btn>

        <q-btn v-if="storeAuth.user.uid" round>
        <q-avatar size="40px">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          <q-menu >
              <UserMenu
       />
          </q-menu>
        </q-avatar>
      </q-btn>
    </ion-toolbar>
  </ion-header> -->

  <!-- <div class="app-content flex flex-column">
        <Modal v-if="modalActive" />
      </div> -->

  <q-layout v-if="!mobile" view="lHh Lpr lFf" >
    <!-- <ion-header :style="{ 'transform': `translateY(${storeSettings.toolbarHidden ? '-100%' : '0'})`, 'transition': 'transform 0.5s ease-in-out'}">
    <ion-toolbar>

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

        </q-toolbar-title>

        <q-btn round icon="dark_mode" @click="$q.dark.toggle()"></q-btn>

        <q-btn v-if="storeAuth.user.uid" round>
        <q-avatar size="40px">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          <q-menu >
              <UserMenu
       />
          </q-menu>
        </q-avatar>
      </q-btn>
    </ion-toolbar>
  </ion-header> -->
    <q-header >
      <q-toolbar >
        <!-- <q-btn
          v-if="!mobile"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->
       <q-toolbar-title>
         <div class="row1">
         </div>



        </q-toolbar-title>

        <q-btn round icon="dark_mode" @click="$q.dark.toggle()"></q-btn>

        <q-btn v-if="storeAuth.user.uid" round>
        <q-avatar size="40px">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          <q-menu >
              <UserMenu
       />

          </q-menu>
        </q-avatar>
      </q-btn>
      <ion-label> <h6>Treasury</h6></ion-label>
      </q-toolbar>
    </q-header>

    <!-- <q-footer v-if="mobile" reveal bordered class="bg-white text-primary">
        <q-tabs no-caps indicator-color="transparent" class="text-grey" v-model="tab">
          <EssentialLinkMobile
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        </q-tabs>
      </q-footer> -->
    <q-drawer
        v-if="!mobile"
        v-model="leftDrawerOpen"
         show-if-above
        :mini="storeSettings.miniState"
        @mouseover="checkPopup"
        @mouseout="storeSettings.miniState = true"
        :width="200"
        :breakpoint="500"
        class="bg-grey-3 drawer "
    >
            <q-scroll-area class="fit q-pt-xl">
         <q-list padding>
        <div v-if="storeAuth.user.uid">
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        </div>
         <q-item
            v-if="!storeAuth.user.uid"
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
    <ion-page :style="pagePadding">
    <q-page-container >
      <router-view />
    </q-page-container>
    </ion-page>
  </q-layout>
  <ion-page  v-else  ref="page">
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar class="q-pb-lg" slot="bottom">

        <ion-tab-button tab="tab4" href="/Calendar">
          <ion-icon aria-hidden="true" :icon="calendar" />
          <ion-label>Calendar</ion-label>
        </ion-tab-button>


        <ion-tab-button tab="tab3" href="/Patients">
          <ion-icon aria-hidden="true" :icon="people" />
          <ion-label>Patients</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab1" href="/Treasury">
           <q-icon class="treasury-icon" size="26px" name="fa-solid fa-vault"></q-icon>
           <ion-label> <h6>Treasury</h6></ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/Invoices">
          <ion-icon aria-hidden="true" :icon="newspaper" />
          <ion-label>Invoices</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { ref,computed,watch } from 'vue'
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
import {IonPage, IonContent,IonHeader,IonToolbar, IonTabBar, IonTabButton, IonTabs,IonMenu, IonSplitPane, IonLabel, IonIcon, IonRouterOutlet, } from '@ionic/vue';
import { useStoreSettings } from 'src/stores/storeSettings'
import { newspaper, people, card ,calendar} from 'ionicons/icons';
import { useStoreExpenses } from 'src/stores/storeExpenses'
import ExpenseModal from 'src/components/ExpenseModal.vue'
const $q=useQuasar()


/*
 store
*/
 const storeAuth=useStoreAuth()
 const storeInvoices=useStoreInvoices()
 const storePayments=useStorePayments()
 const storeSettings=useStoreSettings()
 const storeExpenses=useStoreExpenses()
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
    link: '/Patients'
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
    title: 'Treasury',
    icon: 'fa-solid fa-vault',
    link: '/Treasury'
  }
]

    const leftDrawerOpen = ref(false)
    const miniState=ref(true)
    const link = ref('')
    const toggleLeftDrawer= ()=> {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    const checkPopup=()=>{
      if (storeInvoices.invoiceModal||storePayments.paymentModal)
      {storeSettings.miniState=true
        console.log('changed')
      }
    else storeSettings.miniState=false
    console.log('changed')
      }
      function handleToothSelected(selectedTeeth){
        console.log('selectedTeeth',selectedTeeth)

      }
      watch(() => storeInvoices.invoiceModal, (currentValue, oldValue) => {
         if(currentValue!==true){
          storeInvoices.CLEAR_DATA()
         }
     })
     watch(() => storePayments.paymentModal, (currentValue, oldValue) => {
         if(currentValue!==true){
          storePayments.CLEAR_DATA()
         }
     })


/*
 Invoice PopUp
*/

    const checkContent= computed(()=>{
      return false
    })
    function closeWithcontent () {
      if(checkContent)
      storeInvoices.modalActive=true
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
  const pagePadding=computed(()=>{
    return {
        '--padding-bottom': mobile.value ? '0px' : '42px'
        }
  })
</script>
<style lang="sass">

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


.drawer
   box-sizing: border-box
   z-index: 100!important
.header
   z-index: 10
   box-sizing: border-box
.q-toolbar
   min-height: 42px !important
   box-sizing: border-box
.sc-ion-label-ios-s h6

   font-size: 10px !important
.treasury-icon
   padding-bottom:1px
   padding-top:5px
.ion-page
   padding-bottom: var(--padding-bottom)
</style>
