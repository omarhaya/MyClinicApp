<template>
  <template  v-if="appointments[patientId]&&!loading">
    <q-table
      grid
      title="Appointments"
      class="patient-view-table col"
      :rows="appointments[patientId]"
      :columns="columns"
      row-key="name"
      :filter="filter"
      hide-header
      :rows-per-page-options="[6]"
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
          <q-card  :style="cardStyle"   :class="{
            paid: !$q.dark.isActive,
            partiallyPaid: $q.dark.isActive ,
          }" class="card-appointment cursor-pointer q-hoverable">
    <q-card-section>
        <div class="column ">
       <q-badge outline color="red" v-if="props.row.doctor!==''" class="absolute-top-right badge-doctor">{{DoctorFilter(props.row.doctor)}}</q-badge>
       <q-badge  color="red-5" v-if="props.row.appointmentdate!==''" class="absolute-top-left badge-date">{{props.row.appointmentdate}}</q-badge>
      <q-badge  color="red" v-if="props.row.appointmentdate!==''" class="absolute-bottom-left q-ma-xs q-pa-sm badge-status"> Pending</q-badge>
       <div  class="row q-mt-md"><div class="col"><span  class="text-weight-bold q-pr-xs"></span> {{convertTo12HourFormat(props.row.start)+'-'+convertTo12HourFormat(props.row.end)}}</div></div>
       <div class="col q-mb-lg">
        <span v-if="$q.screen.gt.sm" style=" word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{props.row.details }}</span>
        <span v-else-if="$q.screen.gt.xs" style="word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{props.row.details }}</span>
         <span v-else style="width:290px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{props.row.details }}</span>
        </div>
    </div>
        <div class="text-caption text-right text-grey" style="margin-bottom: -15px;">{{(dateFormatted(props.row.date))}}</div>
      </q-card-section>
          </q-card>
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

  <!-- <q-card
        v-for="appointment in appointments"
        :key="appointment.id"
        class="card-appointment q-mb-md"
        flat
        container
        bordered>

    <q-card-section>
        <div class="row appointmentCard">
        <div class="col "><div><div class="text-weight-bold">Tooth:</div> {{appointment.tooth}} <q-badge color="primary" v-if="appointment.doctor!==''" class="absolute-top-right badge-doctor">{{DoctorFilter(appointment.doctor)}}</q-badge></div>
        <span v-if="$q.screen.gt.sm" style="width:470px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{appointment.details }}</span>
        <span v-else-if="$q.screen.gt.xs" style="width:500px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{appointment.details }}</span>
         <span v-else style="width:290px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{appointment.details }}</span>
        </div>
    </div>
        <div class="text-caption text-right text-grey">{{(dateFormatted(appointment.date))}}</div>
      </q-card-section>
    </q-card> -->

         </template>
          <template  v-else-if="!storeAppointments.loadingAppointments && !appointments.length">
            <h5 class="text-center q-pt-xl q-ml-md q-mr-md  text-grey ">Patient has no added Appointments Yet. </h5>
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
 import { date } from 'quasar'
 import { useRouter } from 'vue-router'

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

    const cardStyle=computed(()=>{
      return {
        'background-color': '#efb7b75e',
        'color': 'red',

        '--caption-color':'red',
        '--status-dot-color':'red',
        '--status-color':' #dc0000',
        '--status-background-color':'#ff00004d'
      }
    })
/*
 page style
*/
const pageStyleFn = (offset, height) =>{
  console.log(height,'ww')
          return { height: `370px` }
      }
 /*
filters
*/
  const dateFormatted = (appointmentDate)=>{
       return date.formatDate(parseInt(appointmentDate), 'Do MMM YYYY , hh:mm A')
      }
  const DoctorFilter = (value) => {
        return 'Dr.'+(value)
      }
  const currency = (value) => {
        return  ( value) +' ' +this.currencyval
      }
  const formatPrice = (value) => {
    if (value !==0 ||value !== '') {
       let val = (value/1).toFixed().replace(',', '.')
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      }
  const  convertTo12HourFormat=(time24)=> {
    const [hours, minutes] = time24.split(':');
    let period = 'AM';

    let hours12 = parseInt(hours, 10);
    if (hours12 >= 12) {
      period = 'PM';
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }
    return `${hours12}:${minutes} ${period}`;
  }

</script>
<style lang="scss" scoped>
.card-appointment {

 .badge-doctor{
   border-bottom-right-radius: 0;
   border-top-left-radius: 0;
   font-size: 14px;
  }
 .badge-date{
   border-top-right-radius: 0 !important;
   border-bottom-left-radius: 0;
   font-size: 16px;
   padding:5px;
  }
  .badge-status{
   font-size: 16px;
   color: var(--status-color);
   background-color: var(--status-background-color) !important;
   &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 4px;
    background-color: var(--status-dot-color) !important
  }
  }
  .text-caption {
    color: var(--caption-color) !important;
}

}
.q-hoverable {
  transition: transform 0.3s, box-shadow 0.3s !important;
  will-change: transform, box-shadow !important;
}

.q-hoverable:hover {
  transform: translateY(-5px) rotateX(5deg); /* Change to desired hover transformation */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important; /* Change to desired hover box shadow */
}

</style>
