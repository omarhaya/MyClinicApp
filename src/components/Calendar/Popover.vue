<template>
  <div >
    <q-card min-width="300" class="my-card">
      <q-toolbar :class="`bg-${event.extendedProps.background} text-white`" style="min-width: 340px;padding-left: 0px;">
        <q-btn flat round color="white" icon="close"   @click="storeAppointments.menu[event.extendedProps.appointmentId] = false"/>
            <q-toolbar-title >
              <!-- Add New Appointment -->
            </q-toolbar-title>
            <q-btn flat round color="white" icon="delete"   @click=" storeAppointments.deleteAppointment(event)"/>
            <q-btn flat round color="white" icon="edit"   @click="storeAppointments.menu[event.extendedProps.appointmentId] = false"/>
          </q-toolbar>
                  <div class="row">
                  <div class="col">
              <q-item clickable @click="$router.push(`/Patients/${patient.patientId}`)" class="q-pt-md">

                <q-item-section  avatar>
              <q-avatar v-if="!isArabic(event.title)" class="avatar-name" size="45px" font-size="20px" color="green-3" text-color="white"> {{getInitials( event.title) }} </q-avatar>
              <q-avatar v-if="isArabic(event.title)" class="avatar-person" font-size="55px" size="45px" color="green-3" text-color="white" icon="person"/>
               </q-item-section>

               <q-item-section >
                <q-item-label ><div class="text-bold">{{ event.title }}</div></q-item-label>
                <q-item-label class="row" ><div class="text-grey col-8">Added On {{dateFormatted}} </div><div class="text-right col-4"><q-icon color="primary" name="tag" />{{patient.index }}</div></q-item-label>
               </q-item-section>

              </q-item>
               </div>
                <q-space />
                <div  class="q-pt-sm fixed-end ">
                  <!-- <q-btn color="grey-7" round flat icon="more_vert">
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

            </q-btn> -->
            </div>
            </div>
      <q-slide-transition>

        <div v-show="expand">
          <q-card-section >
              <!-- <div >
             <p class="q-ma-xs">Patient No. :<q-icon color="primary" name="tag" />{{patient.index }}</p>
              <p class="q-ma-xs" >Gender :<q-icon color="primary"  size="1.5em" :name="gender"/></p>
               <p class="q-ma-xs" >Age : {{patient.age}}</p>
                 <p class="q-ma-xs" >Phone Number : {{patient.phone}} <q-icon v-if="patient.phone" color="primary" size="1.1em" name="phone_in_talk" /></p>
                   <p class="q-ma-xs">Date Added : {{dateFormatted}}</p>
              </div> -->
          </q-card-section>
        </div>
      </q-slide-transition>

      <q-card-actions  :props="props">

        <q-btn round icon="add" @click="modals.addAppointment=true" :color="event.extendedProps.background"/>
        <q-btn flat :color="event.extendedProps.background" label="Casesheet" />
        <q-space />
        <v-spacer></v-spacer>

<v-btn
  variant="text"
  @click="storeAppointments.menu[event.extendedProps.appointmentId] = false"
>
  Cancel
</v-btn>
<v-btn
  :color="event.extendedProps.background"
  variant="text"
  @click="storeAppointments.menu[event.extendedProps.appointmentId] = false"
>
  Save
</v-btn>
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
  </div>

</template>
<script setup>
import { useStoreAppointments } from 'src/stores/storeAppointments';
import { ref,computed } from 'vue';
 import { date } from 'quasar'

/*
   props
*/
const props = defineProps({

modelValue:{
  type:Boolean,
  default:false
},
event:{
  type: Object,
},
})

const storeAppointments=useStoreAppointments()
const patient=ref(props.event.extendedProps.patientDetails)

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

  const fav=ref(true)
    const  menu= ref(true)
   const   message=ref(true)
    const  hints= ref( true)
</script>
