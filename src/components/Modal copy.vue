<template>
  <ion-page ref="page">
    <ion-header>
      <ion-toolbar>
        <ion-title>App</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button id="open-modal" expand="block">Open</ion-button>

      <ion-modal ref="modal" trigger="open-modal" :can-dismiss="canDismiss" :presenting-element="presentingElement">
        <ion-header>
          <ion-toolbar>
            <ion-title>Modal</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="dismiss()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <p class="ion-padding-horizontal">You must accept the terms and conditions to close this modal.</p>
          <ion-item>
            <ion-checkbox id="terms" @ionChange="onTermsChanged" :checked="canDismiss">
              <div class="ion-text-wrap">Do you accept the terms and conditions?</div>
            </ion-checkbox>
          </ion-item>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>
<!--
<script setup lang="ts">
import { ref,onMounted,onUnmounted } from 'vue'
  import {
    CheckboxCustomEvent,
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonItem,
    IonCheckbox,
    IonPage,
  } from '@ionic/vue';

  const canDismiss = ref(false);
  const presentingElement = ref(null);
  const pageRef = ref(null);
  const modal = ref(null);

  const dismiss = () => {
    pageRef.value.modal.value.dismiss();
  };

  const onTermsChanged = (ev: CheckboxCustomEvent) => {
    canDismiss.value = ev.detail.checked;
  };

  onMounted(() => {
    pageRef.value = ref
    // presentingElement.value = pageRef.value;
    presentingElement.value = pageRef.value.page;
  });

  onUnmounted(() => {
    pageRef.value = null; // Reset pageRef on component unmount
  });
</script> -->
<!-- <script >
import { IonButtons, IonButton, IonModal, IonHeader, IonContent, IonToolbar, IonTitle, IonItem, IonCheckbox, IonPage } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonItem,
    IonCheckbox,
    IonPage,
  },
  data() {
    return {
      canDismiss: false,
      presentingElement: undefined,
    };
  },
  methods: {
    dismiss() {
      this.$refs.modal.$el.dismiss();
    },
    onTermsChanged(ev) {
      this.canDismiss = ev.detail.checked;
    },
  },
  mounted() {
    this.presentingElement = this.$refs.page.$el;
  },
});

</script> -->
<script setup>
import { ref,onMounted } from 'vue';
import { IonButtons, IonButton, IonModal, IonHeader, IonContent, IonToolbar, IonTitle, IonItem, IonCheckbox, IonPage } from '@ionic/vue';

const canDismiss = ref(false);
let presentingElement = undefined;

const dismiss = () => {
  modal.value.dismiss();
};

const onTermsChanged = (ev) => {
  canDismiss.value = ev.detail.checked;
};


onMounted(() => {
  presentingElement = page.value.$el;
  })

const page = ref();
const modal = ref();

</script>
