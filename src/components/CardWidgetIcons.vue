<template>
  <ion-card class="card-container">
    <div class="content-wrapper">
      <!-- Left Content -->
      <div class="left-content">
        <ion-card-header>
          <ion-card-title v-if="totals.length > 1" class="text-h6">
            Totals
          </ion-card-title>
          <ion-card-title v-else class="text-h6">{{ label }}</ion-card-title>
        </ion-card-header>
        <ion-card-content class="text-green-7">
          <template v-if="totals.length">
            <div v-for="(total, index) in totals" :key="index">
              <h1 :class="['inner-text', fontSizeClass(total.totalPaid)]">
                {{ prefix }}<span>{{ total.currency + ' ' }}</span>
                <GrowingNumeral :value="total.totalPaid" />
              </h1>
            </div>
          </template>

          <template v-else>
            <h1 :class="['inner-text', fontSizeClass(value)]">
              <span v-if="prefix&&newValue > 0">+</span>
              <span :class="['left currency', fontSizeClass(value)]">{{ prefix }}</span>
              <GrowingNumeral :prefix="prefix" :suffix="suffix" :value="value" />
              {{ suffix }}
            </h1>
          </template>
        </ion-card-content>
      </div>

      <!-- Icon in a Square -->
      <div class="right-icon">
        <div class="icon-square">
          <ion-icon class="icon-inside-square" :name="icon"></ion-icon>
        </div>
      </div>
    </div>
  </ion-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import GrowingNumeral from './GrowingNumeral.vue';
import { addIcons } from 'ionicons';
import { analyticsOutline, person, cash, card, calendar, newspaper } from 'ionicons/icons';

addIcons({
  'analytics-outline': analyticsOutline,
  'person': person,
  'cash': cash,
  'card': card,
  'calendar': calendar,
  'newspaper': newspaper,
});

const props = defineProps({
  prefix: { type: String, default: null },
  suffix: { type: String, default: null },
  value: { type: Number, default: 100000 },
  totals: { type: Array, default: () => [] },
  duration: { type: Number, default: 500 },
  label: { type: String, default: 'Total' },
  icon: { type: String, default: null },
});

// Computed property for font size class
const fontSizeClass = (totalPaid) => {
  return props.prefix&&totalPaid > 99999 ? 'small-font' : 'normal-font';
};
</script>

<style scoped>
.card-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.left-content {
  flex: 1;
}

.right-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30%;
}

.text-h6 {
  font-size: 15px !important;
}

.icon-square {
  width: 4rem; /* Square size */
  height: 4rem;
  background-color: var(--ion-color-primary); /* Primary color */
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem; /* Slight rounding for aesthetic */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); /* Shadow for depth */
}

.icon-inside-square {
  font-size: 2rem; /* Slightly smaller icon */
  color: white; /* White color for contrast */
}

.inner-text {
  font-weight: 600 !important;
  font-size: clamp(1rem, 2vw + 0.7rem, 2rem); /* Dynamically scale with container size */
}

.currency {
  font-size: clamp(0.8rem, 1.5vw + 0.8rem, 1.5rem); /* Adjust currency size */
}

.small-font {
  font-size: clamp(1rem, 2vw + 0.7rem, 1.2rem); ;  /* Smaller font for values greater than 6 digits */
}

.normal-font {
  font-size: clamp(1rem, 2vw + 0.7rem, 2rem);  /* Default font size for smaller values */
}
</style>
