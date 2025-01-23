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
    // color: black;
}
 .q-scrollarea {
  //background: linear-gradient(to left, black, #0c0f0cea);

}
 .q-drawer .q-separator {
    background: #74685661;
}
.my-menu-link {
  color: #008e91 !important;
  position: relative; /* Needed for positioning the pseudo-element */
}

.my-menu-link::after {
  content: '';
  position: absolute;
  right: 0;
  top: 7px; /* 1px space from the top */
  bottom: 7px; /* 1px space from the bottom */
  width: 3px; /* Thickness of the line */
  background-color: #008e91; /* Line color */
  border-radius: 10px; /* Makes the top and bottom of the line rounded */
}
.treasury-icon-desktop {
  margin-left :4px;
}
.treasury-icon-mobile
{
  margin-left :0px;
}
 </style>
