<template>
  <template   v-if="appointments[patientId]&&appointments[patientId].length&&!loading">
    <q-table
      grid
      title="Appointments"
      class="appointments-table"
      :rows="appointments[patientId]"
      :columns="columns"
      row-key="name"
      :filter="filter"
      hide-header
      virtual-scroll
      card-container-class="my-card-style"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:item="props" v-if="appointments[patientId].length &&!storeAppointments.loading">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">

         <Appointment :appointment="props.row"/>
        </div>
      </template>
      <template v-slot:no-data="{ icon, message, filter }">
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>
            Well this is sad... {{ message }}
          </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
    </q-table>

         </template>
          <template   v-else-if="!loading && appointments[patientId]&&!appointments[patientId].length">
            <h5 style="height:410px;" class="text-center q-pt-xl q-ml-md q-mr-md  text-grey ">Patient has no added Appointments Yet. </h5>
         </template>
         <template v-else>
<q-card class="card-appointment q-mb-md" flat bordered >
      <q-item>
        <q-item-section>
          <q-item-label>
            <q-skeleton width="10%"  type="text" class="text-subtitle2" animation="fade" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton width="50%" type="text" class="text-subtitle2" animation="fade" />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-card-section>
        <q-skeleton type="text" width="25%" class="text-subtitle2" animation="fade" />
        <q-skeleton type="text" width="25%" class="text-subtitle2" animation="fade" />
      </q-card-section>
    </q-card>

  </template>
</template>

<script setup>
 import {ref,reactive,computed} from 'vue'
 import { storeToRefs } from 'pinia'
 import { useStoreAppointments } from 'src/stores/storeAppointments'
 import { colors, date } from 'quasar'
 import { useRouter } from 'vue-router'
 import Appointment from 'src/components/Appointment.vue'

 const { getPaletteColor } = colors
/*
 props
*/
const props = defineProps({
  patientId:{
    type: String,
    required:true
    },
  appointmentdate:{
    type: String,
    },
})

/*
store
*/
const storeAppointments = useStoreAppointments()
const {  appointments,loading } = storeToRefs(storeAppointments)

/*
 Router
*/
 const router = useRouter()

/*
  Appointments
*/
  storeAppointments.getAppointments(props.patientId)

//  const editpatient=(id)=>{
//   router.push(`/EditPatient/${id}`)
//  }

/*
 Modals
*/
 const modals = reactive({
  deleteAppointmentt:false
 })
/*
 Table
*/
const filter=ref('')
const columns = [
      { name: 'doctor',label: 'doctor',field: 'doctor',},
      { name: 'status',label: 'status',field: 'status',},
    ]

/*
 page style
*/
const pageStyleFn = (offset, height) =>{
  console.log(height,'ww')
          return { height: `370px` }
      }

</script>

<style lang="sass">
.appointments-table
  /* height or max-height is important */
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff !important

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
.my-card-style
  min-height: 410px !important
</style>
