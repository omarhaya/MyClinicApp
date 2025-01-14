<script setup lang="ts">
import { Button } from 'src/lib/registry/new-york/ui/button'
import { cn } from 'src/lib/utils'
import { useRoute } from 'vue-router'

interface Item {
  title: string
  href: string
}

const $route = useRoute()

const sidebarNavItems: Item[] = [
  {
    title: 'Profile',
    href: '/Pages',
  },
  {
    title: 'Account',
    href: '/Pages/account',
  },
  {
    title: 'Appearance',
    href: '/Pages/appearance',
  },
  {
    title: 'Notifications',
    href: '/Pages/notifications',
  },
  {
    title: 'Display',
    href: '/Pages/display',
  },
]
</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Button
      v-for="item in sidebarNavItems"
      :key="item.title"
      as="a"
      :href="item.href"
      variant="ghost"
      :class="cn(
        'w-full text-left justify-start',
        $route.path === `${item.href}.html` && 'bg-muted hover:bg-muted',
      )"
    >
      {{ item.title }}
    </Button>
  </nav>
</template>
