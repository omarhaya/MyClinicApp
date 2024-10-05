<template>

    <ion-item-sliding class="payment" :class="{ 'fade-out': isDeleted }" >

      <!-- <ion-item-options side="start">
        <ion-item-option expandable @click="newPayment" color="success"><q-icon size="25px" name="payment"/>Pay</ion-item-option>
      </ion-item-options> -->

      <ion-item v-if="payment.patientName" lines="none" :button="true" @click="$router.push(`/Invoices/${payment.invoiceId}`)" detail="false" class="sliding-item" >
        <q-checkbox  :model-value="tableProps.selected" @update:model-value="(val, evt) => { Object.getOwnPropertyDescriptor(tableProps, 'selected').set(val, evt) }" />
        <div class="left flex q-pt-xs q-pb-xs ">
      <span class="tracking-number">#{{ payment.invoiceId }}</span>

      <span>

        <q-avatar v-if="!isArabic(payment.patientName)" class="q-mr-xs avatar-name" size="35px" font-size="16px" color="green-3" text-color="white"> {{getInitials( payment.patientName) }} </q-avatar>
              <q-avatar v-if="isArabic(payment.patientName)" class="q-mr-xs avatar-person" font-size="42px" size="35px" color="green-3" text-color="white" icon="person"/>
        <span class="text-bold" > {{ payment.patientName }}</span></span>

     </div>
     <div class="right justify-end flex row">
      <span> <div v-if="storeWorks.invoiceWorks[payment.invoiceId]" v-for="subtotal in storeWorks.invoiceWorks[payment.invoiceId].subTotals" class="price center column">
      <div  class="col flex text-green-7">+<span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(payment.paid) }}</div>
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
    </div>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option  @click="handleClick()" ><q-icon size="25px" name="edit"/> Edit</ion-item-option>
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
import { ref,watch,getCurrentInstance,toRefs } from 'vue'
import { IonItem,IonActionSheet, IonItemOption, IonItemOptions, IonItemSliding, modalController, IonList } from '@ionic/vue';
import MobilePaymentModal from './MobilePaymentModal.vue'

const instance = getCurrentInstance()
const props = defineProps({
  payment:{
    type : Object,
    required:true
  },
  mobile:{
    type : Boolean,
    required:true
  },
  tableProps:{
    type : Object,
    required:true
  },
  mobile:{
    type : Boolean,
    required:true
  },
  pageRef:{
  type: Object,
  required: true
  },
})
const { pageRef } = toRefs(props);
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

watch(() => props.payment.deleted, (newValue) => {
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
        patient => patient.patientId === props.payment.patientId)
        storeInvoices.SET_PATIENT_INVOICES(props.payment.patientId,props.payment.invoiceId)
        if(!props.mobile){storePayments.TOGGLE_PAYMENT()
          console.log('not mobile')}
        else {instance.emit('openPaymentModal')}
    }
    async function deletePayment(docId) {
      storePayments.deletePayment(docId)
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

          isDeleted.value = true
          setTimeout(() => {
            storePayments.deletePayment(props.payment.paymentId)
          }, 280)

          // const slidingItem = document.querySelector('.payment')
          // slidingItem.closeOpened()
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
          const slidingItem = document.querySelector('.payment')
          slidingItem.closeOpened()
        }
        },
      ])

 function handleClick () {
    if (!props.mobile) {
      // Actions for non-mobile devices
      storePayments.editPayment = true;
      storePayments.TOGGLE_PAYMENT(props.payment.paymentId);
      console.log(storePayments.editPayment,'storePayments.editPayment = true;')
    } else {
      // Actions for mobile devices
      console.log('im on mobile')
      storePayments.TOGGLE_PAYMENT(props.payment.paymentId)
      openPaymentModal()
      storePayments.editPayment = true; // Example of different action
      // Add any other mobile-specific actions here
    }
  }

/*
  Modal
*/

const openPaymentModal = async () => {
    const modal = await modalController.create({
      component: MobilePaymentModal,
      presentingElement:pageRef.value.$el,

    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss(storePayments.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }

  };
</script>

<style lang="scss" scoped>
.payment {
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
.q-checkbox {
  box-sizing: border-box !important;
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
.ion-dark .payment {
  background-color: #1e3639;
  color: #ffffff;
  ion-item {
    --background: #1e3639;
  }
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

