<template>
  <ion-card>
    <div>
      <ion-card-header>
        <ion-card-title v-if="totals.length>1" class="text-h6">Totals</ion-card-title>
        <ion-card-title v-else class="text-h6">{{ label }}</ion-card-title>
      </ion-card-header>
    </div>
    <div>
      <ion-card-content class="text-green-7">
        <template v-if="totals.length">
          <div v-for="(total, index) in totals" :key="index">
            <h1 class="inner-text">
              {{ prefix }}<span class="currency">{{ total.currency }}</span>
              <GrowingNumeral :value="(total.totalPaid)"/>
            </h1>
          </div>
        </template>

        <template v-else>
          <h1 class="inner-text">
            <span v-if="newValue > 0">+</span>
            <span class="currency">{{ prefix }}</span>
            <GrowingNumeral :prefix="prefix" :suffix="suffix" :value="value"/>
            {{ suffix }}
          </h1>
        </template>
      </ion-card-content>
    </div>
  </ion-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import numeral from 'numeral';
import GrowingNumeral from './GrowingNumeral.vue';

const props = defineProps({
  prefix: { type: String, default: null },
  suffix: { type: String, default: null },
  value: { type: Number, default: 100000000 },
  totals: { type: Array, default: () => [] },
  duration: { type: Number, default: 500 },
  label: { type: String, default: 'Total' },
});
</script>

<style scoped>
.inner-text {
  font-weight: 600 !important;
  font-size: clamp(1rem, 2vw + 0.7rem, 2.5rem); /* Dynamically scale with container size */
}

.currency {
  font-size: clamp(0.8rem, 1.5vw + 0.8rem, 1.5rem); /* Adjust currency size */
}
</style>
