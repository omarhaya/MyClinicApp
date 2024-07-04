<template>
  <ion-page>
      <!-- <ion-toolbar :style="{ 'transform': `translateY(${storeSettings.toolbarHidden ? '-100%' : '0'})`, 'transition': 'transform 0.5s ease-in-out','position': 'absolute', 'top': '0', 'left': '0', 'right': '0', 'z-index': '2', 'background': 'lightgray' }" >
        <ion-title>
          Scrollable Toolbar
        </ion-title>
      </ion-toolbar> -->

    <ion-content scrollEvents @ionScroll="handleScroll">
      <!-- Add your content here -->

      <ion-list>
        <ion-item v-for="item in items" :key="item">
          {{ item }}
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem } from '@ionic/vue';
import { useStoreSettings } from 'src/stores/storeSettings';


const storeSettings=useStoreSettings()
const items = ref(Array.from({ length: 50 }, (_, i) => i + 1));
const lastY =ref(0);

const handleScroll = (event) => {
  const currentY = event.detail.scrollTop;
  const scrollDirection = currentY > lastY.value&&currentY>50 ? 'down' : 'up';
  console.log(event.detail)
   // Check if at the bottom of the page
   const content = event.target;
  // Check if close to the end of the scroll
  const threshold = 1; // Adjust this threshold as needed
  const isCloseToEnd = content.scrollHeight - (currentY + content.clientHeight) <= threshold;

  if (isCloseToEnd) {
    // Do something when close to the end from the bottom
    console.log("Close to the end from the bottom");
  }

  if (scrollDirection === 'down' && !storeSettings.toolbarHidden) {
    // Scrolling down, hide toolbar
    storeSettings.toolbarHidden = true;

  } else if (scrollDirection === 'up' && storeSettings.toolbarHidden) {
    // Scrolling up, show toolbar
    storeSettings.toolbarHidden = false;
  }
  lastY.value = currentY
}

</script>
<style scoped>
.ion-toolbar {
  transition: opacity 0.5s ease-in-out;
}
</style>
