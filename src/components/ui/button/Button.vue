<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from 'src/lib/utils';
import { type ButtonVariants, buttonVariants } from '.';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  as?: string; // To allow the `as` prop
  asChild?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button', // Default to a button element
});
</script>

<template>
  <component
    :is="props.as"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </component>
</template>
