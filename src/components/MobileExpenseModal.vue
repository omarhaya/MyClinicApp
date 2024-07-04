<template>
  <!-- <Loading v-show="storeInvoices.loadingModal" /> -->
 <ion-header>
 <ion-toolbar>
   <ion-buttons slot="start">
     <ion-button :disabled="storeExpenses.loadingModal" color="medium" @click="cancel">Cancel</ion-button>
   </ion-buttons>
   <ion-title>Add Expense
   </ion-title>
   <ion-buttons slot="end">
     <ion-button v-if="!storeExpenses.loadingModal" @click="confirm" :strong="true">Pay</ion-button>
     <ion-spinner v-else></ion-spinner>
   </ion-buttons>
 </ion-toolbar>
</ion-header>
<ion-content>
<ExpenseModal class="ExpenseModal" ref="expenseModalRef"/>
</ion-content>
</template>
<script setup>
import {ref} from 'vue'
import Loading from './Loading.vue'
import InvoiceModal from './InvoiceModal.vue';
import ExpenseModal from './ExpenseModal.vue'
import { IonButtons, IonButton, IonSpinner, IonHeader, IonContent, IonToolbar, IonTitle, IonItem, IonCheckbox, IonPage, modalController, } from '@ionic/vue';
import { useStoreExpenses } from 'src/stores/storeExpenses';
const storeExpenses=useStoreExpenses()
const cancel = () => modalController.dismiss(null, 'cancel');
async function confirm  () {
await expenseModalRef.value.submitFormMobile()
}
const expenseModalRef = ref(null)

</script>
<style>
.ExpenseModal {
box-sizing: border-box;
}

</style>
