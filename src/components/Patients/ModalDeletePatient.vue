<template>

   <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure that you want to delete ( {{patient}} ) ?</span>
        </q-card-section>
        <!-- Notice v-close-popup -->
        <q-card-actions align="right">
          <q-btn  @click="closeModal" flat label="Cancel" color="primary" />
          <q-btn @click="storePatients.deletePatient(patientId)" v-close-popup flat label="Delete" color="red"  />
        </q-card-actions>
      </q-card>

</template>
<script setup>
import {useStorePatients} from 'stores/storePatients'

/*
  store
*/

   const storePatients=useStorePatients()


/*
   props
*/


   const props = defineProps({

    modelValue:{
      type:Boolean,
      default:false
    },
    patientId:{
      type: String,
      required:true
    },
    patient:{
      type: String,
      required:true
    },
   })


/*
   emits
*/

   const emit = defineEmits(['update:modelValue'])

/*
   close modal
*/
     const closeModal = () => {
      emit('update:modelValue',false)


     }

</script>
