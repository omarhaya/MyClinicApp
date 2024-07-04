<template>
  <q-item
    clickable
    v-ripple
    tag="a"
    target="_blank"
    @click="$router.push(link)"
    :active="active(link)"
     active-class="my-menu-link"

  >
    <q-item-section
      v-if="icon"
      avatar

    >

      <q-icon :name="icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label  >{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { defineComponent,ref } from 'vue'
import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
import { useRoute } from 'vue-router';

const route = useRoute();

const active = (link) => {
let result=null
  if (link==='/')  { result = (route.fullPath===link)}
  else result = route.fullPath.startsWith(link);
  return result
}
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
<style lang="scss">
 .q-drawer .q-item {
    color: white;
}
 .q-scrollarea {
  //background: linear-gradient(to left, black, #0c0f0cea);
  background:#008e91;
}
 .q-drawer .q-separator {
    background: #74685661;
}
.my-menu-link {
    color: #008e91 !important;
    background: white;
}
 </style>
