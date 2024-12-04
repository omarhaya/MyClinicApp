<template>
  <ion-page ref="page">
    <ion-header v-if="mobile" :translucent="true">
    <ion-toolbar>
      <ion-title>Invoices</ion-title>
      <ion-buttons :collapse="true" slot="end">
        <q-btn round color="secondary" @click="openInvoiceModal" size="10px" icon="add"/>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-content" :fullscreen="true">
    <ion-header collapse="condense">
      <ion-toolbar class="home container">
        <ion-title size="large">Invoices</ion-title>
            <!-- Header -->


            <q-btn slot="end"  round flat color="secondary" icon="filter_alt">
  <q-menu :offset="[-10, 0]"   auto-close>
    <q-list class="filter-menu"  style="min-width: 100px">
      <q-item  @click="filteredInvoices" clickable>
        <q-item-section>Draft</q-item-section>
      </q-item>
      <q-item @click="filteredInvoices" clickable>
        <q-item-section >Pending</q-item-section>
      </q-item>
      <q-separator dark />
      <q-item @click="filteredInvoices" clickable>
        <q-item-section >Paid</q-item-section>
      </q-item>
      <q-item @click="filteredInvoices" clickable>
        <q-item-section >Partially Paid</q-item-section>
      </q-item>
      <q-item @click="filteredInvoices" clickable>
        <q-item-section >Over Due</q-item-section>
      </q-item>
      <q-item @click="filteredInvoices" clickable>
        <q-item-section >Clear Filter</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
  </q-btn>
        <ion-buttons :collapse="true" slot="end">
          <q-btn round color="secondary" @click="openInvoiceModal" icon="add"/>
        </ion-buttons>

        <span class=" header m2">There are {{ invoiceData.length }} total invoices</span>
      </ion-toolbar>
      <ion-toolbar>

    </ion-toolbar>
    </ion-header>
    <!-- <ion-button id="open-modal" expand="block">Open</ion-button> -->
<!--
<ion-modal ref="modal" trigger="open-modal" :can-dismiss="canDismiss" :presenting-element="presentingElement">
  <ion-header>
    <ion-toolbar>
      <ion-title>Modal</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss()">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <p class="ion-padding-horizontal">You must accept the terms and conditions to close this modal.</p>
    <ion-item>
      <ion-checkbox id="terms" @ionChange="onTermsChanged" :checked="canDismiss">
        <div class="ion-text-wrap">Do you accept the terms and conditions?</div>
      </ion-checkbox>
    </ion-item>
  </ion-content>
</ion-modal> -->
      <div class="home container">
     <!-- Header -->

     <div v-if="!mobile" class="header flex">
       <div class="left flex flex-column">
         <div class="m1">Invoices</div>
         <span class="m2">There are {{ invoiceData.length }} total invoices</span>
       </div>
       <div class="right flex">
         <div  class="filter flex">
           <span
             >Filter by status <span v-if="filteredInvoice">: {{ filteredInvoice }}</span></span
           >
           <img src="../assets/icon-arrow-down.svg" alt="" >

          <q-menu :offset="[-10, 0]"   auto-close>
           <q-list class="filter-menu"  style="min-width: 100px">
             <q-item  @click="filteredInvoices" clickable>
               <q-item-section>Draft</q-item-section>
             </q-item>
             <q-item @click="filteredInvoices" clickable>
               <q-item-section >Pending</q-item-section>
             </q-item>
             <q-separator dark />
             <q-item @click="filteredInvoices" clickable>
               <q-item-section >Paid</q-item-section>
             </q-item>
             <q-item @click="filteredInvoices" clickable>
               <q-item-section >Partially Paid</q-item-section>
             </q-item>
             <q-item @click="filteredInvoices" clickable>
               <q-item-section >Over Due</q-item-section>
             </q-item>
             <q-item @click="filteredInvoices" clickable>
               <q-item-section >Clear Filter</q-item-section>
             </q-item>
           </q-list>
         </q-menu>

         </div>
         <div @click="newInvoice" class="button flex">
           <div class="inner-button flex">
             <img src="../assets/icon-plus.svg" alt="" />
           </div>
           <span v-if="$q.screen.gt.xs">New Invoice</span>
         </div>
       </div>
 </div>
    <ion-list>
    <!-- Invoices -->
    <div v-if="invoiceData.length > 0">
      <Invoice
      @openPaymentModal="openPaymentModal"
      v-for="(invoice, index) in filteredData"
  :invoice="invoice"
  :mobile="mobile"
  :key="invoice.invoiceId"
  :pageRef="page"

        />
     </div>
     <div v-else-if="storeInvoices.loading||storeInvoices.moreDataAvailable"><invoiceLoading v-for="index in 3" :key="index"/></div>
     <div v-else class="empty flex flex-column">
       <img src="../assets/illustration-empty.svg" alt="" />
       <h3>There is nothing here</h3>
       <p>Create a new invoice by clicking the New Invoice button and get started</p>
     </div>
    </ion-list>
    <ion-infinite-scroll threshold="0" @ionInfinite="load">
      <ion-infinite-scroll-content></ion-infinite-scroll-content>
    </ion-infinite-scroll>
</div>
    </ion-content>
  </ion-page>

</template>

<script setup>
import Invoice from "src/components/Invoice.vue"
import invoiceLoading from "src/components/InvoiceLoading.vue"
import { storeToRefs } from 'pinia'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import {computed,ref,onMounted} from 'vue'
import {IonList,
   IonInfiniteScroll,
   IonInfiniteScrollContent,IonPage,IonModal,IonCheckbox,IonItem, IonHeader, IonToolbar, IonTitle, IonContent ,IonButtons, IonButton,modalController} from '@ionic/vue';
import { useStoreWorks } from "src/stores/storeWorks"
import { useQuasar } from "quasar"
import { Platform } from 'quasar'
import MobileInvoiceModal from 'src/components/MobileInvoiceModal.vue'
import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'
import { useStorePayments } from "src/stores/storePayments"
const $q=useQuasar()
/*
  Stores
*/
    const storeInvoices=useStoreInvoices()
    const storePayments=useStorePayments()
    const storeWorks=useStoreWorks()
    const {  invoicesLoaded } = storeToRefs(storeInvoices)
/*
  InvoiceData
*/
    // storeInvoices.GET_INVOICES()
    const invoiceData=computed(()=>{ return storeInvoices.invoiceData})
/*
 FilterRef
*/
   const   filteredInvoice= ref(null)
   function  newInvoice() {
      storeInvoices.TOGGLE_INVOICE()
    }

   function filteredInvoices(e) {
      if (e.target.innerText === "Clear Filter") {
        filteredInvoice.value = null
        return
      }
      filteredInvoice.value = e.target.innerText
    }

   const filteredData = computed(() => {
      return invoiceData.value.filter((invoice) => {


        if (filteredInvoice.value === "Draft") {
          return invoice.invoiceDraft === true
        }
        if (filteredInvoice.value === "Pending") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==0&&!invoice.invoiceDraft
        }
        if (filteredInvoice.value === "Paid") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==100
        }
        if (filteredInvoice.value === "Partially Paid") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage>0
        }
        if (filteredInvoice.value === "Over Due") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[invoice.invoiceId].overDue&&!invoice.invoiceDraft
        }
        return invoice
      })
    })

   async function load(ev) {
      await storeInvoices.GET_INVOICES_NEXT()
      setTimeout(() => ev.target.complete(), 50);
}
if(!storeInvoices.invoiceData.length)
{storeInvoices.GET_INVOICES_NEXT()}

// storeInvoices.GET_INVOICES_NEXT()
    // async function  onLoad (index, done) {
    //   setTimeout(() => {
    //     storeInvoices.GET_INVOICES_NEXT()
    //       done()
    //     }, 1000)

    //   }

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
/*
  Modal
*/


const openInvoiceModal = async () => {
    const modal = await modalController.create({
      component: MobileInvoiceModal,
      presentingElement:page.value.$el,

    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss(storeInvoices.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }

  };

  const openPaymentModal = async () => {
    const modal = await modalController.create({
      component: MobilePaymentModal,
      presentingElement:page.value.$el,
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss( storePayments.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }
  };
  const page = ref();
</script>

<style lang="scss" scoped>
.home {
box-sizing: border-box;
  .header {
    margin-bottom: 65px;

    .left,
    .right {
      flex: 1;
    }

    .right {
      justify-content: flex-end;
      align-items: center;

      .button,
      .filter {
        align-items: center;

        span {
          font-size: 12px;
        }
      }

      .filter {
        position: relative;
        margin-right: 40px;
        cursor: pointer;

        img {
          margin-left: 12px;
          width: 9px;
          height: 5px;
        }

        .filter-menu {
          width: 120px;
          position: absolute;
          top: 25px;
          list-style: none;
          background-color: #e1e6df;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

          li {
            cursor: pointer;
            font-size: 12px;
            padding: 10px 20px;

            &:hover {
              color: #1e2139;
              background-color: #fff;
            }
          }
        }
      }
    }
  }

  .empty {
    margin-top: 160px;
    align-items: center;

    img {
      width: 214px;
      height: 200px;
    }

    h3 {
      font-size: 20px;
      margin-top: 40px;
    }

    p {
      text-align: center;
      max-width: 224px;
      font-size: 12px;
      font-weight: 300;
      margin-top: 16px;
    }
  }
.flex {
    display: flex;
    flex-wrap:nowrap;
}
.m1 {
    font-size: 2.5em;
    font-weight:bold
      }

.m2 {
    font-size: 1.1em;
    font-weight: 500;
      }

}
.fade-out {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.filter-menu {
   width: 120px;
   top: 25px;
   list-style: none;
   background-color: #e1e6df;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
   border-radius: 0;
          }
.ion-content::part(scroll) {
--offset-top: 0px !important;
// --offset-bottom: 0px !important;
}
.list-md {
  background:none !important
}

</style>
<style scoped>
.invoice-wrap {
  /* Adjust modal styling */
  z-index: 9998; /* Ensure the modal's z-index is lower than the action sheet */
}

ion-action-sheet {
  z-index: 9999 !important; /* Ensure the action sheet appears above the modal */
}
</style>
