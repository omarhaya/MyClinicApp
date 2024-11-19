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
    <q-dialog v-model="storeInvoices.modalActive">
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
    <InvoiceModal />
  </q-dialog>
  <v-bottom-sheet v-if="mobile" v-model="storeInvoices.invoiceModal" scrollable inset>
    <v-card height="auto">
      <InvoiceModal />
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
    <q-dialog v-model="storeInvoices.modalActive">
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
    <InvoiceModal />
  </q-dialog>
  <!-- PaymentModal -->
  <q-dialog
    v-if="!mobile"
    full-width
    full-height
    allow-focus-outside
    :persistent="checkContent"
    :position="$route.path === '/Transactions' ? 'right' : 'left'"
    transition-duration="700"
    @shake="closeWithcontent"
    v-model="storePayments.paymentModal"
    class="dialog-addInvoice"
  >
    <q-dialog v-model="storePayments.modalActive">
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
    <PaymentModal />
  </q-dialog>

  <v-bottom-sheet v-if="mobile" v-model="storePayments.paymentModal" scrollable inset>
    <v-card height="auto">
      <PaymentModal />
    </v-card>
  </v-bottom-sheet>

  <!-- ExpenseModal -->
  <q-dialog
    v-if="!mobile"
    full-width
    full-height
    allow-focus-outside
    :persistent="checkContent"
    :position="$route.path === '/Transactions' ? 'right' : 'left'"
    transition-duration="700"
    @shake="closeWithcontent"
    v-model="storeExpenses.expenseModal"
    class="dialog-addInvoice"
  >
    <q-dialog v-model="storeExpenses.modalActive">
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
    <ExpenseModal />
  </q-dialog>

  <q-layout v-if="!mobile" view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn flat @click="toggleLeftDrawer()" round dense icon="menu" />
        <q-toolbar-title>
          <div class="row1"></div>
        </q-toolbar-title>

        <q-btn round icon="dark_mode" @click="toggleDarkMode"></q-btn>

        <q-btn v-if="storeAuth.user.uid" round>
          <q-avatar size="40px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            <q-menu>
              <UserMenu />
            </q-menu>
          </q-avatar>
        </q-btn>
        <ion-label>
          <!-- <h6>appLogo</h6> -->
        </ion-label>
      </q-toolbar>

    </q-header>

    <ion-page :style="pagePadding">

      <q-page-container>

        <q-drawer
      v-if="!mobile"
      v-model="leftDrawerOpen"
      show-if-above
      :mini="storeSettings.miniState"
      @mouseover="checkPopup"
      @mouseout="storeSettings.miniState = true"
      :width="200"
      :breakpoint="500"
      class="drawer "
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item style="padding:8px 14px">
            <q-item-section avatar>
              <q-icon size="29px" style="height: 19px; filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.5));" name="appLogo" />
            </q-item-section>

          </q-item>
          <div v-if="storeAuth.user.uid">
            <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
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
          <q-item v-ripple clickable :active="link === '/'" @click="link = 'inbox'" active-class="my-menu-link">
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
        <router-view />
      </q-page-container>
    </ion-page>
  </q-layout>
  <ion-page v-else ref="page">
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

        <ion-tab-button tab="tab1" href="/Transactions">
          <ion-icon aria-hidden="true" :icon="swapHorizontalOutline" />
          <ion-label>Transactions</ion-label>
        </ion-tab-button>


        <ion-tab-button tab="tab2" href="/Invoices">
          <ion-icon aria-hidden="true" :icon="newspaper" />
          <ion-label>Invoices</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab5" href="/">
          <ion-icon aria-hidden="true" :icon="grid" />
          <ion-label>DashBoard</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStoreAuth } from 'stores/storeAuth'
import UserMenu from 'src/components/UserMenu.vue'
import { Platform } from 'quasar'
import EssentialLink from 'components/EssentialLink.vue'
import EssentialLinkMobile from 'src/components/EssentialLinkMobile.vue'
import { useStoreInvoices } from '../stores/storeInvoices'
import InvoiceModal from 'src/components/InvoiceModal.vue'
import { useQuasar } from 'quasar'
import PaymentModal from 'src/components/PaymentModal.vue'
import { useStorePayments } from 'src/stores/storePayments'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonRouterOutlet } from '@ionic/vue'
import { useStoreSettings } from 'src/stores/storeSettings'
import { newspaper, people, calendar,swapHorizontalOutline,grid} from 'ionicons/icons'
import { useStoreExpenses } from 'src/stores/storeExpenses'
import ExpenseModal from 'src/components/ExpenseModal.vue'
import { useTheme } from 'vuetify'


const theme = useTheme()
const $q = useQuasar()
const treasuryIcon = 'src/assets/vault-solid.svg'
const storeAuth = useStoreAuth()
const storeInvoices = useStoreInvoices()
const storePayments = useStorePayments()
const storeSettings = useStoreSettings()
const storeExpenses = useStoreExpenses()
const essentialLinks = [
{
    title: 'DashBoard',
    icon: 'inbox',
    link: '/'
  },
  {
    title: 'Patients',
    icon: 'people',
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
    title: 'Transactions',
    icon: 'swap_horiz',
    link: '/Transactions'
  }
]

const myIcons = {
  'appLogo': 'img:/src/assets/appLogo.svg',
}


$q.iconMapFn = (iconName) => {
  const icon = myIcons[iconName]
  if (icon !== undefined) {
    return { icon }
  }
}
const drawer= ref(true)
const leftDrawerOpen = ref(false)
const miniState = ref(true)
const link = ref('')

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const checkPopup = () => {
  if (storeInvoices.invoiceModal || storePayments.paymentModal) {
    storeSettings.miniState = true
  } else {
    storeSettings.miniState = false
  }
}

function handleToothSelected(selectedTeeth) {
  console.log('selectedTeeth', selectedTeeth)
}

watch(() => storeInvoices.invoiceModal, (currentValue) => {
  if (!currentValue) {
    storeInvoices.CLEAR_DATA()
  }
})

watch(() => storePayments.paymentModal, (currentValue) => {
  if (!currentValue) {
    storePayments.CLEAR_DATA()
  }
})

const checkContent = computed(() => false)

function closeWithcontent() {
  if (checkContent) {
    storeInvoices.modalActive = true
  }
}

const mobile = computed(() => Platform.is.mobile)
const pagePadding = computed(() => ({ '--padding-bottom': mobile.value ? '0px' : '42px' }))

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

const darkMode = computed({
  get() {
    return $q.dark.isActive
  },
  set(value) {
    $q.dark.set(value)
    document.body.classList.toggle('dark', value)
    document.body.classList.toggle('ion-dark', value)
    theme.global.name.value = value ? 'dark' : 'light'
  }
})

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}

const updateDarkMode = (event) => {
  darkMode.value = event.matches
}

onMounted(() => {
  darkMode.value = prefersDark.matches
  prefersDark.addEventListener('change', updateDarkMode)
})

onBeforeUnmount(() => {
  prefersDark.removeEventListener('change', updateDarkMode)
})

</script>

<style lang="sass">

.q-dialog__inner--minimized
   padding: 0px
   padding-left: 57px !important

.dialog-addInvoice
   z-index: 1
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
.header
   z-index: 10
   box-sizing: border-box
.q-toolbar
   min-height: 42px !important
   box-sizing: border-box
.ion-text
   font-size: 11px !important
.appLogo-icon
   padding-bottom:1px
   padding-top:5px
.ion-page
   padding-bottom: var(--padding-bottom)
.q-drawer
    position: absolute
    top: 0
    bottom: 0
    // background: #fff
    z-index: 0

</style>
<style scoped>
.dialog-addInvoice {
  /* Adjust modal styling */
  z-index: 9998 !important; /* Ensure the modal's z-index is lower than the action sheet */
}

ion-action-sheet {
  z-index: 9999 !important; /* Ensure the action sheet appears above the modal */
}
</style>
