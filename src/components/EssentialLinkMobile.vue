<template>
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push(link)"
    :active="link === $route.fullPath"
    :icon="icon"
    active-class="my-menu-link2"
    class="my-menu-link-inactive"
  >

  <q-tab :ripple="false" :name="title" :icon="icon" :label="title" />


  </q-item>
</template>

<script setup>
import { ref } from 'vue'

/*
   props
*/
   const props = defineProps({
 title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '/'
    },

    icon: {
      type: String,
      default: ''
    }
   })




</script>
<style lang="sass">

.my-menu-link2 .q-item
  color: primary !important

.my-menu-link-inactive
  padding-top: 0px
  padding-bottom: 0px
 </style>
