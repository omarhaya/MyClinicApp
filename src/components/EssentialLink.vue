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

      <q-icon v-if="icon=='fa-solid fa-vault'" :class="mobile ? 'treasury-icon-mobile' : 'treasury-icon-desktop'" size="20px" :name="icon"/>
      <q-icon v-else :name="icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label  >{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { defineComponent,computed } from 'vue'
import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
import { useRoute } from 'vue-router';
import treasury from 'src/assets/vault-solid.svg';
import { useQuasar } from 'quasar'
import { Platform } from 'quasar';

const myIcons = {
  'treasury': 'img:/src/assets/vault-solid.svg',
}

// ...
const $q = useQuasar()

$q.iconMapFn = (iconName) => {
  const icon = myIcons[iconName]
  if (icon !== undefined) {
    return { icon }
  }
}
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


/*
 Mobile
*/
const   mobile=computed(()=>{
          if (Platform.is.desktop){
            return false
          }
          if (Platform.is.mobile){
        return true
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
.treasury-icon-desktop {
  margin-left :4px;
}
.treasury-icon-mobile
{
  margin-left :0px;
}
 </style>
