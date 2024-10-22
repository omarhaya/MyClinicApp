<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>
        {{ prefix }}{{ newValueFormatted }}{{ suffix }}
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <p>This value will grow over time:</p>
      <p>{{ prefix }}{{ newValueFormatted }}{{ suffix }}</p>
    </ion-card-content>
  </ion-card>
</template>

<script setup>
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue';
import { computed, ref, watch, onMounted } from 'vue';
import numeral from 'numeral';

// Props passed into the component
const props = defineProps({
  prefix: {
    type: String,
    default: null,
  },
  suffix: {
    type: String,
    default: null,
  },
  value: {
    type: Number,
    default: 100000000,
  },
  duration: {
    type: Number,
    default: 500, // duration in milliseconds
  },
});

// Local state to hold the growing value
const newValue = ref(0);

// Computed property to format the newValue
const newValueFormatted = computed(() =>
  newValue.value < 1000 ? newValue.value : numeral(newValue.value).format('0,0')
);

// Access the prop value as a computed property
const value = computed(() => props.value);

// The grow method to incrementally increase newValue
const grow = (m) => {
  const v = Math.ceil(newValue.value + m); // Increment the value

  if (v > value.value) {
    newValue.value = value.value; // Stop growing when it reaches the final value
    return false;
  }

  newValue.value = v; // Update the newValue with the incremented value

  // Continue growing the value every 25 milliseconds
  setTimeout(() => {
    grow(m);
  }, 25);
};

// Initializes the grow effect
const growInit = () => {
  newValue.value = 0; // Reset the value before starting the grow effect
  grow(props.value / (props.duration / 25)); // Divide the target value across the specified duration
};

// Watch for changes in the value and restart the grow effect
watch(value, () => {
  growInit();
});

// Start the grow effect when the component is mounted
onMounted(() => {
  growInit();
});
</script>

<style scoped>
/* Add any styles if needed */
</style>
