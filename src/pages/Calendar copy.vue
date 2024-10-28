<template>
  <!-- add/edit an appointment -->
  <!-- <q-dialog v-model="modals.showAppointment"  >
     <CalendarAppointmentCard
     v-if="modals.showAppointment"
     v-model="modals.showAppointment"
     :appointment="Appointment"
      />
    </q-dialog> -->


<!--
<q-dialog v-model="modals.addAppointment2" :persistent="true" max-width="420">
 <q-card>
   <q-card-title>
     <q-input v-model="selectedEvent.title" placeholder="appointment Title" />
   </q-card-title>
   <q-card-text>
     <q-textarea v-model="selectedEvent.content" placeholder="appointment Content" />
     <q-flex>
       <q-select
         :items="eventsCssClasses"
         placeholder="appointment CSS Class"
         @change="selectedEvent.class = $event"
         :value="selectedEvent.class" />
       <q-switch v-model="selectedEvent.background" label="background appointment" />
     </q-flex>
     <q-flex>
       <q-btn @click="cancelEventCreation()">Cancel</q-btn>
       <q-btn @click="closeCreationDialog()">Save</q-btn>
     </q-flex>
   </q-card-text>
 </q-card>
 </q-dialog> -->
<!-- <q-btn @click="hir"></q-btn> -->
<ion-page>
    <ion-header :translucent="true" collapse="fade">
     <ion-toolbar>
      <NavigationBar
  :selectedDate="storeAppointments.selectedDate"
  :transition="transition"
  />
      </ion-toolbar>
    </ion-header>
  <ion-content

  >
  <q-dialog v-model="modals.addAppointment"  >
     <ModalAddAppointment
     v-if="modals.addAppointment"
     v-model="modals.addAppointment"
     :appointment="appointment.selectedEvent"
     :startTime="appointment.eventTimeStart"
     :endTime="appointment.eventTimeEnd"
     :doctor="appointment.doctor"
     :startDate="storeAppointments.selectedDate"
      />
    </q-dialog>

 <vue-cal
 v-touch-swipe:7e-1:10:100.mouse.left.right="handleSwipe"
 ref="vuecal"
 :disable-views="['years', 'year']"
 :events="appointmentsMap"
 :selected-date="storeAppointments.selectedDate"
 :time-from="10 * 60"
 :time-to="22 * 60"
 :time-step="15"
 active-view="day"
 today-button
 twelve-hour
 watchRealTime
 :special-hours="specialHours"
 :min-cell-width="400"
 :split-days="storeAuth.doctors"
 :min-event-width="50"
 sticky-split-labels
 hide-view-selector
 hide-title-bar
 :snap-to-time="15"
 :drag-to-create-threshold="15"
 @event-drag-create="onEventDragCreate"
 @event-drop="onEventDrop"
 @event-duration-change="onEventDrop"
 @event-delete="onEventDelete"
 :editable-events="{ title: false, drag: true, resize: true, delete: true, create: true }"
 :cell-click-hold="false"
 :drag-to-create-event="true"
 :time-cell-height="timeCellHeight"
 id="vuecal"
 @ready="scrollToCurrentTime"
 @cell-dblclick="$refs.vuecal.createEvent(
   $event,
   120,
   { title: 'New appointment', class: 'blue-event' }
 )"
 class=" vuecal--full-height-delete">
 <template #no-event>No Appointments</template>
 <template #cell-content="{ cell, view, events, goNarrower }">
 </template>
  <template  #split-label="{ split, view }">

   <div class="fit ">

         <q-item class="calHeader" clickable v-ripple>
           <q-item-section side>
             <q-avatar class="avatarShadow" size="35px">
               <img src="~assets/doctor.svg" />
             </q-avatar>
           </q-item-section>
           <q-item-section>
             <q-item-label  :style="`color: ${split.color}`">Dr.{{ split.name }}</q-item-label>

           </q-item-section>
         </q-item>
     </div>
 </template>
 <template #event="{ event, view }">
        {{ event.icon }}

   <div class="vuecal__event-title" v-html="event.title" />
   <!-- Or if your events are editable: -->
   <!-- <div class="vuecal__event-title vuecal__event-title--edit"
        contenteditable
        @blur="event.title = $event.target.innerHTML"
        v-html="event.title" /> -->

   <small class="vuecal__event-time">
     <!-- Using Vue Cal Date prototypes (activated by default) -->
     <strong>Starts:</strong> <span>{{ event.start.formatTime("h O'clock") }}</span><br/>
     <strong>Ends  :</strong> <span>{{ event.end.formatTime("h O'clock") }}</span>
   </small>
 </template>
  <template #today-button>
     <q-icon  @click="selectedDate = new Date()" name="my_location"></q-icon>
   <q-tooltip>
       <span>Go to Today's date</span>
   </q-tooltip>
 </template>
 <template  #time-cell="{ hours, minutes }">
   <div :class="{ 'vuecal__time-cell-line': true, hours: !minutes }">
   <div class="row justify-end" v-if="!minutes&&hours<=12"><strong class="col hours "  style="font-size: 15px">{{ hours }}</strong><div class="col time">AM</div></div>
   <div class="row justify-end" v-else-if="!minutes&&hours>12"><strong class="col hours" style="font-size: 15px">{{ hours-12 }}</strong><div class="col time">PM</div></div>

     <span v-else style="font-size: 11px">{{ minutes }}</span>
   </div>
 </template>
  </vue-cal>
</ion-content>
</ion-page>
</template>

<script setup>

import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import {ref,reactive,computed,onMounted,watch} from 'vue'
import ModalAddAppointment from 'src/components/PaymentsAndAppointments/appointmentModal.vue'
import NavigationBar from 'src/components/Calendar/NavigationBar.vue'
import moment from 'moment'
import {
 parseTimestamp,
 addToDate,
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import { storeToRefs } from 'pinia'
import { useStoreAppointments } from 'src/stores/storeAppointments'
import { useStoreAuth } from 'src/stores/storeAuth'
import { IonSegment, IonSegmentButton, IonHeader, IonLabel , IonToolbar ,IonPage ,IonContent, IonTitle} from '@ionic/vue';

const storeAuth=useStoreAuth()
const storeAppointments=useStoreAppointments()
const {  selectedDate,loadingAppointments } = storeToRefs(storeAppointments)
// const selectedDate=computed(()=>{ return storeAppointments.selectedDate})
const doctors=computed(()=>{ return storeAuth.doctors})
onMounted(() => {
       storeAppointments.getdayAppointments(storeAppointments.selectedDate)
       console.log(storeAppointments.selectedDate,'dattt')
         watch(selectedDate, async (newValue, oldValue) => {
           console.log(selectedDate,'gi')
         { await storeAppointments.getdayAppointments(newValue)}
         })
     })
const dailyHours = { from: 15 * 60, to: 21 * 60, class: 'business-hours' }
// In your component's data, special hours from Monday to Friday.
// Note that you can provide an array of multiple blocks for the same day.
const specialHours= {
 1: dailyHours,
 2: dailyHours,
 3: dailyHours,
 4: dailyHours,
 7: dailyHours,
 6:[
   { from: 9 * 60, to: 13 * 60, class: 'business-hours' },
   { from: 14 * 60, to: 21 * 60, class: 'business-hours' }
 ],
 5: {
   from: 7 * 60,
   to: 23 * 60,
   class: 'closed',
   label: 'Holiday'
 }
}
const appointment =ref({
 selectedEvent:null,
 eventTimeStart:null,
 eventTimeEnd:null,
 eventDateStart:null,
 doctor:null,
 appointmentId:null,
})
const modals = reactive({
 addAppointment:false,
})
 // const event= ref()
 // const eventsCssClasses= ['leisure', 'sport', 'health']
 // const onEventCreate= (event, deleteEventFunction)=>{
 //   eventTimeStart.value = event.start.formatTime('HH:mm')
 //   eventTimeEnd.value = event.end.formatTime('HH:mm')
 //   eventDateStart.value = event.start.format('YYYY-MM-DD')
 //   selectedEvent.value = event
 //   deleteEventFunction.value = deleteEventFunction
 //   return event
 // }
 function onEventDrop ({ event, originalEvent, external }) {
     // If the event is external, delete it from the data source on drop into Vue Cal.
     // If the event comes from another Vue Cal instance, it will be deleted automatically in there.
      const appointment=[]
      appointment.eventTimeStart = event.start.formatTime('HH:mm')
      appointment.eventTimeEnd = event.end.formatTime('HH:mm')
      appointment.eventDateStart = event.start.format('YYYY-MM-DD')
      appointment.selectedEvent = event
      appointment.doctor=storeAuth.doctors[event.split-1].name
      appointment.appointmentId=originalEvent.appointmentId,

      storeAppointments.dropAppointment(appointment)
     console.log('dsd2', originalEvent)
     // if (external) {
     //   console.log('dsd2', originalEvent)
     //   const extEventToDeletePos = this.draggables.findIndex(item => item.id === originalEvent.id)
     //   if (extEventToDeletePos > -1) this.draggables.splice(extEventToDeletePos, 1)
     // }
   }
     function onEventDelete ( event, external ) {

      storeAppointments.deleteAppointment(event.appointmentId)
     // if (external) {
     //   console.log('dsd23', originalEvent)
     //   const extEventToDeletePos = this.draggables.findIndex(item => item.id === originalEvent.id)
     //   if (extEventToDeletePos > -1) this.draggables.splice(extEventToDeletePos, 1)
     // }
   }
     function onEventDragCreate (event,deleteEventFunction) {
      appointment.value.eventTimeStart = event.start.formatTime('HH:mm')
      appointment.value.eventTimeEnd = event.end.formatTime('HH:mm')
      appointment.value.eventDateStart = event.start.format('YYYY-MM-DD')
      appointment.value.selectedEvent = event
      appointment.value.doctor=storeAuth.doctors[event.split-1].name

      console.log(':eventyyy  ',event)
      modals.addAppointment = true

  }
  function onDrop (event){
    this.deleteEventFunction()
  }


 const cancelEventCreation= ()=> {

 }
 const closeCreationDialog= ()=> {
   modals.addAppointment = false
   appointment.value.selectedEvent = {}
 }

/*
Page Style
*/
const pageStyleFn = (offset, height) => {
       return { height: `${ height - offset-70 }px` }
     }

var day = selectedDate
var dayWrapper = moment(day)
var dayString =  computed(() => {
   return moment(selectedDate).format("YYYY-MM-D")
 })
var daynoString=parseInt(dayString)
const hir=()=>{
 console.log(dayString)
}


/*
 Calendar
*/
 const weekdays = reactive([ 6, 0, 1, 2, 3, 4, 5 ]),
       transition = ref(''),
       parsedStart = computed(() => {
         return(parseTimestamp(storeAppointments.selectedDate), weekdays, parseTimestamp(storeAppointments.selectedDate))
       })

 // const today2 = computed(() => {
 //   return parseTimestamp(storeAppointments.selectedDate)
 // })

 function onPrevDay () {
   const ts = addToDate(parsedStart.value, { day: -1 })
   storeAppointments.selectedDate = ts.date
 }
 function onNextDay () {
   const ts = addToDate(parsedStart.value, { day: 1 })
   storeAppointments.selectedDate = ts.date
 }

 const  vuecal = ref(null)
 var aActive = true
 function  handleSwipe ({evt, ...info} ){
 if (info.direction === 'right') {
   // transition.value=''
   onPrevDay()
   console.log('right')
 }
 else if (info.direction === 'left') {
   onNextDay()
   // transition.value=''
   console.log('left')
 }
 }
 const dragtocreateEvent =computed(()=>{
   if(aActive) {
     return true
   }
 })

 const appointmentsMap = computed(() => {
  const map = []
  // Indexing
  const dayAppointments = storeAppointments.dayAppointments[storeAppointments.selectedDate]
  if (dayAppointments) {
    dayAppointments.forEach((appointment) => {
      let index = doctors.value.findIndex((object) => {
        return object.name === appointment.doctor
      })
      if (!appointment.split && appointment.doctor) {
        appointment.split = index + 1;
      }
      appointment.class = 'sport'
      map.push(appointment)
    });
  } else {
    console.warn('dayAppointments is not defined.')
  }
  return map
})

 const timeCellHeight=ref(25)

 function  scrollToCurrentTime () {
   const calendar = document.querySelector('#vuecal .vuecal__bg')
   const hours = new Date().getHours() + new Date().getMinutes()  /60
   console.log(hours,'hours')
   calendar.scrollTo({ top: hours * timeCellHeight.value, behavior: 'smooth' })
 }
</script>

<style>
#app {
 font-family: Avenir, Helvetica, Arial, sans-serif;
 -webkit-font-smoothing: antialiased;
 -moz-osx-font-smoothing: grayscale;
 text-align: center;
 color: #2c3e50;

}
.vuecal {
 margin:inherit;
 box-sizing: border-box;
}
.vuecal__event {
 background-color:none;
 box-sizing: border-box;
 padding: 5px;
 border: none;
 border-top: 3px solid rgba(230,55,55,.3);
 color: #c55656;
 border-radius: 3px;
 margin: 1px 0px 0px 0px !important;
 cursor: pointer;

}

.vuecal__event.leisure {background-color: rgba(253, 156, 66, 0.9);border: 1px solid rgb(233, 136, 46);color: #fff;}
.vuecal__event.health {background-color: rgba(164, 230, 210, 0.9);border: 1px solid rgb(144, 210, 190);}
.vuecal__event.sport {
   background-color:rgba(239, 183, 183, 0.9);
   border: none;
   border-top: 3px solid rgba(230,55,55,.3);
   color: #c55656;
   margin: 1px !important
}
.vuecal__event--dragging {
 background-color:rgba(226, 88, 19, 0.132)!important;
 color: rgba(226, 19, 19, 0.535)!important;
}
.vuecal__event--focus, .vuecal__event:focus {
   box-shadow: 1px 1px 6px #0003;
   z-index: 3;
   outline: none;
   /* background-color:rgba(19, 226, 60, 0)!important; */
}
.business-hours {
 background-color: rgba(143, 204, 0, 0.089);
 border: solid rgba(107, 36, 10, 0.3);
 border-width: 1px 0;
}
.closed {
 background:
   #fff7f0
   repeating-linear-gradient(
     -45deg,
     rgba(255, 87, 87, 0.25),
     rgba(255, 87, 87, 0.25) 5px,
     rgba(255, 255, 255, 0) 5px,
     rgba(255, 255, 255, 0) 15px
   );
 color: #2d8f0f;
}

.vuecal .day-split-header {font-size: 15px;}
/* .vuecal__body .split1 {background-color: rgba(226, 242, 253, 0.7);}
.vuecal__body .split2 {background-color: rgba(232, 245, 233, 0.7);}
.vuecal__body .split3 {background-color: rgba(255, 243, 224, 0.7);}
.vuecal__body .split4 {background-color: rgba(255, 235, 238, 0.7);} */
.vuecal__no-event {display:true;}
.vuecal__time-cell-line.hours:before {border-color: #42b9835e;}

.time {margin-right:7px ;margin-top:2.1px;font-size:11px;}
.hours {margin-left:4px ;}
/* width */
/* ::-webkit-scrollbar {
 width: 7px;
 border-radius: 100px;
} */

/* Track */
/* ::-webkit-scrollbar-track {
 background: #f1f1f1;
 border-radius: 100px;
} */

/* Handle */
/* ::-webkit-scrollbar-thumb {
 background: #888;
 border-radius: 100px;
} */

/* Handle on hover */
/* ::-webkit-scrollbar-thumb:hover {
 background: #555;
 border-radius: 100px;
} */
.vuecal__event:hover .vuecal__event-resize-handle, .vuecal__event:focus .vuecal__event-resize-handle, .vuecal__event--focus .vuecal__event-resize-handle, .vuecal__event--resizing .vuecal__event-resize-handle {
   opacity: 0.4;
   transform: translateY(0);
   height: 1px;
   padding-bottom: 1px;
   bottom: 5px;
   border-color: rgba(166, 88, 88, 0.973);
   border-style: solid;
   border-width: 2px 0;
   width: 18%;
   text-align: center;
   font-size: 18px;
   margin-left: 43%;
}

.vuecal__event-resize-handle {
  margin-left: 43%;
}
.vuecal__now-line {color: #d88b00bd;}
.vuecal__now-line:before {
   position: absolute;
   top: -2px;
   left: -10px;
   height: 10px;
   width: 10px;
   margin-top: -4px;
   background-color: #000 ;
   border-radius: 50%;
}
.vuecal__now-line {
 position: absolute;
   left: 5px;
   border-top: #000  2px solid;
   width: calc(100% - 5px);
}
.vuecal--day-view:not(.vuecal--overflow-x) .vuecal__split-days-headers {
   height: auto;
}
.vuecal__header {
 background-color: #d88b00bd;
}
.calHeader {
   min-height: 37px;
   padding: 0px 12px;

}
.avatarShadow {
 box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
</style>
