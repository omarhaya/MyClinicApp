<template>

    <ion-item-sliding class="invoice" :class="{ 'fade-out': isDeleted }" >

      <ion-item-options side="start">
        <ion-item-option expandable @click="newPayment" color="success"><q-icon size="25px" name="payment"/>Pay</ion-item-option>
      </ion-item-options>

      <ion-item lines="none" :disabled="!storeWorks.invoiceWorks[invoice.invoiceId]" :button="true" @click="$router.push(`/Invoices/${invoice.invoiceId}`)" detail="false" class="sliding-item" >
        <div class="left flex q-pt-xs q-pb-xs ">
      <span class="tracking-number">#{{ invoice.invoiceId }}</span>

      <span>

        <q-avatar v-if="!isArabic(invoice.patientName)" class="q-mr-xs avatar-name" size="35px" font-size="16px" color="green-3" text-color="white"> {{getInitials( invoice.patientName) }} </q-avatar>
              <q-avatar v-if="isArabic(invoice.patientName)" class="q-mr-xs avatar-person" font-size="42px" size="35px" color="green-3" text-color="white" icon="person"/>
        <span class="text-bold" > {{ invoice.patientName }}</span></span>
      <span> <div class="column" v-if="storeWorks.invoiceWorks[invoice.invoiceId]" v-for="item in storeWorks.invoiceWorks[invoice.invoiceId]">  <q-badge :color="item.color" class="col q-mt-xs">{{ item.label}}

        <q-badge  v-if="item.teeth&&item.teeth.length" color="white" class="q-ml-xs text-black">      <!-- Render the first two items -->
      <span v-for="(tooth, index) in getDisplayedItems(item.teeth)" :key="index" >
        <!-- Render your content for the first two items -->
        {{'#'+ tooth }}
      </span>
       <span v-if="item.teeth.length>2">...</span>
    </q-badge>

      </q-badge ><q-badge v-if="item.doctor.name!==''" class="col q-mt-xs" color="grey-5" >{{' by Dr. '+item.doctor.name }}</q-badge></div>
        <div class="column" v-else>     <q-skeleton class="q-mt-xs"  :type="'QBadge'"  width="100%"/><q-skeleton class="q-mt-xs" :type="'QBadge'"  width="100%"/></div>
      </span>
     </div>
     <div class="right justify-end flex row">
      <span> <div v-if="storeWorks.invoiceWorks[invoice.invoiceId]" v-for="subtotal in storeWorks.invoiceWorks[invoice.invoiceId].subTotals" class="price center column">
      <div  class="col flex"><span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(subtotal.totalAmount) }}</div>
     </div>
        <!-- <div class="center column price">
          <q-circular-progress

      show-value
      rounded
      font-size="12px"
      :value="value"
      size="50px"
      :thickness="0.30"
      color="teal"
      track-color="grey-3"
      >
      %{{ value }}
      </q-circular-progress>
        </div> -->
      </span>
  <span v-if="storeWorks.invoiceWorks[invoice.invoiceId]" class="flex">
    <v-progress-linear
      v-model="storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage"
      height="37"
      bg-opacity="0.8"
      rounded="10"
      class="progress-buttom"
      :class="{ paid: storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==100, draft: invoice.invoiceDraft, pending: storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==0,partiallyPaid: storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage>0,overDue: storeWorks.invoiceWorks[invoice.invoiceId].overDue&&storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&!invoice.invoiceDraft, }"
    >
      <template v-slot:default="{ value }">
        <span class="paid-text" v-if="storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==100">Paid <q-icon name="done" size="15px" color="teal-4" > </q-icon></span>
        <span class="draft-text" v-if="invoice.invoiceDraft">Draft</span>

        <span class="pending-text" v-if="storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==0&&!invoice.invoiceDraft&&!storeWorks.invoiceWorks[invoice.invoiceId].overDue">Pending</span>
        <span class="partiallyPaid-text" v-if="storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage>0&&!storeWorks.invoiceWorks[invoice.invoiceId].overDue">Partly</span>
        <span class="overDue-text" v-if="storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[invoice.invoiceId].overDue&&!invoice.invoiceDraft">Over Due</span>
      </template>
    </v-progress-linear>
  </span>
      <div v-else> <q-skeleton class="progress-buttom flex"/></div>
      <div class="icon">
        <img src="../assets/icon-arrow-right.svg" alt="" />
      </div>
    </div>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option ><q-icon size="25px" name="edit"/> Edit</ion-item-option>
        <ion-item-option @click="isOpen=true" expandable color="danger"><q-icon size="25px" name="delete"/>Delete</ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
    <ion-action-sheet   @didDismiss="isOpen=false" :is-open="isOpen"  header="Actions" :buttons="actionSheetButtons"/>
</template>

<script setup>
import { useStorePayments } from 'src/stores/storePayments'
import { useStoreWorks } from 'src/stores/storeWorks'
import { useStorePatients } from 'src/stores/storePatients'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { ref,watch,getCurrentInstance,computed } from 'vue'
import { IonItem,IonActionSheet, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList } from '@ionic/vue';


const instance = getCurrentInstance()
const props = defineProps({
  invoice:{
    type : Object,
    required:true
  },
  mobile:{
    type : Boolean,
    required:true
  }
})
const isOpen=ref(false)
/*
 Stores
*/
  const storeWorks=useStoreWorks()
  const storePayments=useStorePayments()
  const storePatients=useStorePatients()
  const storeInvoices=useStoreInvoices()
const skill=ref(60)
   /*
    Styling
   */
   const isDeleted = ref(false)

watch(() => props.invoice.deleted, (newValue) => {
  if (newValue) {
    // Add a small delay before setting isDeleted to true to allow Vue to re-render the component
    setTimeout(() => {
      isDeleted.value = true
    }, 100)
  }
})
/*
 Filters
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
      const  getDisplayedItems=(teeth) => {
      const maxItemsToShow = 2; // Define the maximum number of items to display
      return teeth.slice(0, maxItemsToShow)
       }
    function  newPayment() {
        storePayments.patient=storePatients.patients.find(
        patient => patient.patientId === props.invoice.patientId)
        storeInvoices.SET_PATIENT_INVOICES(props.invoice.patientId,props.invoice.invoiceId)
        if(!props.mobile){storePayments.TOGGLE_PAYMENT()
          console.log('not mobile')}
        else {instance.emit('openPaymentModal')}
    }
    async function deleteInvoice(docId) {
      storeInvoices.DELETE_INVOICE(docId)
      console.log('itemDeleted')
    }
    const actionSheetButtons =ref([
        {
          text: 'Delete',
          role: 'destructive',
          data: {
            action: 'delete',
          },
          handler: () => {
          // console.log(props.invoice.invoiceId,isOpen.value)
          // const index = storeInvoices.invoiceData.findIndex(item => item.invoiceId === props.invoice.invoiceId);

          // if (index !== -1) {
          //   // If the item is found, update the property
          //   storeInvoices.invoiceData[index].deleted = true;
          // }
          isDeleted.value = true
          setTimeout(() => {
            storeInvoices.DELETE_INVOICE(props.invoice.docId)
          }, 280)

          const slidingItem = document.querySelector('.invoice')
          slidingItem.closeOpened()
        }
        },
        {
          text: 'Archive',
          data: {
            action: 'archive',
          },
        },
        {
          text: 'Cancel',
          role:'cancel',
          data: {
            action: 'cancel',
          },
          handler: () => {
          const slidingItem = document.querySelector('.invoice')
          slidingItem.closeOpened()
        }
        },
      ])

</script>

<style lang="scss" scoped>
.invoice {
  text-decoration: none;
  cursor: pointer;
  // gap: 16px;
  margin-bottom: 16px;
  color: #000000;
  border-radius: 20px;

  // min-height: 100px;
  background-color: #e1e6df;
  align-items: center;
  ion-item {
    --background: #e1e6df;
    --padding-top:0px !important;
    --padding-bottom:0px !important;

  }

  // .sliding-item{
  //   background: #e1e6df;
  // }
  .person {
      align-items: center;

    }
  span {
    font-size: 13px;
  }

  .left {
    align-items: center;
    flex-basis: 60%;
    gap: 16px;

    span {
      flex: 1;
    }

    .tracking-number {
      text-transform: uppercase;
      max-width:65px;
    }
  }

  .right {
    gap: 16px;
    flex-basis: 40%;
    align-items: center;

    .price {
      flex: 1;
      flex-basis: 10% !important;
      font-size: 16px;
      font-weight: 600px;
      align-items: center;
      min-width: 130px;
      span {
        font-size: 10px;
      }
    }
    .status-button{
      flex-basis: 37% !important;
      max-width: 140px;
      min-width: 108px;
    }
  }
}
.progress-buttom{
    border-radius: 10px !important;
    flex-basis: 37% !important;
    width:100%;
      max-width: 140px;
      min-width: 108px;
}

</style>

<style lang="scss">
.v-progress-linear__background {
border-radius: 10px !important;
}
.v-progress-linear__determinate {
 position: initial !important;
}
.fade-out {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
</style>

