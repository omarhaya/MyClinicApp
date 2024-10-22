<template>
 <ion-page ref="page">
  <!-- <ion-header :translucent="true">
      <ion-toolbar>
       <ion-header :translucent="true">
      <ion-toolbar>

      </ion-toolbar>
    </ion-header>
      </ion-toolbar>
    </ion-header> -->
    <ion-content>
    <CardWidget :prefix="'IQD'" class="q-ma-xl q-pa-md" :value="400000"/>     <CardWidget :value="400000"/>     <CardWidget :value="400000"/>
  </ion-content>
  </ion-page>
</template>

<script setup>
import {IonList,
   IonInfiniteScroll,
   IonInfiniteScrollContent,IonPage,IonModal,IonCheckbox,IonItem, IonHeader, IonToolbar, IonTitle, IonContent ,IonButtons, IonButton,modalController} from '@ionic/vue';
import {ref,reactive,computed,onMounted,watch} from 'vue'
import { useRouter } from 'vue-router'
import CardWidget from 'src/components/CardWidget.vue';
const router=useRouter()
// onMounted(() => {
//   router.push('/Calendar')

//       })

</script>
