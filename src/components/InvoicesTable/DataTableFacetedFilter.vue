<script setup lang="ts">
import type { Column } from '@tanstack/vue-table'
import type { Component } from 'vue'
import { Badge } from 'src/lib/registry/new-york/ui/badge'
import { Button } from 'src/lib/registry/new-york/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from 'src/lib/registry/new-york/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/lib/registry/new-york/ui/popover'
import { Separator } from 'src/lib/registry/new-york/ui/separator'
import { cn } from 'src/lib/utils'
import { CheckIcon } from '@radix-icons/vue'
import { PlusCircledIcon } from '@radix-icons/vue'
import { computed, ref, watch } from 'vue'

interface DataTableFacetedFilter {
  column?: Column<any, any>
  title?: string
  options: {
    label: string
    value: string
    icon?: Component
  }[]
}

const props = defineProps<DataTableFacetedFilter>()

// Track selected values
const selectedValues = ref(new Set())

// Get unique values and their counts from the column data
const facets = computed(() => {
  if (!props.column) return new Map()

  const facetedValues = props.column.getFacetedUniqueValues()
  return facetedValues
})

// Watch for changes in column filter value
watch(() => props.column?.getFilterValue(), (newValue) => {
  if (Array.isArray(newValue)) {
    console.log('DataTableFacetedFilter',newValue)
    selectedValues.value = new Set(newValue)
  } else {
    selectedValues.value = new Set()
  }
}, { immediate: true })

// Handle selection of filter options
const handleSelect = (option) => {
  const isSelected = selectedValues.value.has(option.value)
  const newSelectedValues = new Set(selectedValues.value)

  if (isSelected) {
    newSelectedValues.delete(option.value)
  } else {
    newSelectedValues.add(option.value)
  }

  selectedValues.value = newSelectedValues
  const filterValues = Array.from(newSelectedValues)
  props.column?.setFilterValue(filterValues.length ? filterValues : undefined)
}

// Clear all filters
const clearFilters = () => {
  selectedValues.value = new Set()
  props.column?.setFilterValue(undefined)
}

// Add search input state
const searchQuery = ref('')

// Add watcher for searchQuery changes
watch(searchQuery, (newValue) => {
  console.log('searchQuery changed:', newValue)
}, { immediate: true })

// Add computed property for filtered options
const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  console.log('Computing filtered options with query:', query)
  if (!query) return props.options

  return props.options.filter(option =>
    option.label.toLowerCase().includes(query) ||
    option.value.toLowerCase().includes(query)
  )
})

// Add method to handle input changes
const handleInputChange = (event) => {
  searchQuery.value = event.target.value
  console.log('Input changed:', searchQuery.value)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 border-dashed button-custom">
        <PlusCircledIcon class="mr-2 h-4 w-4" />
        {{ title }}
        <template v-if="selectedValues.size > 0">
          <Separator orientation="vertical" class="mx-2 h-4 !bg-gray-300 dark:!bg-border" />
          <div class="space-x-1 lg:flex">
            <Badge
              v-if="selectedValues.size > 2"
              variant="secondary"
              class="rounded-sm px-1 border-none badge-custom font-normal"
            >
              {{ selectedValues.size }} selected
            </Badge>
            <template v-else>
              <Badge
                v-for="option in options.filter((option) => selectedValues.has(option.value))"
                :key="option.value"
                variant="secondary"
                class="rounded-sm px-1 border-none badge-custom font-normal"
              >
                {{ option.label }}
              </Badge>
            </template>
          </div>
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0" align="start">
      <Command>
        <CommandInput
          :value="searchQuery"
          @input="handleInputChange"
          :placeholder="`Filter by ${title}`"
          class="command-input"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="option in filteredOptions"
              :key="option.value"
              :value="option"
              @select="() => handleSelect(option)"
            >
              <div
                :class="cn(
                  'mr-2 flex items-center justify-center rounded-sm border border-primary',
                  selectedValues.has(option.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'opacity-100 [&_svg]:invisible',
                )"
              >
                <CheckIcon :class="cn('h-4 w-4')" />
              </div>
              <component
                :is="option.icon"
                v-if="option.icon"
                class="mr-2 h-4 w-4 text-muted-foreground"
              />
              <span>{{ option.label }}</span>
              <span
                v-if="facets.get(option.value)"
                class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs"
              >
                {{ facets.get(option.value) }}
              </span>
            </CommandItem>
          </CommandGroup>
          <template v-if="selectedValues.size > 0">
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                class="justify-center text-center"
                @select="clearFilters"
              >
                Clear filters
              </CommandItem>
            </CommandGroup>
          </template>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<style lang="scss" scoped>
.button-custom {
  &:hover {
    background-color: #f4f4f5 !important;
  }
}
.dark .button-custom {
  &:hover {
    background-color: #27272a !important;
  }
}
.badge-custom {
  background-color: #f4f4f5 !important;
  color: #09090b !important;
}
.dark .badge-custom {
  background-color: #27272a !important;
  color: #f3f4f6 !important;
}

:deep(.command-input) {
  width: 100% !important;
  display: flex !important;
  flex: 1 !important;
  cursor: text !important;

  input {
    width: 100% !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    cursor: text !important;
  }
}

:deep(.cmdk-input) {
  cursor: text !important;
}

:deep(.cmdk-input-wrapper) {
  cursor: text !important;
}
</style>
