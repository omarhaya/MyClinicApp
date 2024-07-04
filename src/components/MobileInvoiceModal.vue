<template>
     <!-- <Loading v-show="storeInvoices.loadingModal" /> -->
    <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button :disabled="storeInvoices.loadingModal" color="medium" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title>Add Invoice</ion-title>
      <ion-buttons slot="end">
        <ion-button v-if="!storeInvoices.loadingModal" @click="confirm" :strong="true">Add</ion-button>
        <ion-spinner v-else></ion-spinner>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
 <InvoiceModal class="invoiceModal" ref="invoiceModalRef"/>
  </ion-content>
</template>
<script setup>
import {ref} from 'vue'
import Loading from './Loading.vue'
import InvoiceModal from './InvoiceModal.vue';
import { IonButtons, IonButton, IonSpinner, IonHeader, IonContent, IonToolbar, IonTitle, IonItem, IonCheckbox, IonPage, modalController, } from '@ionic/vue';
import { useStoreInvoices } from 'src/stores/storeInvoices';
const storeInvoices=useStoreInvoices()
const cancel = () => modalController.dismiss(null, 'cancel');
async function confirm  () {
 await invoiceModalRef.value.submitFormMobile()
}
const invoiceModalRef = ref(null);

</script>
<style>
.invoiceModal {
  box-sizing: border-box;
}

</style>
