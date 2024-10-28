<template>
     <!-- <Loading v-show="storeInvoices.loadingModal" /> -->
    <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button :disabled="storeAppointments.loading" color="medium" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title v-if="!storeAppointments.editAppointment">Add Appointment</ion-title>
      <ion-title v-else>Edit Appointment</ion-title>
      <ion-buttons slot="end">
        <ion-button v-if="!storeAppointments.loading&&!storeAppointments.editAppointment" @click="confirm" :strong="true">Add</ion-button>
        <ion-button :disabled="matchedData" v-else-if="!storeAppointments.loading&storeAppointments.editAppointment" @click="confirm" :strong="true">Update</ion-button>
        <ion-spinner v-else></ion-spinner>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
 <appointmentModal
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
import {ref,watchEffect,computed,reactive,toRaw} from 'vue'
import Loading from './Loading.vue'
import InvoiceModal from './InvoiceModal.vue';
import appointmentModal from './appointmentModal.vue';
import { IonButtons, IonButton, IonSpinner, IonHeader, IonContent, IonToolbar, IonTitle, IonItem, IonCheckbox, IonPage, modalController, } from '@ionic/vue';
import { useStoreInvoices } from 'src/stores/storeInvoices';
import { useStoreAppointments } from 'src/stores/storeAppointments';
import { useStoreAuth } from 'src/stores/storeAuth';
import dayjs from 'dayjs';

const storeInvoices=useStoreInvoices()
const storeAuth= useStoreAuth()
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
 const matchedData = computed (()=>{
  const originalAppointment =reactive({
    appointmentId:props.appointment.extendedProps.appointmentId,
    content:storeAppointments.appointment.content,
    doctor: {...storeAuth.doctors.find(doc => doc.doctorId === props.appointment._def.resourceIds[0])},
    endDate:storeAppointments.appointment.endDate,
    endTime:dayjs(props.appointment.endStr).format('HH:mm:ss'),
    sendWhatsAppMessage:props.appointment.extendedProps.sendWhatsAppMessage,
    sendWhatsAppReminder:props.appointment.extendedProps.sendWhatsAppMessage,
    startDate: dayjs(props.appointment.startStr).format('YYYY-MM-DD'),
    startTime:dayjs(props.appointment.startStr).format('HH:mm:ss'),
    status:props.appointment.extendedProps.status,
    title:{
    ...props.appointment.extendedProps.patientDetails
  },
  })
  return  isEqual(originalAppointment, storeAppointments.appointment);
 })

 // Deep equality check function
const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
const cancel = () =>{modalController.dismiss(null, 'cancel');storeAppointments.modal=false;console.log(storeAppointments.modal,'storeAppointments.modal')}
async function confirm  () {
 await appointmentModalRef.value.submitAppointmentFormMobile()
}
const appointmentModalRef = ref(null);
watchEffect(() => {
  console.log(props.appointment, 'Reactive Event');
  // Perform any updates based on changes to props.event.value
});
</script>
<style>
.invoiceModal {
  box-sizing: border-box;
}

</style>
