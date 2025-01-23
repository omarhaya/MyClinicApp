<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from 'src/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <ul
    data-sidebar="menu-badge"
    :class="cn(
      'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 sidebar px-2.5 py-0.5',
      'group-data-[collapsible=icon]:hidden',
      props.class,
    )"
  >
    <slot />
  </ul>
</template>
<style lang="scss" scoped>
.sidebar {
  border-left: solid;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
.dark .sidebar {
  border-left: solid;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>
