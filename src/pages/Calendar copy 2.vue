<template>
  <ion-page>
    <ion-header :translucent="true" collapse="fade">
     <ion-toolbar>
      <NavigationBar
  :selectedDate="storeAppointments.selectedDate"
  :transition="transition"
  />
      </ion-toolbar>
    </ion-header>
    <div class="calendar-container row">
      <div v-if="!mobile" class="col-4" >
        <FullCalendar
          ref="externalCalendar" id="externalCalendar"
          class="calendar q-pa-lg" 
          :options="srcCalendarOptions"
          @eventLeave="handleEventLeave"
          @eventReceive="handleEventReceive"
        />
      </div>
      <!-- {{ formattedCurrentTime }} -->
      <!-- <q-btn @click="handleWindowResize"> hi</q-btn> -->
      <FullCalendar ref="calendar" id="calendar" :options="calendarOptions" class="calendar col"  @eventReceive="handleEventReceive" @eventLeave="handleEventLeave">
        <!-- <template  v-slot:eventContent='arg'>
      <b>{{ arg.event.title }}</b>
    </template> -->
      </FullCalendar>
    </div>
  </ion-page>
</template>

<script setup>
import { ref, computed,onMounted,onActivated,watch ,onRenderTriggered} from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import { Platform } from 'quasar';
import listPlugin from '@fullcalendar/list';
import { IonPage, IonContent } from '@ionic/vue';
import rrulePlugin from '@fullcalendar/rrule';
import dayjs from 'dayjs';
import { useStoreSettings } from 'src/stores/storeSettings';
import NavigationBar from 'src/components/Calendar/NavigationBar.vue'
import { useStoreAppointments } from 'src/stores/storeAppointments';
import { storeToRefs } from 'pinia'


const storeAppointments=useStoreAppointments()
const storeSettings=useStoreSettings()
const {  selectedDate,loadingAppointments } = storeToRefs(storeAppointments)
const calendar = ref(null)
const externalCalendar = ref(null)
const today = dayjs().format('YYYY-MM-DDTHH:mm:ss')
const currentEvents = ref([])
// Data property for current time
const currentTime = ref(dayjs().format('h:mm'));

// Update current time every minute
// setInterval(() => {
//   currentTime.value = dayjs().format('h:mm');
//   console.log('updddaate')
// }, 60000); // Update every minute (60000 milliseconds)

// Computed property for formatted current time
const formattedCurrentTime = computed(() => {
  return currentTime.value;
});
const srcCalendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridDay',
  headerToolbar: {
    left: '',
    center: '',
    right: ''
  },
  editable: true,
  initialDate: storeAppointments.selectedDate,
  editable: true,
  droppable: true,
  events: [
    {
      groupId: 'availableForAppointment',
      display: 'background',
      resourceIds: ['a', 'b', 'c'],
      start: dayjs(today).subtract(30, 'day').format('YYYY-MM-DD'),
      end: dayjs(today).add(30, 'day').format('YYYY-MM-DD'),
      rrule: {
        freq: 'weekly',
        byweekday: ['mo', 'we', 'fr', 'sa', 'su', 'tu', 'th'],
        dtstart: dayjs(today).format('YYYY-MM-DDT15:00:00'),
        until: false
      },
      color:'#ffffff'
    },
  ],
  eventLeave(info) {
    console.log('event left!', info.event._def);
  },
  eventReceive(info) {
    console.log('event received!', info.event._def);
  }
});

const calendarOptions =computed(() => {
  return {
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
    resourceTimeGridPlugin,
    listPlugin,
    rrulePlugin
  ],
  headerToolbar:false,
  initialView: 'resourceTimeGridDay',
  initialDate: storeAppointments.selectedDate,
  editable: true,
  droppable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  nowIndicator: true,
  // nowIndicatorContent: {
  //   html: `
  //      <div class="fc-timegrid-now-currentTime">
  //       ${dayjs().format('h:mmA')}
  //     </div>
  // `
  // },
  resources: [
    { id: 'a', title: 'Dr.Omar' },
    { id: 'b', title: 'Dr.Qasim' },
    { id: 'c', title: 'Dr.Karam' }
  ],
  slotDuration: '00:15:00',
  slotLabelInterval:'01:00',
  slotLabelFormat:[{
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: false,
  meridiem: 'long'
}],
Integer:'1',
scrollTime:'14:00:00',//dayjs(today).format('HH:mm:ss')
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  // windowResize(arg) {
  //   alert('The calendar has adjusted to a window resize. Current view: ' + arg.view.type);
  // },
  // handleWindowResize: false,
  // firstHour: '15:00',
  events: [
    { title: 'event 1', start: '2024-06-01T10:00:00', end: '2024-06-01T12:00:00', resourceId: 'a' },
    { title: 'Hi', start: '2024-06-13T13:00:00', end: '2024-06-13T15:00:00', resourceId: 'b', constraint: 'availableForMeeting' },
    {
      title: 'Business Lunch',
      start: '2024-06-25T13:00:00',
      constraint: 'businessHours'
    },
    {
      title: 'Meeting',
      start: '2024-06-26T11:00:00',
      end: '2024-06-20T11:30:00',
      constraint: 'availableForAppointment',
      color: '#257e4a'
    },
    {
      title: 'Conference',
      start: '2024-06-25',
      end: '2024-06-20'
    },
    {
      title: 'Party',
      start: '2024-06-29T20:00:00'
    },
    {
      title: 'Appointment',
      start: dayjs(today).format('YYYY-MM-DDT15:00:00'),
      end: dayjs(today).format('YYYY-MM-DDT16:00:00'),
      resourceIds: ['a'],
      constraint: 'availableForAppointment',
      color: '#61aa69d9'
    },
    {
      groupId: 'availableForAppointment',
      display: 'background',
      rrule: {
        freq: 'weekly',
        byweekday: ['mo', 'we', 'fr', 'sa', 'su', 'tu', 'th'],
        dtstart: dayjs(today).format('YYYY-MM-DDT15:00:00'),
        until: false
      },
      duration: '06:00',
      resourceIds: ['a', 'b', 'c'],
      color: '#257e4a'
    }
  ],
  eventLeave(info) {
    console.log('event left!', info.event._def);
    // info.event._def.resourceIds = ['b'];
  },
  eventReceive(info) {
    console.log('event received!', info.event._def);
    // info.event._def.resourceIds = ['b'];
  },
 
    }});

// Methods
function handleWeekendsToggle() {
  calendarOptions.value.weekends = !calendarOptions.value.weekends;
}

function handleWindowResize() {
  const calendarApi = calendar.value.getApi();
 
  calendarApi.updateSize();
if(!mobile){
  const externalCalendarApi=externalCalendar.value.getApi() 
  externalCalendarApi.updateSize()};
}

function handleDateSelect(selectInfo) {
  let title = prompt('Please enter a new title for your event');
  let calendarApi = selectInfo.view.calendar;

  calendarApi.unselect();

  if (title) {
    calendarApi.addEvent({
      id: createEventId(),
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      resourceId: selectInfo.resource.id
    });
  }
}

function handleEventClick(clickInfo) {
  if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    clickInfo.event.remove();
  }
}

function handleEvents(events) {
  currentEvents.value = events;
}

// Mobile detection
const mobile = computed(() => {
  return Platform.is.mobile && !Platform.is.desktop;
});
// onMounted(() => {
//   setTimeout(() => {
//     handleWindowResize();
//   }, 1); // Adjust the delay as needed
// });
// onActivated(()=>{
//   setTimeout(() => {
//     handleWindowResize();
//   }, 1); // Adjust the delay as needed
// })
// onRenderTriggered(()=>{
//   setTimeout(() => {
//     handleWindowResize();
//   }, 1); // Adjust the delay as needed
// })
// Watch the formattedCurrentTime and update the calendar options when it changes
// Watch the formattedCurrentTime and refresh the calendar view
// watch(formattedCurrentTime, () => {
//   refreshCalendarView();
// });
// watch(storeSettings.miniState, (newValue) => {
//   if(newValue){
//   console.log('refresheedd')
//   refreshCalendarView();
// }
// });

function refreshCalendarView() {
  if (calendar.value) {
    const calendarApi = calendar.value.getApi();
    calendarApi.render();
  }
  if (externalCalendar.value) {
    const externalCalendarApi = externalCalendar.value.getApi();
    externalCalendarApi.render();
  }
}

onMounted(() => {
       storeAppointments.getdayAppointments(storeAppointments.selectedDate)
       console.log(storeAppointments.selectedDate,'dattt')
         watch(selectedDate, async (newValue, oldValue) => {
           console.log(selectedDate,'gi')
           const calendarApi = calendar.value.getApi();
           const externalCalendarApi = externalCalendar.value.getApi();
           calendarApi.gotoDate( storeAppointments.selectedDate )
           externalCalendarApi.gotoDate( storeAppointments.selectedDate )
         { await storeAppointments.getdayAppointments(newValue)}
         })
     })
setInterval(()=>{
currentTime.value = dayjs().format('h:mm');
document.documentElement.style.setProperty('--now-time', `"${dayjs().format('h:mm')}"`);
refreshCalendarView()
}, 100)
// onMounted(() => {
//   document.documentElement.style.setProperty('--now-time', `"${formattedCurrentTime.value}"`);
// });
// const nowTimeContent = computed(() => {
//   return formattedCurrentTime.value; // Replace this with your dynamic content logic
// });

</script>

<style scoped lang="scss">

.calendar-container {
  width: 100%;
  height: 100%;
}

.calendar {
  width: 100%;
  height: 100%;
}

.calendar2 {
  width: 15%;
  height: 5%;
}

.fc .fc-view-harness,
.fc .fc-view-harness-active {
  min-height: 100px !important;
}

.fc .fc-toolbar {
  display: none;
}

.fc .fc-license-message {
  display: none;
}

.fc .fc-scroller-liquid-absolute {
  inset: 0;
  padding-bottom: 42px;
}

.row > .col-4, .row > .col-xs-4 {
  height: auto;
  width: 20.3333%;
}
</style>

<style>
.fc-license-message {
  display: none;
}

.fc .fc-timegrid-now-indicator-line {
  border-color: #ff00008c;
  border-style: solid;
  border-width: 2px 0px 0px;
  left: 0px;
  position: absolute;
  right: 0px;
  z-index: 4;
  
}

.fc .fc-timegrid-now-indicator-arrow {
  --current-time: '210PM';
  position: absolute;
  z-index: 4;
  width: 12px;
  height: 20px;
  background-color: var(--fc-now-indicator-color);
  margin-top: -8px;
  left: 0;
  width: 79%;
  border-radius: 4px;
}

.fc .fc-timegrid-now-indicator-arrow::before {
    content: var(--now-time, 'default');
    position: absolute;
    z-index: 10000004;
    width: 40px;
    height: 20px;
    background-color: var(--fc-now-indicator-color);
    margin-top: -5px;
    left: -3px;
    width: 105%;
    font-weight: 500;
    color: white;
    text-align: center; /* Align text inside the pseudo-element */
}

.fc .fc-timegrid-now-indicator-arrow::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--fc-now-indicator-color);
  border-radius: 50% 50% 50% 0%;
  transform: rotate(220deg);
  top: -5px;
  left: 78%;
  z-index: 100;
}

.fc-theme-standard td, .fc-theme-standard th {
  border: 0.5px solid var(--fc-border-color);
}

.fc td, .fc th {
  padding: 0px;
  vertical-align: middle;
}
.fc-timegrid-event-harness-inset .fc-timegrid-event, .fc-timegrid-event.fc-event-mirror, .fc-timegrid-more-link {
    box-shadow: 0 0 0 0px var(--fc-page-bg-color);
   
    border:0px !important;
    border-left: 3px solid #61aa69d9 !important; /* 2px left border */
}
.fc-event-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.fc-event-title {
  padding-bottom: 5px;
}

.fc-event-time {
  padding-bottom: 5px;
}

.fc-event-icons {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding-top: 5px;
}

.fc-event-icons i {
  margin-left: 5px;
  color: #fff; /* or any color you prefer */
}
</style>
