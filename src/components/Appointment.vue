<template>
    <q-card  :style="cardStyle(appointment)"   :class="{
            paid: !$q.dark.isActive,
            partiallyPaid: $q.dark.isActive ,
          }" class="card-appointment cursor-pointer q-hoverable">
    <q-card-section>
        <div class="column ">
       <q-badge outline  v-if="appointment.doctor!==''" class="absolute-top-right badge-doctor">{{DoctorFilter(appointment.doctor)}}</q-badge>
       <q-badge  v-if="appointment.appointmentdate!==''" class="absolute-top-left badge-date">{{appointment.appointmentdate}}</q-badge>
      <q-badge  v-if="appointment.appointmentdate!==''" class="absolute-bottom-left q-ma-xs q-pa-sm badge-status"><span>{{appointment.status}}</span> </q-badge>
       <div  class="row q-mt-md"><div class="col"><span  class="text-weight-bold q-pr-xs"></span> {{convertTo12HourFormat(appointment.start)+'-'+convertTo12HourFormat(appointment.end)}}</div></div>
       <div class="col q-mb-lg">
        <span v-if="$q.screen.gt.sm" style=" word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">   <q-badge rounded color="grey" label="2nd Visit Endo." /></div> {{appointment.details }}</span>
        <span v-else-if="$q.screen.gt.xs" style="word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{appointment.details }}</span>
         <span v-else style="width:290px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{appointment.details }}</span>
        </div>
    </div>
        <div class="text-caption text-right text-grey" style="margin-bottom: -15px;">{{(dateFormatted(appointment.date))}}</div>
      </q-card-section>
          </q-card>
</template>

<script setup>
import { useStorePayments } from 'src/stores/storePayments'
import { useStoreWorks } from 'src/stores/storeWorks'
import { ref,computed } from 'vue'
import { colors, date } from 'quasar'

const props = defineProps({
  appointment:{
    type : Object,
    required:true
  }
})
/*
 Stores
*/
  const storeWorks=useStoreWorks()
  const storePayments=useStorePayments()

   /*
    Styling
   */
   const { getPaletteColor } = colors
   function  cardStyle  (appointment) {
        if (appointment.status==='Booked'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('grey-3'),
        'color': getPaletteColor('grey-8'),
        // caption color
        '--caption-color':getPaletteColor('grey-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('grey-8'),
        '--status-color':getPaletteColor('grey-8'),
        '--status-background-color':getPaletteColor('grey-5'),
        '--date-color':getPaletteColor('grey-8')
        }}
        if (appointment.status==='Confirmed'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('orange-1'),
        'color': getPaletteColor('orange-8'),
        // caption color
        '--caption-color':getPaletteColor('orange-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('orange-8'),
        '--status-color':getPaletteColor('orange-8'),
        '--status-background-color':getPaletteColor('orange-3'),
        '--date-color':getPaletteColor('orange-8')
        }}
        if (appointment.status==='Delayed'){
          console.log(appointment,'appointment')
        return {
        // card color
        'background-color':  getPaletteColor('yellow-1'),
        'color': getPaletteColor('yellow-8'),
        // caption color
        '--caption-color':getPaletteColor('yellow-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('yellow-8'),
        '--status-color':getPaletteColor('yellow-8'),
        '--status-background-color':getPaletteColor('yellow-3'),
        '--date-color':getPaletteColor('yellow-8')
        }}
        if (appointment.status==='Arrived'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('pink-1'),
        'color': getPaletteColor('pink-8'),
        // caption color
        '--caption-color':getPaletteColor('pink-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('pink-8'),
        '--status-color':getPaletteColor('pink-8'),
        '--status-background-color':getPaletteColor('pink-3'),
        '--date-color':getPaletteColor('pink-8')
        }}
        if (appointment.status==='Seated'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('green-1'),
        'color': getPaletteColor('green-8'),
        // caption color
        '--caption-color':getPaletteColor('green-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('green-8'),
        '--status-color':getPaletteColor('green-8'),
        '--status-background-color':getPaletteColor('green-3'),
        '--date-color':getPaletteColor('green-8')
        }}
        if (appointment.status==='Completed'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('purple-1'),
        'color': getPaletteColor('purple-8'),
        // caption color
        '--caption-color':getPaletteColor('purple-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('purple-8'),
        '--status-color':getPaletteColor('purple-8'),
        '--status-background-color':getPaletteColor('purple-3'),
        '--date-color':getPaletteColor('purple-8')
        }}
        if (appointment.status==='Checked'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('teal-1'),
        'color': getPaletteColor('teal-8'),
        // caption color
        '--caption-color':getPaletteColor('teal-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('teal-8'),
        '--status-color':getPaletteColor('teal-8'),
        '--status-background-color':getPaletteColor('teal-3'),
        '--date-color':getPaletteColor('teal-8')
        }}
        if (appointment.status==='Failed'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('red-1'),
        'color': getPaletteColor('red-8'),
        // caption color
        '--caption-color':getPaletteColor('red-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('red-8'),
        '--status-color':getPaletteColor('red-8'),
        '--status-background-color':getPaletteColor('red-3'),
        '--date-color':getPaletteColor('red-8')
        }}
      }
/*
  Filters
*/
const dateFormatted = (appointmentDate)=>{
       return date.formatDate(parseInt(appointmentDate), 'Do MMM YYYY , hh:mm A')
      }
  const DoctorFilter = (value) => {
        return 'Dr.'+(value)
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
   color: var(--doctor-color);
  }
 .badge-date{
   border-top-right-radius: 0 !important;
   border-bottom-left-radius: 0;
   font-size: 16px;
   padding:5px;
   background-color: var(--date-color);
  }
  .badge-status{
   font-size: 14px;
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
