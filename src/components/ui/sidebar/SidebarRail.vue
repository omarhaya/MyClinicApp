<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from 'src/lib/utils'
import { useSidebar } from './utils'
import { useStoreSettings } from 'src/stores/storeSettings';
const storeSettings=useStoreSettings();
const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <button
    data-sidebar="rail"
    aria-label="Toggle Sidebar"
    :tabindex="-1"
    title="Toggle Sidebar"
    :class="cn(
      'sidebar absolute inset-y-0 z-20  w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-border  group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
      '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
      '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
      'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar',
      '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
      '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
      props.class,
    )"
    @click="storeSettings.appearance.miniState=!storeSettings.appearance.miniState"
  >
    <slot />
  </button>
</template>
<style lang="scss" scoped>
.sidebar:hover::after {
  content: '';
  position: absolute;
  left: 7px;
  right: 7px;
  border: 2px solid hsl(0, 10%, 92%); /* Hover border of 2px */
  z-index: 1; /* Place above other elements */
}
.dark .sidebar:hover::after {
  content: '';
  position: absolute;
  left: 7px;
  right: 7px;
  border: 2px solid #3a3a3a; /* Hover border of 2px */
  z-index: 1; /* Place above other elements */
}
</style>
