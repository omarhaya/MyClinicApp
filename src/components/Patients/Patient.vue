<template>
      <q-dialog v-model="modals.addAppointment" persistent >
      <ModalAddAppointment
      v-if="modals.addAppointment"
      v-model="modals.addAppointment"
      :patientId="patient.patientId"
       />
     </q-dialog>

   <q-dialog v-model="modals.deletePatient" >
    <ModalDeletePatient
      v-if="modals.deletePatient"
      v-model="modals.deletePatient"
      :patientId="patient.patientId"
      :patient="patient.namef"
    />
    </q-dialog>

    <q-card  class="my-card">
                  <div class="row">
                  <div class="col">
              <q-item class="q-pt-md">

                <q-item-section  avatar>
              <q-avatar v-if="!isArabic(patient.namef)" class="avatar-name" size="45px" font-size="20px" color="green-3" text-color="white"> {{getInitials( patient.namef) }} </q-avatar>
              <q-avatar v-if="isArabic(patient.namef)" class="avatar-person" font-size="55px" size="45px" color="green-3" text-color="white" icon="person"/>
               </q-item-section>

               <q-item-section>
                <q-item-label><div class="text-bold">{{ patient.namef }}</div></q-item-label>
                <q-item-label class="row" ><div class="text-grey col-8">Added On {{dateFormatted}} </div><div class="text-right col-4"><q-icon color="primary" name="tag" />{{patient.index }}</div></q-item-label>
               </q-item-section>

              </q-item>
               </div>
                <q-space />
                <div  class="q-pt-sm fixed-end ">
                  <q-btn color="grey-7" round flat icon="more_vert">
              <q-menu cover auto-close  anchor="top left"
                 self="top left" >
                <q-list>
                  <q-item clickable>
                   <q-item-section @click.prevent="editpatient(patient.patientId)" > Edit Details</q-item-section>
                  </q-item>
                   <q-item clickable>
                    <q-item-section @click.prevent="modals.deletePatient=true">Delete Patient</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Share</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>

            </q-btn>
            </div>
            </div>
      <q-slide-transition>

        <div v-show="expand">
          <q-card-section >
              <div >
             <p class="q-ma-xs">Patient No. :<q-icon color="secondary" name="tag" />{{patient.index }}</p>
              <p class="q-ma-xs" >Gender :<q-icon color="secondary"  size="1.5em" :name="gender"/></p>
               <p class="q-ma-xs" >Age : {{patient.age}}</p>
                 <p class="q-ma-xs" >Phone Number : {{patient.phone}} <q-icon v-if="patient.phone" color="secondary" size="1.1em" name="phone_in_talk" /></p>
                   <p class="q-ma-xs">Date Added : {{dateFormatted}}</p>
              </div>
          </q-card-section>
        </div>
      </q-slide-transition>

      <q-card-actions  :props="props">

        <q-btn round icon="add" @click="modals.addAppointment=true" color="secondary"/>
        <q-btn flat color="secondary" label="Casesheet" />
        <q-space />

        <q-btn
          color="grey"
          round
          flat
          dense
          class="fixed-end"
          :icon="expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expand = !expand"
        />
      </q-card-actions>
            </q-card>

</template>
<script setup>

 import {ref,computed,reactive} from 'vue'
 import {useStorePatients} from 'stores/storePatients'
 import ModalDeletePatient from './ModalDeletePatient.vue'
 import { date } from 'quasar'
 import { useRouter } from 'vue-router'
 import ModalAddAppointment from '../PaymentsAndAppointments/ModalAddAppointment.vue'
/*
 props
*/
const props = defineProps({
  patient:{
    type : Object,
    required:true
  },
    patientId:{
      type: String,
    },
    patient:{
      type:Boolean,
      default:false
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

 const patient = ref('')
 const expand=ref(false)
 patient.value=storePatients.getPatient(props.patientId)
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
  addAppointment:false
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
