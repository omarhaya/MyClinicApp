<template>
  <ion-page ref="page">
    <ion-header v-if="mobile" :translucent="true">
    <ion-toolbar>
      <ion-title>Invoices</ion-title>
      <ion-buttons :collapse="true" slot="end">

    <ion-fab-button  @click="openInvoiceModal" size="small">
      <ion-icon :icon="add"></ion-icon>
    </ion-fab-button>

        <!-- <q-btn round color="secondary" @click="openInvoiceModal" size="10px" icon="add"/> -->
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
 <ion-content ref="ionContent1" :fullscreen="true" :scroll-y="false" >

      <!-- Ensure scroller class properly styled -->
      <RecycleScroller
        class="ion-content-scroll-host scroller"
        :items="filteredData"
        :min-item-size="70"
        :items-limit="filteredData.length + 1000"
        :key-field="'invoiceId'"
        sizeField="size"
      >
      <template #before>
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
          <ion-fab-button  @click="openInvoiceModal" size="small">
      <ion-icon :icon="add"></ion-icon>
    </ion-fab-button>
        </ion-buttons>

        <span class=" header m2">There are {{ invoiceData.length }} total invoices</span>
      </ion-toolbar>
      <ion-toolbar>

    </ion-toolbar>
    </ion-header>

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
 </div>
  </template>
        <template #default="{ item,index ,active}">
       <Invoice
      :active="active"
      @openPaymentModal="openPaymentModal"
      :invoice="item"
      :mobile="mobile"
      :key="item.invoiceId"
      :pageRef="page"
        />
        </template>
    <template #after>
      <ion-infinite-scroll threshold="0" @ionInfinite="load">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </template>

      </RecycleScroller>

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
   IonInfiniteScrollContent,IonPage,  IonFab,
   IonFabButton,IonContent, IonHeader, IonToolbar, IonTitle ,IonButtons, IonButton,modalController} from '@ionic/vue';
import { useStoreWorks } from "src/stores/storeWorks"
import { useQuasar } from "quasar"
import { Platform } from 'quasar'
import MobileInvoiceModal from 'src/components/MobileInvoiceModal.vue'
import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'
import { useStorePayments } from "src/stores/storePayments"
import { RecycleScroller,DynamicScrollerItem } from "vue-virtual-scroller";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {add} from "ionicons/icons";
import { useStorePatients } from "src/stores/storePatients"


const $q=useQuasar()
/*
  Stores
*/
    const storeInvoices=useStoreInvoices()
    const storePayments=useStorePayments()
    const storePatients=useStorePatients()
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
   const $=useQuasar()
   const patientsLoaded = computed(() => {
  return storePatients.patients && storePatients.patients.length > 0;
});

const filteredData = computed(() => {
  // Wait until patients are loaded
  if (!patientsLoaded.value) return [];

  // Perform filtering logic
  return invoiceData.value.map((invoice) => {
    if (invoice.patientId) {
      // Assign patient name from loaded patients
      const patient = storePatients.patients.find(
        (patient) => patient.patientId === invoice.patientId
      );
      invoice.patientName = patient?.namef || '';
    }

    const nameSize = invoice.patientName.length > 18 ? 15 : 0;
    const size = $q.screen.lt.sm ? nameSize + 75 : 45;

    invoice.size =
      invoice.workItemList.length <= 1
        ? size * 1.5
        : size * 1.5 + invoice.workItemList.length * 15;

    if (filteredInvoice.value === 'Draft') {
      return invoice.invoiceDraft === true;
    }
    if (filteredInvoice.value === 'Pending') {
      return (
        storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage === 0 &&
        !invoice.invoiceDraft
      );
    }
    if (filteredInvoice.value === 'Paid') {
      return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage === 100;
    }
    if (filteredInvoice.value === 'Partially Paid') {
      return (
        storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage < 100 &&
        storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage > 0
      );
    }
    if (filteredInvoice.value === 'Over Due') {
      return (
        storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage < 100 &&
        storeWorks.invoiceWorks[invoice.invoiceId].overDue &&
        !invoice.invoiceDraft
      );
    }
    return invoice;
  });
});

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
     await Haptics.impact({ style: ImpactStyle.Light })
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
    await Haptics.impact({ style: ImpactStyle.Light });
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
z-index: 1000 !important;
// --offset-bottom: 0px !important;
}
.list-md {
  background:none !important
}

</style>
<style scoped>


ion-action-sheet {
  z-index: 9999 !important; /* Ensure the action sheet appears above the modal */
}
/* Ensure proper styling for scroller and Ionic components */
.scroller {
  height: 100%; /* Full height for the scroller */
}
.vue-recycle-scroller.direction-vertical:not(.page-mode) {
  z-index: 1000000 !important;
}

</style>
