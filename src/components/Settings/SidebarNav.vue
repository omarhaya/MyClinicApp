<script setup lang="ts">
import { Button } from 'src/lib/registry/new-york/ui/button'
import { cn } from 'src/lib/utils'
import { useRoute, useRouter } from 'vue-router'

interface Item {
  title: string
  href: string
  component?: string
}

const route = useRoute()
const router = useRouter()

const sidebarNavItems: Item[] = [
  {
    title: 'Profile',
    href: '/settings',
  },
  {
    title: 'Account',
    href: '/settings/account',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
  },
  {
    title: 'Display',
    href: '/settings/display',
  },
]

</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Button
      v-for="item in sidebarNavItems"
      :key="item.title"
      variant="ghost"
      @click="router.push(item.href)"
      :class="cn(
        'w-full text-left justify-start cursor-pointer',
        route.path === item.href && 'dark:!bg-muted bg-grey-3  hover:bg-muted',
      )"
    >
      {{ item.title }}
    </Button>
  </nav>

</template>
