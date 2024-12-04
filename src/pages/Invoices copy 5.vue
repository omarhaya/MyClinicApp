<template>
  <ion-page>
    <ion-content>
      <!-- Ensure scroller class properly styled -->
      <RecycleScroller
        class="scroller"
        :items="list"
        :item-size="56"
        :items-limit="list.length + 1000"
        :key-field="'id'"
      >
        <template #default="{ item }">
          <ion-item>
            <ion-avatar slot="start">
              <img src="https://picsum.photos/seed/picsum/40/40" />
            </ion-avatar>
            <ion-label>{{ item.name }}</ion-label>
          </ion-item>
        </template>
      </RecycleScroller>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import {
  IonAvatar,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/vue";
import { RecycleScroller } from "vue-virtual-scroller";

export default defineComponent({
  components: {
    IonAvatar,
    IonContent,
    IonItem,
    IonLabel,
    IonPage,
    RecycleScroller,
  },
  setup() {
    // Create a dataset with unique IDs and names
    const list = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));

    return { list };
  },
});
</script>

<style scoped>
/* Ensure proper styling for scroller and Ionic components */
.scroller {
  height: 100%; /* Full height for the scroller */
  overflow: auto; /* Allow scrolling */
  position: relative; /* Necessary for virtual scroller calculations */
}

ion-content {
  display: flex; /* Flex container for content scaling */
  flex-direction: column;
}

ion-list {
  flex: 1; /* Ensure the list scales properly */
  margin: 0; /* Remove default Ionic spacing */
}
</style>
