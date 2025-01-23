<template>
<q-item >
<q-item-section  avatar>
<q-avatar v-if="!isArabic(patient.namef)" class="avatar-name mr-1 !important" size="35px" font-size="20px" color="green-3" text-color="white"> {{getInitials( patient.namef) }} </q-avatar>
<q-avatar v-if="isArabic(patient.namef)" class="avatar-person" font-size="45px" size="35px" color="green-3" text-color="white" icon="person"/>
</q-item-section>

<q-item-section>
<q-item-label><div class="text-bold">{{ patient.namef }} ({{ patient.index }})</div></q-item-label>
</q-item-section>

</q-item>

</template>
<script setup>

 import {ref,computed,reactive} from 'vue'
 import {useStorePatients} from 'stores/storePatients'
 import { date } from 'quasar'
 import { useRouter } from 'vue-router'
/*
 props
*/
const props = defineProps({
    patientId:{
      type: String,
    }
})

/*
store
*/

const storePatients=useStorePatients()

/*
 Router
*/
 const router=useRouter()

/*
  Patient
*/

 const patient = computed (()=>{
  return storePatients.getPatient(props.patientId)
 })
 const expand=ref(false)
//  patient.value=storePatients.getPatient(props.patientId)
 const editpatient=(patientId)=>{
  router.push(`/EditPatient/${patientId}`)
 }

/*
charechter length
*/
 const charecterLength = computed (()=> {
  let length = props.patient.details.length
  let description = props.patient.details.length > 1 ?'charecters':'charecter'
  return `${length} ${description}`


 })

/*
 Modals
*/
 const modals = reactive({
  deletePatient:false,
  addAppointment:false,
  editPatient:false,
 })

 /*
filters
*/
const dateFormatted= computed(()=>{
  let addDate=new Date(parseInt(patient.value.dateUnix))
return date.formatDate(addDate, 'Do MMM YYYY')
})
const isArabic=(value) =>{
            return /[\u0600-\u06FF]/.test(value)
       }
       function getInitials(name) {
          const nameParts = name.split(' ');
          const firstName = nameParts[0].charAt(0).toUpperCase();
          const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          return `${firstName}${lastName}`;
       }

const gender= computed(()=>{
  let gender=patient.value.gender
  if (gender =='Male'){
    return 'man'
  }
  if(gender=='Female'){
    return 'woman'
  }
})


</script>
<style lang="sass" scoped>
.my-card
  width: 100%
.progress-buttom
  border-radius: 10px
  flex-basis: 37% !important
  width:100%
  max-width: 140px
  min-width: 108px

</style>
