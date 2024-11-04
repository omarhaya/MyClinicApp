<template>
  <ion-page ref="page">
    <ion-header v-if="mobile" :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button :text="lastRouteText" :default-href="lastRoute"></ion-back-button>
      </ion-buttons>
      <ion-title>Back Button</ion-title>
    </ion-toolbar>
  </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>

        </ion-toolbar>
      </ion-header>
  <div v-if="currentInvoice" class="invoice-view container">
    <!-- <router-link v-if="!mobile" class="nav-link flex" :to="lastRoute">
      <img src="../assets/icon-arrow-left.svg" alt="" /> {{ lastRouteText }}
    </router-link> -->
    <!-- Header -->
    <div class="header flex">
      <router-link v-if="!mobile" class="nav-link flex" :to="lastRoute">
      <img src="../assets/icon-arrow-left.svg" alt="" />
    </router-link>
      <div class="left flex">

        <span>Status</span>
        <div v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]"
          class="status-button flex"
          :class="{
            paid: storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==100,
            draft: currentInvoice.invoiceDraft,
            pending: storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==0&&!currentInvoice.invoiceDraft,
            partiallyPaid: storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage>0,
          }"
        >
          <span v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==100">Paid</span>
          <span v-if="currentInvoice.invoiceDraft">Draft</span>
          <span v-if=" storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==0&&!currentInvoice.invoiceDraft">Pending<q-icon v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue" name="error_outline" class="q-ml-lg" color="red-5" size="18px">  <q-tooltip
          anchor="top middle"
          self="bottom middle"
          :offset="[10, 10]"
          transition-show="scale"
          transition-hide="scale"
        >
          Payment OverDue!
        </q-tooltip></q-icon></span>
          <span v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage>0">Partially Paid<q-icon v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue" name="error_outline" class="q-ml-lg" color="red-5" size="18px">  <q-tooltip
          transition-show="scale"
          transition-hide="scale"
          anchor="top middle"
          self="bottom middle"
          :offset="[10, 10]"
        >
          Payment OverDue!
        </q-tooltip></q-icon></span>
        </div>
      </div>
      <div class="right flex">
        <button v-if="$q.screen.gt.xs" @click="handleClick()" class="grey">Edit</button>
        <q-btn v-else color="grey-7" round flat icon="more_vert">
          <v-menu activator="parent">
        <v-list>
          <v-list-item
          @click="newPayment"
          >
            <v-list-item-title >New Payment</v-list-item-title>
          </v-list-item>
            <v-list-item
            @click="deleteInvoice(currentInvoice.docId)"
          >
            <v-list-item-title  >Delete</v-list-item-title>
          </v-list-item>
            <v-list-item
            @click="handleClick()"
          >
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
        </q-btn>
        <button v-if="$q.screen.gt.xs" @click="deleteInvoice(currentInvoice.docId)" class="red">Delete</button>
        <div v-if="$q.screen.gt.xs" @click="newPayment" class="button flex">
          <div class="inner-button ">
            <img src="../assets/icon-plus.svg" alt="" />
          </div>
          <div class="payment-text">New Payment</div>
        </div>
        <button  @click="updateStatusToPaid(currentInvoice.docId)" v-if="currentInvoice.invoicePending" class="green">
          Mark as Paid
        </button>
        <button
          v-if="currentInvoice.invoiceDraft || currentInvoice.invoicePaid"
          @click="updateStatusToPending(currentInvoice.docId)"
          class="orange"
        >
          Mark as Pending
        </button>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details flex flex-column">
      <div  class="top row">
        <div class="left col">
          <p><span>#</span>{{ currentInvoice.invoiceId }}</p>

    <h4>Bill To</h4>
          <p> <q-avatar v-if="!isArabic(currentInvoice.patientName)" class="q-mr-xs avatar-name" size="35px" font-size="16px" color="green-3" text-color="white"> {{getInitials( currentInvoice.patientName) }} </q-avatar>
              <q-avatar v-if="isArabic(currentInvoice.patientName)" class="q-mr-xs avatar-person" font-size="42px" size="35px" color="green-3" text-color="white" icon="person"/> {{ currentInvoice.patientName }}</p>
          <p>{{ currentInvoice.billerCity }}</p>
          <p>{{ currentInvoice.billerZipCode }}</p>
          <p>{{ currentInvoice.billerCountry }}</p>

        </div>
        <div  v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0]"  class="middle flex col">
        <div class="payment flex flex-column">
          <h4>Invoice Date</h4>
          <p>
            {{ currentInvoice.invoiceDate }}
          </p>
          <h4 v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDueDate">Due Date</h4>
          <p :class="{
            'text-red': storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue&&storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100&&!currentInvoice.invoiceDraft,
          }" v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDueDate">
            <span class="q-mr-md">{{ formatDate(storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDueDate)}}</span>
          </p>
          <!-- <h4 v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDate">Last Payment Date</h4>
          <p v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDate">
            {{ formatDate(storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDate)}}
          </p> -->
        </div>
      </div>
        <div class="right col"  v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]">
    <GrowingCircularProgress class="q-ma-md" :color="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==100?'teal-4':'orange'" :value="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==100?storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage:storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage-1"/>
        </div>
      </div>

      <div  class="bottom flex flex-column">
        <div  class="bottom flex flex-column">
        <div class="billing-items ">
          <div class="heading flex">
            <p>Work Done</p>

            <p>Price</p>

          </div>
          <ion-accordion-group :multiple="true">
    <ion-accordion v-if="!storeWorks.loading" v-for="(work, index) in storeWorks.invoiceWorks[currentInvoice.invoiceId]" :key="index" :value="index" >
      <ion-item slot="header" :color="work.color">
        <ion-label>{{ work.label }}</ion-label>
        <ion-label class="total" slot="end"><p><span class="currency">{{(work.currency)}} </span>{{formatMoney(work.price-work.discount) }}</p></ion-label>
      </ion-item>

  <v-timeline class="time-line"  align="start" side="end" slot="content">
    <v-timeline-item
      :dot-color="work.status === 'completed' ? 'red' : work.status === 'inprogress' ? 'grey':'grey'"
      size="small"
    >
    <template v-slot:icon>
      <v-row align="center" justify="center">
      <v-col cols="auto">
        <v-btn density="compact" icon="mdi-plus"></v-btn>
      </v-col>
    </v-row>

      </template>
      <template v-slot:opposite>
        <div v-if="work.statusDateUnix"
        :class="`pt-1 headline font-weight-bold text-${work.status === 'completed' ? 'red' : work.status === 'onhold' ? 'orange' : 'grey'}`"
        >
      Updated: {{ formatDate(work.statusDateUnix) }}
      <div class="caption">by {{ work.doctor.name }}</div>
      </div>

      </template>
      <div>
        <h2   :class="`pt-1 headline font-weight-bold text-${work.status === 'completed' ? 'red' : work.status === 'onhold' ? 'orange' : 'grey'}`">
      <!-- {{ work.status }} -->
      {{work.status}}

        </h2>

        <!-- <div  v-for="item in work.description">
          {{ item }},
        </div> -->
      </div>
    </v-timeline-item>

    <v-timeline-item
    v-if="work.subWorks"
    v-for="subWork in work.subWorks"
      :dot-color="work.color"
      size="x-small"
    >
      <template v-slot:opposite>
        <div
          :class="`pt-1 headline font-weight-bold text-${work.color}`"
        >
       {{formatDate(subWork.dateUnix)}}
      </div>
      </template>
      <div>
        <h2 :class="`mt-n1 headline font-weight-light mb-4 text-${work.color}`">
      {{ subWork.label  }}<span v-if="subWork.teeth">{{ (' for '+subWork.teeth ) }}</span>
      ( +{{ work.currency+' ' +subWork.price }})

        </h2>

        <div  v-for="item in subWork.description">
          {{ item }},
        </div>
      </div>
    </v-timeline-item>
    <v-timeline-item
      :dot-color="work.color"
      size="small"
    >
      <template v-slot:opposite>
        <div
          :class="`pt-1 headline font-weight-bold text-${work.color}`"
        >
       {{formatDate(work.dateUnix)}}
      </div>
      </template>
      <div>
        <h2 :class="`mt-n1 headline font-weight-light mb-4 text-${work.color}`">
      {{ work.label}}<span v-if="work.teeth!=''">{{ (' for '+work.teeth ) }}</span>

        </h2>

        <div  v-for="item in work.description">
          {{ item }},
        </div>
      </div>
    </v-timeline-item>
  </v-timeline>
    </ion-accordion>
  </ion-accordion-group>
          <!-- <div  v-if="!storeWorks.loading" v-for="work in storeWorks.invoiceWorks[currentInvoice.invoiceId]">
            <div :class="`bg-${work.color}-1 item flex col`">
               <p >{{ work.label}}</p>

               <p><span class="currency">{{(work.currency)}} </span>{{formatMoney(work.price) }}</p>

               <p><span class="currency">{{(work.currency)}} </span>{{formatMoney(work.price-work.discount) }}</p>
           </div>

          <div  v-for="payment in storePayments.invoicePayments[currentInvoice.invoiceId]" >
            <div  v-if="payment.workId==work.workId" class="item flex">
               <p>{{ payment.paid}}</p>
               <p>{{ payment.date}}</p>
               <p>{{ payment.paid}}</p>
           </div>
          </div>
        </div> -->
        <table class="table-total right-align">
      <tbody  v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]" v-for="subtotal in storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals">
        <tr>
          <td><span class="text-bold">Subtotal</span>   <span v-if="subtotal.length>1">IN ({{ subtotal.currency }})</span></td>
          <td><span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(subtotal.subTotal)}}</td>
        </tr>
        <tr  v-if="subtotal.totalDiscount>0" class="text-red ">
          <td >Discount ({{((subtotal.totalDiscount/subtotal.subTotal)*100).toFixed(2)}}%)</td>
          <td>  -<span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(subtotal.totalDiscount)}}</td>
        </tr>
        <tr  >
          <td ><span class="text-bold">Tax</span> ({{subtotal.tax}}%)</td>
          <td>   +<span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(((subtotal.subTotal-subtotal.totalDiscount)*subtotal.tax))}}</td>
        </tr>
        <tr  >
          <td > <span class="text-bold">Total</span>  <span v-if="subtotal.length>1">IN ({{ subtotal.currency }})</span></td>
          <td>    <span class="currency">{{(subtotal.currency)}} </span>{{formatMoney((subtotal.subTotal-subtotal.totalDiscount)+((subtotal.subTotal-subtotal.totalDiscount)*subtotal.tax))}}</td>
        </tr>
        <tr v-if="subtotal.paid"  >
          <td class="text-teal-6"> <span class="text-bold">Paid</span> </td>
          <td class="text-teal-6">    -<span class="currency">{{(subtotal.currency)}} </span >{{formatMoney((subtotal.paid))}}</td>
        </tr>
      </tbody>
    </table>

       </div>
      </div>
      <div class="due row ">
          <p>Amount Due</p>
          <p :class="{
            'text-green-9': subtotal.dueAmount==0,
            // 'text-red': storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue&&subtotal.dueAmount!==0&&!currentInvoice.invoiceDraft,
          }"
           class="text-right col-12 col-md" v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]" v-for="subtotal in storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals">
            <span class="currency">{{(subtotal.currency)}} </span>{{ formatMoney(subtotal.dueAmount) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</ion-content>
  </ion-page>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar';
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { useStorePatients } from 'src/stores/storePatients';
import { useStorePayments } from 'src/stores/storePayments'
import { useStoreWorks } from 'src/stores/storeWorks';
import {computed,ref,onMounted,watch} from 'vue'
import { useRoute,useRouter } from "vue-router";
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonPage, IonHeader, IonToolbar, IonTitle, IonContent , IonBackButton, IonButtons,modalController} from '@ionic/vue';
import { Platform } from 'quasar'
import MobileInvoiceModal from 'src/components/MobileInvoiceModal.vue'
import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'
import GrowingCircularProgress from '../components/GrowingCircularProgress.vue';

const $=useQuasar()
const page=ref()
/*
  Stores
*/
    const storeInvoices=useStoreInvoices()
    const storePayments=useStorePayments()
    const storeWorks=useStoreWorks()
    const storePatients=useStorePatients()
    const {  invoicesLoaded,currentInvoiceArray } = storeToRefs(storeInvoices)
/*
 Router
*/
    const route = useRoute()
    const router  = useRouter()
/*
  InvoiceData
*/
onMounted(() => {
      if(!storeInvoices.GET_CURRENT_INVOICE(route.params.invoiceId)){
        storeInvoices.SET_CURRENT_INVOICE(route.params.invoiceId)
      }
     })
    const currentInvoice=computed(()=>{
      if(!storeInvoices.GET_CURRENT_INVOICE(route.params.invoiceId)){
        return storeInvoices.invoiceData[route.params.invoiceId]
      }
      else{
      return storeInvoices.GET_CURRENT_INVOICE(route.params.invoiceId)
      }
    })
    function toggleEditInvoice() {
      storeInvoices.TOGGLE_EDIT_INVOICE()
      storeInvoices.TOGGLE_INVOICE()
    }
    async function deleteInvoice(docId) {
      storeInvoices.DELETE_INVOICE(docId)
      router.push({ name: "invoices" })
    }

    function updateStatusToPaid(docId) {
      storeInvoices.UPDATE_STATUS_TO_PAID(docId)
    }

    function updateStatusToPending(docId) {
      storeInvoices.UPDATE_STATUS_TO_PENDING(docId)
    }
/*
    Styling
*/
       const isArabic=(value) =>{
            return /[\u0600-\u06FF]/.test(value)
       }
       function getInitials(name) {
          const nameParts = name.split(' ');
          const firstName = nameParts[0].charAt(0).toUpperCase();
          const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          return `${firstName}${lastName}`;
       }
       const formatMoney = (value) => {
         const stringValue = value.toString()
         return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
       }
       const formatDate=(value) => {
        if (value) {
          let     dateOptions= { year: "numeric", month: "short", day: "numeric" }
          return new Date( value).toLocaleDateString("en-us", dateOptions)
        }
       }

       function  newPayment() {
        storePayments.patient=storePatients.patients.find(
        patient => patient.patientId === currentInvoice.value.patientId)
        storeInvoices.SET_PATIENT_INVOICES(currentInvoice.value.patientId,currentInvoice.value.invoiceId)
        if(!mobile.value){storePayments.TOGGLE_PAYMENT()
          console.log('not mobile')}
        else {openPaymentModal()}
    }
 const   tableData= [
        ['Content 1', 'Content 2'],
        ['Short', 'A bit longer content23123213å'],
        ['Longer Cont12321312ent', 'Shorter']
        // Add more rows and data as needed
      ]
      const   years=ref( [
        {
          color: 'cyan',
          year: '1960',
        },
        {
          color: 'green',
          year: '1970',
        },
        {
          color: 'pink',
          year: '1980',
        },
        {
          color: 'amber',
          year: '1990',
        },
        {
          color: 'orange',
          year: '2000',
        },
      ])
      const lastRoute = computed(() => {
      const route = router.options.history.state.back;
      return route ? route : '/';  // Default to home if no last route is found
    });

    const lastRouteText = computed(() => {
      const route = router.options.history.state.back;
      if (route) {
        const parts = route.split('/');
        return parts.length > 1 ? parts[1] : parts[0];
      } else {
        return 'home';
      }
    });

function handleClick () {
    if (!mobile.value) {
      // Actions for non-mobile devices
      storeInvoices.TOGGLE_INVOICE(currentInvoice.value.invoiceId);
      storeInvoices.editInvoice = true;
    } else {
      // Actions for mobile devices
      storeInvoices.TOGGLE_INVOICE(currentInvoice.value.invoiceId)
      openInvoiceModal()
      storeInvoices.editInvoice = true; // Example of different action
      // Add any other mobile-specific actions here
    }
  }

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

<style lang="scss" scoped>
.ion-dark .invoice-view {
  .header, .invoice-details {
    background-color: #1e3739;
    border-radius: 20px;

}
.header {
    align-items: center;
    padding: 24px 32px;
    font-size: 12px;

    .left {
      align-items: center;

      span {
        color: #fff;
        margin-right: 16px;
      }
    }

    .right {
      flex: 1;
      justify-content: flex-end;
@media (min-width: 900px) {
      button {
        cursor: pointer;
        padding: 16px 24px;
        border-radius: 30px;
        border: none;
        font-size: 12px;
        margin-right: 8px;
        color: #fff;
      }
    }
@media (max-width: 900px) {

      button {
        border-radius: 30px;
        border: none;
        color: #fff;
      }
    .q-btn:before {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: inherit;
    box-shadow:none;
}
    }
  }
  }
  @media (min-width: 900px) {

  ion-item {
  --padding-start: 16px;
  --inner-padding-end: 0px;
  }
  .invoice-details {
    padding: 48px;
    margin-top: 24px;
    * {
    margin: 0 !important;
    padding: 0;
    box-sizing: border-box;
}
    .top {
      div {
        color: #fff;
      }

      .left {
        font-size: 12px;
        p:first-child {
          font-size: 24px;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 8px;
        }
        h4 {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 12px;
      }
      p {
        font-size: 16px;
      }
        p:nth-child(2) {
          font-size: 16px;
        }

        span {
          color: #888eb0;
        }

      }

      .right {
        font-size: 12px;
        text-align: right;

      }
    }

    .middle {
      margin-top: 50px;
      color: #181818;
      gap: 16px;

      h4 {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
      }

      .bill,
      .payment {
        flex: 1;
      }
      .q-icon {
        padding-left: 10px;
        bottom:1px;
      }
      .payment {
        h4:nth-child(3) {
          margin-top: 32px;
        }

        p {
          font-weight: 600;
        }
      }

      .bill {
        p:nth-child(2) {
          font-size: 16px;
        }
        p:nth-child(3) {
          margin-top: auto;
        }

        p {
          font-size: 12px;
        }
      }

      .send-to {
        flex: 2;
      }
    }

    .bottom {
      padding-top: 20px;


      .billing-items {
        // padding: 20px 22px 32px 22px;
        border-radius: 20px 20px 0 0;
        background-color: #254544;

        .table-total {
          border-collapse: collapse;
          text-align: right;
        }
        .right-align {
          float: right;
          margin-left: 20px; /* Adjust the margin as needed */
        }
        .table-total,
        th,
        td {
          padding: 8px;
        }
        .table-total,
        td:nth-child(2) {
          background-color: #c2c2c24f;
          padding: 8px;
          text-align: right;
        }
        .heading {
          color: #fff;
          font-size: 12px;
          padding: 17px;
          font-weight: 600;


          p:first-child {
            flex: 2;
            text-align: left;
          }
          p:first-child + p {
            flex: 1;
            text-align: right;
            padding-right: 3%;
          }

          p {
            flex: 1;
            text-align: center;
          }
        }
        .time-line{
            padding: 0 10px 0 10px;
          }
        .item {
          // padding: 10px;
          font-size: 13px;
          color: #fff;

          &:last-child {
            margin-bottom: 0;
          }

          p:first-child  {
            flex: 2;
            // text-align: left;
            font-size: 13px;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: right;
          }
          span {
            font-size: 10px;
          }
        }
        .total {
          text-align: right;

          .total-heading {
            font-size:13px;
            font-weight: 500;
            text-align:left;
          }
        p {
          flex: 1;
          font-size:13px;
        }

        p:nth-child(1) {
          font-size: 13px;
          font-weight: 500;
          flex:4;
          padding: 10px;

        }
        p:nth-child(2) {
          background-color: #c2c2c24f;
          padding: 10px;
        }
        }
      }


      .due {
        color: #fff;
        padding: 20px 32px 20px 32px;
        background-color: rgba(12, 22, 21, 0.7);;
        align-items: center;
        border-radius: 0 0 20px 20px;
        p {

          font-size: 12px;
        }
        span {
          font-size:16px;
        }

        p:nth-child(2), p:nth-child(3) {
          font-size: 28px;
          text-align: right;
        }
      }
    }
  }
    .flex {
        flex-wrap: nowrap;
    }
 }
}
 @media (max-width: 900px) {


.ion-dark .invoice-details {
  padding: 15px;
  margin-top: 15px;
  * {
  margin: 0 !important;
  padding: 0;
  box-sizing: border-box;
}
  .top {
    div {
      color: #fff;
    }

    .left {
      font-size: 12px;
      p:first-child {
        font-size: 24px;
        text-transform: uppercase;
        color: #fff;
        margin-bottom: 8px;
      }
      h4 {
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 12px;
    }
    p {
      font-size: 16px;
    }
      p:nth-child(2) {
        font-size: 16px;
      }

      span {
        color: #888eb0;
      }

    }

    .right {
      font-size: 12px;
      text-align: right;
    }
  }

  .middle {
    margin-top: 50px;
    color: #181818;
    gap: 16px;

    h4 {
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 12px;
    }

    p {
      font-size: 16px;
    }

    .bill,
    .payment {
      flex: 1;
    }
    .q-icon {
      padding-left: 10px;
      bottom:1px;
    }
    .payment {
      h4:nth-child(3) {
        margin-top: 32px;
      }

      p {
        font-weight: 600;
      }
    }

    .bill {
      p:nth-child(2) {
        font-size: 16px;
      }
      p:nth-child(3) {
        margin-top: auto;
      }

      p {
        font-size: 12px;
      }
    }

    .send-to {
      flex: 2;
    }
  }

  .bottom {
    padding-top: 20px;


    .billing-items {
        // padding: 20px 22px 32px 22px;
        border-radius: 20px 20px 0 0;
        background-color: #254544;
        .table-total {
          border-collapse: collapse;
          text-align: right;
        }
        .right-align {
          float: right;
          margin-left: 20px; /* Adjust the margin as needed */
        }
        .table-total,
        th,
        td {
          padding: 0px;
        }
        .table-total,
        td:nth-child(2) {
          background-color: #c2c2c24f;
          padding: 8px;
          text-align: right;
        }

        .heading {
          color: #fff;
          font-size: 12px;
          padding: 17px;
          font-weight: 600;

          p:first-child {
            flex: 2;
            text-align: left;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: center;
          }
        }
        .time-line{
            padding: 0 10px 0 10px;
          }
        .item {
          // padding: 10px;
          font-size: 13px;
          color: #fff;

          &:last-child {
            margin-bottom: 0;
          }

          p:first-child  {
            flex: 2;
            text-align: left;
            font-size: 13px;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: right;
          }
          span {
            font-size: 10px;
          }
        }

      }


    .due {
      color: #fff;
      padding: 20px 32px 20px 32px;
      background-color: rgba(12, 22, 18, 0.7);
      align-items: center;
      border-radius: 0 0 20px 20px;
      p {

        font-size: 12px;
      }
      span {
        font-size:16px;
      }

      p:nth-child(2), p:nth-child(3) {
        font-size: 28px;
        text-align: right;
      }
    }
  }
}
  .flex {
      flex-wrap: nowrap;
  }
}
.button {
  .payment-text{
    padding-top: 7px;

  }.inner-button img {
    width: 10px;
    height: 10px;
    margin: -2px 4px -2px 5px;

}
}



//light mode
.invoice-view {
  padding-top:20px !important;
  .nav-link {
    // margin-bottom: 32px;
    align-items: center;
    color: #000000;
    font-size: 12px;
    img {
      margin-right: 16px;
      width: 7px;
      height: 10px;
    }
  }

  .header,
  .invoice-details {
    background-color: #e1e6df;
    border-radius: 20px;
  }

  .header {
    align-items: center;
    padding: 24px 32px;
    font-size: 12px;

    .left {
      align-items: center;

      span {
        color: #000000;
        margin-right: 16px;
      }
    }

    .right {
      flex: 1;
      justify-content: flex-end;
@media (min-width: 900px) {
      button {
        cursor: pointer;
        padding: 16px 24px;
        border-radius: 30px;
        border: none;
        font-size: 12px;
        margin-right: 8px;
        color: #fff;
      }
    }
@media (max-width: 900px) {

      button {
        border-radius: 30px;
        border: none;
        color: #fff;
      }
    .q-btn:before {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: inherit;
    box-shadow:none;
}
    }
  }
  }
  @media (min-width: 900px) {

  ion-item {
  --padding-start: 16px;
  --inner-padding-end: 0px;
  }
  .invoice-details {
    padding: 48px;
    margin-top: 24px;
    * {
    margin: 0 !important;
    padding: 0;
    box-sizing: border-box;
}
    .top {
      div {
        color: #000000;
      }

      .left {
        font-size: 12px;
        p:first-child {
          font-size: 24px;
          text-transform: uppercase;
          color: #000000;
          margin-bottom: 8px;
        }
        h4 {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 12px;
      }
      p {
        font-size: 16px;
      }
        p:nth-child(2) {
          font-size: 16px;
        }

        span {
          color: #888eb0;
        }

      }

      .right {
        font-size: 12px;
        text-align: right;

      }
    }

    .middle {
      margin-top: 50px;
      color: #181818;
      gap: 16px;

      h4 {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
      }

      .bill,
      .payment {
        flex: 1;
      }
      .q-icon {
        padding-left: 10px;
        bottom:1px;
      }
      .payment {
        h4:nth-child(3) {
          margin-top: 32px;
        }

        p {
          font-weight: 600;
        }
      }

      .bill {
        p:nth-child(2) {
          font-size: 16px;
        }
        p:nth-child(3) {
          margin-top: auto;
        }

        p {
          font-size: 12px;
        }
      }

      .send-to {
        flex: 2;
      }
    }

    .bottom {
      padding-top: 20px;


      .billing-items {
        // padding: 20px 22px 32px 22px;
        border-radius: 20px 20px 0 0;
        background-color: #efefef;

        .table-total {
          border-collapse: collapse;
          text-align: right;
        }
        .right-align {
          float: right;
          margin-left: 20px; /* Adjust the margin as needed */
        }
        .table-total,
        th,
        td {
          padding: 8px;
        }
        .table-total,
        td:nth-child(2) {
          background-color: #c2c2c24f;
          padding: 8px;
          text-align: right;
        }
        .heading {
          color: #000000;
          font-size: 12px;
          padding: 17px;
          font-weight: 600;


          p:first-child {
            flex: 2;
            text-align: left;
          }
          p:first-child + p {
            flex: 1;
            text-align: right;
            padding-right: 3%;
          }

          p {
            flex: 1;
            text-align: center;
          }
        }
        .time-line{
            padding: 0 10px 0 10px;
          }
        .item {
          // padding: 10px;
          font-size: 13px;
          color: #000000;

          &:last-child {
            margin-bottom: 0;
          }

          p:first-child  {
            flex: 2;
            // text-align: left;
            font-size: 13px;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: right;
          }
          span {
            font-size: 10px;
          }
        }
        .total {
          text-align: right;

          .total-heading {
            font-size:13px;
            font-weight: 500;
            text-align:left;
          }
        p {
          flex: 1;
          font-size:13px;
        }

        p:nth-child(1) {
          font-size: 13px;
          font-weight: 500;
          flex:4;
          padding: 10px;

        }
        p:nth-child(2) {
          background-color: #c2c2c24f;
          padding: 10px;
        }
        }
      }


      .due {
        color: #000000;
        padding: 20px 32px 20px 32px;
        background-color: #b4c2af;
        align-items: center;
        border-radius: 0 0 20px 20px;
        p {

          font-size: 12px;
        }
        span {
          font-size:16px;
        }

        p:nth-child(2), p:nth-child(3) {
          font-size: 28px;
          text-align: right;
        }
      }
    }
  }
    .flex {
        flex-wrap: nowrap;
    }
 }
}
 @media (max-width: 900px) {


.invoice-details {
  padding: 15px;
  margin-top: 15px;
  * {
  margin: 0 !important;
  padding: 0;
  box-sizing: border-box;
}
  .top {
    div {
      color: #000000;
    }

    .left {
      font-size: 12px;
      p:first-child {
        font-size: 24px;
        text-transform: uppercase;
        color: #000000;
        margin-bottom: 8px;
      }
      h4 {
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 12px;
    }
    p {
      font-size: 16px;
    }
      p:nth-child(2) {
        font-size: 16px;
      }

      span {
        color: #888eb0;
      }

    }

    .right {
      font-size: 12px;
      text-align: right;
    }
  }

  .middle {
    margin-top: 50px;
    color: #181818;
    gap: 16px;

    h4 {
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 12px;
    }

    p {
      font-size: 16px;
    }

    .bill,
    .payment {
      flex: 1;
    }
    .q-icon {
      padding-left: 10px;
      bottom:1px;
    }
    .payment {
      h4:nth-child(3) {
        margin-top: 32px;
      }

      p {
        font-weight: 600;
      }
    }

    .bill {
      p:nth-child(2) {
        font-size: 16px;
      }
      p:nth-child(3) {
        margin-top: auto;
      }

      p {
        font-size: 12px;
      }
    }

    .send-to {
      flex: 2;
    }
  }

  .bottom {
    padding-top: 20px;


    .billing-items {
        // padding: 20px 22px 32px 22px;
        border-radius: 20px 20px 0 0;
        background-color: #efefef;
        .table-total {
          border-collapse: collapse;
          text-align: right;
        }
        .right-align {
          float: right;
          margin-left: 20px; /* Adjust the margin as needed */
        }
        .table-total,
        th,
        td {
          padding: 0px;
        }
        .table-total,
        td:nth-child(2) {
          background-color: #c2c2c24f;
          padding: 8px;
          text-align: right;
        }

        .heading {
          color: #000000;
          font-size: 12px;
          padding: 17px;
          font-weight: 600;

          p:first-child {
            flex: 2;
            text-align: left;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: center;
          }
        }
        .time-line{
            padding: 0 10px 0 10px;
          }
        .item {
          // padding: 10px;
          font-size: 13px;
          color: #000000;

          &:last-child {
            margin-bottom: 0;
          }

          p:first-child  {
            flex: 2;
            text-align: left;
            font-size: 13px;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: right;
          }
          span {
            font-size: 10px;
          }
        }

      }


    .due {
      color: #000000;
      padding: 20px 32px 20px 32px;
      background-color: #b4c2af;
      align-items: center;
      border-radius: 0 0 20px 20px;
      p {

        font-size: 12px;
      }
      span {
        font-size:16px;
      }

      p:nth-child(2), p:nth-child(3) {
        font-size: 28px;
        text-align: right;
      }
    }
  }
}
  .flex {
      flex-wrap: nowrap;
  }
}
.button {
  .payment-text{
    padding-top: 7px;

  }.inner-button img {
    width: 10px;
    height: 10px;
    margin: -2px 4px -2px 5px;

}

}
.currency{
  font-size: 10px;
  vertical-align: text-top !important;
  padding-right: 3px !important;
}

</style>
<style>
  :root {

    --ion-color-pink: #fecdfa;
    --ion-color-pink-rgb: 254, 205, 211;
    --ion-color-pink-contrast: #000000;
    --ion-color-pink-contrast-rgb: 0, 0, 0;
    --ion-color-pink-shade: #e0b4ca;
    --ion-color-pink-tint: #fed2e8;
    --ion-color-green: #cdfecd;
    --ion-color-green-rgb: 254, 205, 211;
    --ion-color-green-contrast: #000000;
    --ion-color-green-contrast-rgb: 0, 0, 0;
    --ion-color-green-shade: #b4e0c2;
    --ion-color-green-tint: #d2fede;
    --ion-color-blue: #cdeefe;
    --ion-color-blue-rgb: 254, 205, 211;
    --ion-color-blue-contrast: #000000;
    --ion-color-blue-contrast-rgb: 0, 0, 0;
    --ion-color-blue-shade: #b4d3e0;
    --ion-color-blue-tint: #d2f8fe;
    --ion-color-red: #fecdcd;
    --ion-color-red-rgb: 254, 205, 211;
    --ion-color-red-contrast: #000000;
    --ion-color-red-contrast-rgb: 0, 0, 0;
    --ion-color-red-shade: #e0b4b4;
    --ion-color-red-tint: #fed2d2;
    --ion-color-lime: #eafecd;
    --ion-color-lime-rgb: 254, 205, 211;
    --ion-color-lime-contrast: #000000;
    --ion-color-lime-contrast-rgb: 0, 0, 0;
    --ion-color-lime-shade: #d3e0b4;
    --ion-color-lime-tint: #f0fed2;
    --ion-color-indigo: #9cb2f2;
    --ion-color-indigo-rgb: 254, 205, 211;
    --ion-color-indigo-contrast: #000000;
    --ion-color-indigo-contrast-rgb: 0, 0, 0;
    --ion-color-indigo-shade: #b4b6e0;
    --ion-color-indigo-tint: #d2d7fe;
  }

  .ion-color-green {
    --ion-color-base: var(--ion-color-green);
    --ion-color-base-rgb: var(--ion-color-green-rgb);
    --ion-color-contrast: var(--ion-color-green-contrast);
    --ion-color-contrast-rgb: var(--ion-color-green-contrast-rgb);
    --ion-color-shade: var(--ion-color-green-shade);
    --ion-color-tint: var(--ion-color-green-tint);
  }
  .ion-color-blue {
    --ion-color-base: var(--ion-color-blue);
    --ion-color-base-rgb: var(--ion-color-blue-rgb);
    --ion-color-contrast: var(--ion-color-blue-contrast);
    --ion-color-contrast-rgb: var(--ion-color-blue-contrast-rgb);
    --ion-color-shade: var(--ion-color-blue-shade);
    --ion-color-tint: var(--ion-color-blue-tint);
  }
  .ion-color-lime {
    --ion-color-base: var(--ion-color-lime);
    --ion-color-base-rgb: var(--ion-color-lime-rgb);
    --ion-color-contrast: var(--ion-color-lime-contrast);
    --ion-color-contrast-rgb: var(--ion-color-lime-contrast-rgb);
    --ion-color-shade: var(--ion-color-lime-shade);
    --ion-color-tint: var(--ion-color-lime-tint);
  }
  .ion-color-red {
    --ion-color-base: var(--ion-color-red);
    --ion-color-base-rgb: var(--ion-color-red-rgb);
    --ion-color-contrast: var(--ion-color-red-contrast);
    --ion-color-contrast-rgb: var(--ion-color-red-contrast-rgb);
    --ion-color-shade: var(--ion-color-red-shade);
    --ion-color-tint: var(--ion-color-red-tint);
  }
  .ion-color-indigo {
    --ion-color-base: var(--ion-color-indigo);
    --ion-color-base-rgb: var(--ion-color-indigo-rgb);
    --ion-color-contrast: var(--ion-color-indigo-contrast);
    --ion-color-contrast-rgb: var(--ion-color-indigo-contrast-rgb);
    --ion-color-shade: var(--ion-color-indigo-shade);
    --ion-color-tint: var(--ion-color-indigo-tint);
  }
.ion-dark  .ion-color-indigo, .ion-color-green, .ion-color-red ,  .ion-color-lime , .ion-color-blue {
  --ion-color-contrast: var(--ion-color-contrast-dark);
  }
.ion-dark .ion-color-green {
    --ion-color-base: #1a4120;
  }
.ion-dark .ion-color-blue {
    --ion-color-base:#195574;
  }
.ion-dark .ion-color-indigo {
    --ion-color-base:#3b539d;
  }
  div[slot='content'] {
    background: rgba(var(--ion-color-rose-rgb), 0.25);
  }


.ion-accordion-toggle-icon {
    display: none;
}

</style>
