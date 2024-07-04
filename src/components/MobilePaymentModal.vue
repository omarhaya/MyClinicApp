<template>
  <!-- <Loading v-show="storeInvoices.loadingModal" /> -->
 <ion-header>
 <ion-toolbar>
   <ion-buttons slot="start">
     <ion-button :disabled="storePayments.loadingModal" color="medium" @click="cancel">Cancel</ion-button>
   </ion-buttons>
   <ion-title>Add Payment
   </ion-title>
   <ion-buttons slot="end">
     <ion-button v-if="!storePayments.loadingModal" @click="confirm" :strong="true">Pay</ion-button>
     <ion-spinner v-else></ion-spinner>
   </ion-buttons>
 </ion-toolbar>
</ion-header>
<ion-content>
<PaymentModal class="PaymentModal" ref="paymentModalRef"/>
</ion-content>
</template>
<script setup>
import {ref} from 'vue'
import Loading from './Loading.vue'
import InvoiceModal from './InvoiceModal.vue';
import PaymentModal from './PaymentModal.vue'
import { IonButtons, IonButton, IonSpinner, IonHeader, IonContent, IonToolbar, IonTitle, IonItem, IonCheckbox, IonPage, modalController, } from '@ionic/vue';
import { useStorePayments } from 'src/stores/storePayments';
const storePayments=useStorePayments()
const cancel = () => modalController.dismiss(null, 'cancel');
async function confirm  () {
await paymentModalRef.value.submitFormMobile()
}
const paymentModalRef = ref(null)

</script>
<style>
.PaymentModal {
box-sizing: border-box;
}

</style>
