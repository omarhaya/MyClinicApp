<template>

   <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure that you want to delete payment with id( {{paymentId}} ) ?</span>
        </q-card-section>
        <!-- Notice v-close-popup -->
        <q-card-actions align="right">
          <q-btn  @click="closeModal" flat label="Cancel" color="primary" />
          <q-btn @click="storePayments.deletePayment(paymentId)" v-close-popup flat label="Delete" color="red"  />
        </q-card-actions>
      </q-card>

</template>
<script setup>
import {useStorePayments} from 'stores/storePayments'

/*
  store
*/

   const storePayments=useStorePayments()


/*
   props
*/


   const props = defineProps({

    modelValue:{
      type:Boolean,
      default:false
    },
    paymentId:{
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
