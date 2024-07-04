<template>

<div>
  <q-card v-if="appointment">
    <q-toolbar :class="displayClasses(appointment)" :style="c(appointment)" style="min-width: 340px;">
            <q-toolbar-title>
              {{ appointment.title }}
            </q-toolbar-title>
            <q-btn flat round color="white" icon="delete" v-close-popup @click="storeAppointments.deleteAppointment(appointment.id)"></q-btn>
            <q-btn flat round color="white" icon="edit" v-close-popup></q-btn>
            <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
          </q-toolbar>
          <q-card-section>
            {{ appointment.details }}
            <div v-if="appointment.time" class="text-caption">
              <div class="row full-width justify-start" style="padding-top: 12px;">
                <div class="col-12">
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>Start Time:</strong>
                    </div>
                    <div class="col-7">
                      {{ timeFormat(appointment.time) }}
                    </div>
                  </div>
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>End Time:</strong>
                    </div>
                    <div class="col-7">

                    </div>
                  </div>
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>Duration:</strong>
                    </div>
                    <div class="col-7">
                      {{ convertDurationTime(appointment.duration) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn v-if="!appointment.completed" flat label="Done" icon="done" color="primary" v-close-popup @click="storeAppointments.completeAppointment(appointment)"/>
             <q-btn v-else flat label="un-Done" color="primary" v-close-popup @click="storeAppointments.completeAppointment(appointment)"/>
          </q-card-actions>
        </q-card>
      </div>
</template>

<script setup>
import { colors } from 'quasar'
import { QCalendar ,  parseTimestamp,addToDate,} from '@quasar/quasar-ui-qcalendar/src'
import { useStoreAppointments } from 'src/stores/storeAppointments'
import { useStorePayments } from 'src/stores/storePayments';

/*
 Stores
*/
   const storeAppointments=useStoreAppointments()
   const storePayments=useStorePayments()
/*
   props
*/
   const props = defineProps({

    appointment:{
      type:Object,
      default:''
    }
   })

    function getEndTime (appointment) {
      let endTime = QCalendar.parseTimestamp(appointment.date + ' ' + appointment.time)
      endTime = QCalendar.addToDate(endTime, { minute: appointment.duration })
      endTime = QCalendar.getTime(endTime)
      return endTime
    }
    function getEventDate (appointment) {
      const parts = appointment.date.split('-')
      const date = new Date(parts[0], parts[1] - 1, parts[2])
      return this.dateFormatter.format(date)
    }

    function displayClasses (appointment) {
      return {
        [`bg-${appointment.bgcolor}`]: true ,
        'text-black': !(appointment.bgcolor)
      }
    }
   function c (appointment) {
      const s = {}
      if ((appointment.bgcolor)) {
        s['background-color'] = appointment.bgcolor
        s.color = colors.luminosity(appointment.bgcolor) > 0.5 ? 'black' : 'white'
      }

      return s
    }
/*
 Filters
*/
    const timeFormat = (n)=>{
      let val =  n.replace(/\:/g,'')
      let val2= val-1200
      if(val>=1300){return val2.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ":") +' '+ 'PM'}
       if(val>=1200 && val<1300){return val.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ":") +' '+ 'PM'}
        if(val<1200){return val.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ":") +' '+ 'AM'}

    }
    const convertDurationTime = (n)=> {
      const num = n
      const days = Math.floor(((num / 60) / 24))
      const hours = (num / 60)
      const rhours = Math.floor(hours)
      const rshours = Math.floor(hours - (days * 24))
      const minutes = (hours - rhours) * 60
      const rminutes = Math.round(minutes)
       if(rminutes!==0){return (days > 0 ? days + ' days and ' : '') + (rshours > 0 ? rshours + ' hour(s) and ' : '') + rminutes + ' minute(s).'}
       else{return (days > 0 ? days + ' days and ' : '') + (rshours > 0 ? rshours + ' hour(s)' : '') }
    }

</script>
