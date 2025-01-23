<script setup lang="ts">
import type { PrimitiveProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from 'src/lib/utils'
import { Primitive } from 'radix-vue'

const props = defineProps<PrimitiveProps & {
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Primitive
    data-sidebar="group-label"
    :as="as"
    :as-child="asChild"
    :class="cn(
      'duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-foreground/70 font-color outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 ',
      'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
      props.class)"
  >
    <slot />
  </Primitive>
</template>
<style scoped>
.font-color {
  color:#3f3f46b3 !important;
}
.dark .font-color {
  color:#d4d4deb3 !important
}
</style>
