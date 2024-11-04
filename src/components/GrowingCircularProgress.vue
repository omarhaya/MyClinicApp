<template>
  <q-circular-progress
    show-value
    font-size="15px"
    :value="newValue"
    :color="color"
    track-color="grey-3"
    size="90px"
    :thickness="0.15"
    rounded
  >
  <span v-if="value<100">
     {{newValue+'%'}}</span>
     <q-icon v-else name="done" size="35px" color="teal-4"> </q-icon>
  </q-circular-progress>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';

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
    default: 0,
  },
  duration: {
    type: Number,
    default: 500, // duration in milliseconds
  },
  label: {
    type: String,
    default: 'Total',
  },
  color : {
    type: String,
    default: 'orange',
  }
});

// Local state to hold the growing value
const newValue = ref(0);

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
