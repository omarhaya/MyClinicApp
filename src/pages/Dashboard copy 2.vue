<template>
   <!-- add/edit an appointment -->
   <!-- <q-dialog v-model="modals.showAppointment"  >
      <CalendarAppointmentCard
      v-if="modals.showAppointment"
      v-model="modals.showAppointment"
      :appointment="Appointment"
       />
     </q-dialog> -->
    <q-dialog v-model="modals.addAppointment"  >
      <ModalAddAppointment
      v-if="modals.addAppointment"
      v-model="modals.addAppointment"
      :event="event"
      :time="time"
      :duration="duration"
      :date="selectedDate"
      :doctor="doctor"
      :details="event"
       />
     </q-dialog>

<!--
<q-dialog v-model="modals.addAppointment2" :persistent="true" max-width="420">
  <q-card>
    <q-card-title>
      <q-input v-model="selectedEvent.title" placeholder="Event Title" />
    </q-card-title>
    <q-card-text>
      <q-textarea v-model="selectedEvent.content" placeholder="Event Content" />
      <q-flex>
        <q-select
          :items="eventsCssClasses"
          placeholder="Event CSS Class"
          @change="selectedEvent.class = $event"
          :value="selectedEvent.class" />
        <q-switch v-model="selectedEvent.background" label="background Event" />
      </q-flex>
      <q-flex>
        <q-btn @click="cancelEventCreation()">Cancel</q-btn>
        <q-btn @click="closeCreationDialog()">Save</q-btn>
      </q-flex>
    </q-card-text>
  </q-card>
  </q-dialog> -->
<!-- <q-btn @click="hir"></q-btn> -->
  <q-page
  class="column no-wrap"
  :style-fn="pageStyleFn">

  <NavigationBar
   :selectedDate="storeAppointments.selectedDate"
   :transition="transition"
   @onNext="onNext"
   @onPrev="onPrev"
   />
  <vue-cal
  v-touch-swipe.mouse.left.right="handleSwipe"
  ref="vuecal"
  :disable-views="['years', 'year']"
  :events="events"
  :selected-date="storeAppointments.selectedDate"
  :time-from="10 * 60"
  :time-to="22 * 60"
  :time-step="15"
  :time-cell-height="25"
  active-view="day"
  today-button
  twelve-hour
  :special-hours="specialHours"
  :on-event-create="onEventCreate"
  :min-cell-width="400"
  :split-days="Doctors"
  :min-event-width="50"
  @event-drag-create="modals.addAppointment = true"
  :editable-events="{ title: false, drag: true, resize: true, delete: true, create: true }"
  sticky-split-labels
  hide-view-selector
  hide-title-bar
  :snap-to-time="15"
  :drag-to-create-threshold="15"
  :drag-to-create-event="dragtocreateEvent"

  class=" vuecal--full-height-delete">
   <template  #split-label="{ split, view }">
    <i class="icon material-icons">person</i>
    <strong :style="`color: ${split.color}`">{{ split.label }}</strong>
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

  </q-page>
</template>

<script setup>

import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import {ref,reactive,computed} from 'vue'
import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
import ModalAddAppointment from 'src/components/PaymentsAndAppointments/ModalAddAppointment.vue'
import NavigationBar from 'src/components/Calendar/NavigationBar.vue'
import moment from 'moment'
import {
  getEndOfWeek,
  getStartOfWeek,
  getWeekdaySkips,
  parseTimestamp,
  addToDate,
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import { useStoreAppointments } from 'src/stores/storeAppointments'


const storeAppointments=useStoreAppointments()

const selectedDate= new Date()
const dailyHours = { from: 15 * 60, to: 21 * 60, class: 'business-hours' }
const  events= [
    {
      start: '2023-1-21 14:00',
      end: '2023-1-21 18:00',
      title: 'Need to go shopping',
      icon: 'shopping_cart', // Custom attribute.
      content: 'Click to see my shopping list',
      contentFull: 'My shopping list is rather long:<br><ul><li>Avocados</li><li>Tomatoes</li><li>Potatoes</li><li>Mangoes</li></ul>', // Custom attribute.
      class: 'leisure'
    },
    {
      start: '2023-1-21 10:00',
      end: '2023-1-21 15:00',
      title: 'Golf with John',
      icon: 'golf_course', // Custom attribute.
      content: 'Do I need to tell how many holes?',
      contentFull: 'Okay.<br>It will be a 18 hole golf course.', // Custom attribute.
      class: 'sport'
    }
  ]
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
    label: 'Day Off'
  }
}
const selectedEvent= ref(null)
const modals = reactive({
  addAppointment:false,
 })
  const event= ref()
  const eventsCssClasses= ['leisure', 'sport', 'health']
  const onEventCreate= (event, deleteEventFunction)=>{

    event.value=event.startTimeMinutes
    console.log(event.value,':eventhi')
    return event
  }
  const cancelEventCreation= ()=> {
    closeCreationDialog()
    deleteEventFunction()
  }
  const closeCreationDialog= ()=> {
    modals.addAppointment = false
    selectedEvent = {}
  }
  const Doctors= [
  { label: 'John', color: 'blue', class: 'split1' },
  { label: 'Tom', color: 'green', class: 'split2' },
  { label: 'Kate', color: 'orange', class: 'split3' },
  { label: 'Jess', color: 'red', class: 'split4' }
]
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
const weekdays = reactive([ 6, 0, 1, 2, 3, 4, 5 ]),
        transition = ref('')

/*
  Calendar
*/

  const parsedStart = computed(() => {
    if (storeAppointments.selectedDate) {
      return getStartOfWeek(parseTimestamp(storeAppointments.selectedDate), weekdays, today2.value)
    }
    return undefined
  })

  const today2 = computed(() => {
    return parseTimestamp(today())
  })

  function onPrev () {
    const ts = addToDate(parsedStart.value, { day: -7 })
    storeAppointments.selectedDate = ts.date
  }
  function onNext () {
    const ts = addToDate(parsedStart.value, { day: 7 })
    storeAppointments.selectedDate = ts.date
  }
  const  vuecal = ref(null)

  const dragtocreateEvent = ref(true)

  function  handleSwipe ({evt, ...info} ){

  if (info.direction === 'right') {
    // transition.value=''
    dragtocreateEvent.value=false
    vuecal.value.next()
    console.log('right')
    dragtocreateEvent.value=true

  }
  else if (info.direction === 'left') {
    vuecal.value.previous()
    // transition.value=''
    console.log('left')
  }
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
}
.vuecal__event {
  background-color: rgba(173, 216, 230, 0.5);
  box-sizing: border-box;
  padding: 5px;

}
.business-hours {
  background-color: rgba(51, 255, 0, 0.089);
  border: solid rgba(255, 68, 0, 0.3);
  border-width: 2px 0;
}
.closed {
  background:
    #fff7f0
    repeating-linear-gradient(
      -45deg,
      rgba(255, 162, 87, 0.25),
      rgba(255, 162, 87, 0.25) 5px,
      rgba(255, 255, 255, 0) 5px,
      rgba(255, 255, 255, 0) 15px
    );
  color: #f6984c;
}
.vuecal__now-line {color: rgb(74, 92, 191);}
.vuecal .day-split-header {font-size: 15px;}
/* .vuecal__body .split1 {background-color: rgba(226, 242, 253, 0.7);}
.vuecal__body .split2 {background-color: rgba(232, 245, 233, 0.7);}
.vuecal__body .split3 {background-color: rgba(255, 243, 224, 0.7);}
.vuecal__body .split4 {background-color: rgba(255, 235, 238, 0.7);} */
.vuecal__no-event {display:true;}
.vuecal__time-cell-line.hours:before {border-color: #42b9835e;}
.vuecal__event--dragging {background-color: rgba(226, 19, 19, 0.877);}
.time {margin-right:7px ;margin-top:2.1px;font-size:11px;}
.hours {margin-left:4px ;}
/* width */
::-webkit-scrollbar {
  width: 10px;
  border-radius: 100px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 100px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 100px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
  border-radius: 100px;
}
.vuecal__event:hover .vuecal__event-resize-handle, .vuecal__event:focus .vuecal__event-resize-handle, .vuecal__event--focus .vuecal__event-resize-handle, .vuecal__event--resizing .vuecal__event-resize-handle {
    opacity: 0.4;
    transform: translateY(0);
    height: 1px;
    padding-bottom: 1px;
    bottom: 5px;
    border-color: rgba(179, 179, 179, 0.973);
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
</style>
