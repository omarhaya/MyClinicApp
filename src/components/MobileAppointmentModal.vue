<template>
     <!-- <Loading v-show="storeInvoices.loadingModal" /> -->
    <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button :disabled="storeAppointments.loading" color="medium" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title>Add Invoice</ion-title>
      <ion-buttons slot="end">
        <ion-button v-if="!storeAppointments.loading" @click="confirm" :strong="true">Add</ion-button>
        <ion-spinner v-else></ion-spinner>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
 <ModalAddAppointment
     :startTime="appointment.eventTimeStart"
     :endTime="appointment.eventTimeEnd"
     :doctorId="appointment.doctorId"
     :startDate="appointment.eventDateStart"
     :endDate="appointment.eventDateEnd"
     class="invoiceModal"
     ref="appointmentModalRef"
     />
  </ion-content>
</template>
<script setup>
import {ref} from 'vue'
import Loading from './Loading.vue'
import InvoiceModal from './InvoiceModal.vue';
import ModalAddAppointment from './PaymentsAndAppointments/ModalAddAppointment.vue';
import { IonButtons, IonButton, IonSpinner, IonHeader, IonContent, IonToolbar, IonTitle, IonItem, IonCheckbox, IonPage, modalController, } from '@ionic/vue';
import { useStoreInvoices } from 'src/stores/storeInvoices';
import { useStoreAppointments } from 'src/stores/storeAppointments';
const storeInvoices=useStoreInvoices()
const storeAppointments=useStoreAppointments()
/*
   props
*/
const props = defineProps({

modelValue:{
  type:Boolean,
  default:false
},
appointment:{
  type: Object,
},
})

const cancel = () =>{modalController.dismiss(null, 'cancel');storeAppointments.modal=false;console.log(storeAppointments.modal,'storeAppointments.modal')}
async function confirm  () {
 await appointmentModalRef.value.submitAppointmentFormMobile()
}
const appointmentModalRef = ref(null);

</script>
<style>
.invoiceModal {
  box-sizing: border-box;
}

</style>
