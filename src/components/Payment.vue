<template>

  <ion-item-sliding class="payment" :class="{ 'fade-out': isDeleted }" :style="{ borderLeft: `4px solid ${payment.color || 'grey'}` }">

    <!-- <ion-item-options side="start">
      <ion-item-option expandable @click="newPayment" color="success"><q-icon size="25px" name="payment"/>Pay</ion-item-option>
    </ion-item-options> -->

    <ion-item v-if="payment.patientName" lines="none" :button="true" @click="$router.push(`/Invoices/${payment.invoiceId}`)" detail="false" class="sliding-item" >
      <q-checkbox v-if="editActive"  :model-value="tableProps.selected" @update:model-value="(val, evt) => { Object.getOwnPropertyDescriptor(tableProps, 'selected').set(val, evt) }" />
      <div class="left flex q-pt-xs q-pb-xs ">
    <span class="tracking-number column"><span class="col">#{{ payment.invoiceId }}</span>
    <span class="col row" >
      <span class="row" v-if="storeWorks.invoiceWorks[payment.invoiceId]" v-for="work in storeWorks.invoiceWorks[payment.invoiceId]">
        <GrowingLinearProgress class="col" :color="work.color" :value="percentageValue(work).value"/>
      </span>
      <span class="row" v-else >
        <GrowingLinearProgress class="col" :color="'grey'" :value="0"/>
      </span>

<!-- <GrowingLinearProgress class="col" :color="'green'" :value="percentageValue"/>
<GrowingLinearProgress class="col" :value="percentageValue"/> -->
    </span>
    </span>
    <span>

      <q-avatar v-if="!isArabic(payment.patientName)" class="q-mr-xs avatar-name" size="35px" font-size="16px" color="green-3" text-color="white"> {{getInitials( payment.patientName) }} </q-avatar>
            <q-avatar v-if="isArabic(payment.patientName)" class="q-mr-xs avatar-person" font-size="42px" size="35px" color="green-3" text-color="white" icon="person"/>
      <span class="text-bold" > {{ payment.patientName }}</span></span>

   </div>
   <div class="right justify-end flex row">
     <div v-if="storeWorks.invoiceWorks[payment.invoiceId]" v-for="subtotal in storeWorks.invoiceWorks[payment.invoiceId].subTotals" class="price center row">
    <div  class=" flex text-bold text-green-7">+<span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(payment.paid) }}</div>
     <!-- <span class="col"></span> -->


   </div>
   <div v-else  class="price center column">
    <div  class="col flex text-green-7">  <q-skeleton animation="blink" type="text" width="100px" /></div>

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

    <!-- <q-circular-progress

show-value
font-size="15px"
:value="percentageValue"
color="'red'"
track-color="grey-3"
size="40px"
:thickness="0.15"
rounded
>
{{ percentageValue }}
</q-circular-progress> -->



<span v-if="storeWorks.invoiceWorks[payment.invoiceId]" class="dateFormat">{{ formatDateTime }}</span>
<span v-else class="dateFormat">  <q-skeleton animation="blink" type="text" class="text-caption" width="100px" /></span>

  </div>
    </ion-item>
    <ion-item-options side="end">
      <ion-item-option  @click="handleClick()" ><q-icon size="25px" name="edit"/> Edit</ion-item-option>
      <ion-item-option @click="isOpen=true" expandable color="danger"><q-icon size="25px" name="delete"/>Delete</ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
  <ion-action-sheet @didDismiss="isOpen=false" :is-open="isOpen"  header="Delete The Following Transaction?" :buttons="actionSheetButtons"/>
</template>

<script setup>
import { useStorePayments } from 'src/stores/storePayments'
import { useStoreWorks } from 'src/stores/storeWorks'
import { useStorePatients } from 'src/stores/storePatients'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { ref,watch,getCurrentInstance,toRefs,computed } from 'vue'
import { IonItem,IonActionSheet, IonItemOption, IonItemOptions, IonItemSliding, modalController, IonList } from '@ionic/vue';
import MobilePaymentModal from './MobilePaymentModal.vue'
import dayjs from 'dayjs'
import GrowingCircularProgress from './GrowingCircularProgress.vue'
import GrowingLinearProgress from './GrowingLinearProgress.vue'
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
const editActive=ref(false)
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
const formatDateTime = computed(() => {
  return dayjs.unix(props.payment.dateUnix / 1000).format('MM/DD/YYYY, h:mm A');
});

const percentageValue  = (work) => computed(() => {
//  if (storeWorks.invoiceWorks[props.payment.invoiceId]) {
  console.log(work.allpaid,'storeWorks.invoiceWorks[props.invoiceId].overallPercentage')
  return work.allPaid/work.price*100

})
const progressColor = computed (()=>{
 if (storeWorks.invoiceWorks[props.payment.invoiceId]) {
  console.log(storeWorks.invoiceWorks[props.payment.invoiceId].overallPercentage,'storeWorks.invoiceWorks[props.invoiceId].overallPercentage')
  return storeWorks.invoiceWorks[props.payment.invoiceId].overallPercentage==100?'teal-4':'orange'
 }

})

</script>

<style lang="scss" scoped>
.payment {

.dateFormat {
  color: grey;
  font-size: clamp(10px, 2vw + 6px, 14px)!important; /* Dynamically scale with container size */
}
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
    font-size: clamp(18px, 2vw + 18px, 20px)!important; /* Dynamically scale with container size */
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
