<template>
  <ion-page ref="page">
    <ion-header>
      <ion-toolbar>
        <ion-title>App</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button id="open-modal" expand="block" @click="openModal">Open</ion-button>

      <ion-modal ref="modal" trigger="open-modal" :can-dismiss="canDismiss" :presenting-element="presentingElement">
        <ion-header>
          <ion-toolbar>
            <ion-title>Modal</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="dismiss">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content >
     <invoice-modal/>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  actionSheetController,
} from '@ionic/vue';
import InvoiceModal from 'src/components/InvoiceModal.vue';
import { ref, onMounted } from 'vue';

const modal = ref(null);
const page = ref(null);
const presentingElement = ref(undefined);

const dismiss = () => {
  if (modal.value) {
    modal.value.$el.dismiss()
  }
};

const canDismiss = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Are you sure?',
    buttons: [
      {
        text: 'Yes',
        role: 'confirm',
      },
      {
        text: 'No',
        role: 'cancel',
      },
    ],
  });

  actionSheet.present();
  const { role } = await actionSheet.onWillDismiss();
  return role === 'confirm';
};

const openModal = () => {
  if (modal.value) {
    // modal.value.show()
  }
};

onMounted(() => {
  presentingElement.value = page.value?.$el;
});

</script>
