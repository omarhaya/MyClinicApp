<template>

  <div class="calendar-container row">
    <!-- <div v-if="!mobile" class="col-4" >
      <FullCalendar
        ref="externalCalendar" id="externalCalendar"
        class="calendar q-pa-lg"
        :options="srcCalendarOptions"
        @eventLeave="handleEventLeave"
        @eventReceive="handleEventReceive"
      />
    </div> -->
    <!-- {{ formattedCurrentTime }} -->
    <!-- <q-btn @click="handleWindowResize"> hi</q-btn> -->
    <q-dialog v-model="modals.addAppointment"  >
      <q-card>
   <ModalAddAppointment
   v-if="modals.addAppointment"
   v-model="modals.addAppointment"
   :appointment="appointment"
   :startTime="appointment.eventTimeStart"
   :endTime="appointment.eventTimeEnd"
   :doctorId="appointment.doctorId"
   :startDate="appointment.eventDateStart"
   :endDate="appointment.eventDateEnd"
    /></q-card>
  </q-dialog>

  <ion-content  :fullscreen="true">
 <FullCalendar ref="calendar" id="calendar" :options="calendarOptions" class="calendar col" >
  <template v-slot:eventContent="arg">
    <!-- <q-popup-proxy  v-model="popupProxy[arg.event.extendedProps.appointmentId]" transition-show="flip-up" transition-hide="flip-down">
      <q-banner class="bg-brown text-white">
        <template v-slot:avatar>
          <q-icon name="signal_wifi_off" />
        </template>
        You have lost connection to the internet. This app is offline.
      </q-banner>
    </q-popup-proxy> -->
    <!-- <q-tooltip v-if="arg.event.display!=='background'">
        Some text as content of Tooltip
      </q-tooltip> -->
      <v-menu
      v-if="arg.event.display!=='background'"
    v-model="storeAppointments.menu[arg.event.extendedProps.appointmentId]"
    :close-on-content-click="false"
    location="end"
  >
    <template v-slot:activator="{ props }">

    <div
    @click="openAppointmentPopup(arg.event)"
    color="indigo"
    v-bind="props" class="event-content">
      <div v-if="arg.event.display!=='background'"  :class="borderClasses(arg)" class="appointment-border"></div>
    <div :class="['fc-event-main-frame', { 'short-event': isShortEvent(arg.event) }]">
        <div class="fc-event-title-container">
          <div v-if="arg.event.display!=='background'" class="fc-event-time"><q-icon class="q-pr-xs" name="schedule"/>{{ formatEventTime(arg.event) }}</div>
          <q-badge v-if="arg.event.display!=='background'&&arg.event.title" :color="arg.event.extendedProps.background" class="fc-event-title fc-sticky"><q-icon class="q-pr-xs" name="person"></q-icon>{{ arg.event.title }}</q-badge>
        </div>
      </div>
    </div>
  </template>
  <Popover v-if="!mobile" :event="arg.event"/>
  </v-menu>
  </template>
    </FullCalendar>
  </ion-content>
  </div>

</template>

<script setup>
import { ref, computed,onMounted,reactive,watch,toRefs } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { INITIAL_EVENTS, createEventId } from '../../pages/event-utils';
import { Platform } from 'quasar';
import listPlugin from '@fullcalendar/list';
import {IonList,
 IonInfiniteScroll,
 IonInfiniteScrollContent,IonPage,IonModal,IonCheckbox,IonItem, IonHeader, IonToolbar, IonTitle, IonContent ,IonButtons, IonButton,modalController} from '@ionic/vue';
import rrulePlugin from '@fullcalendar/rrule';
import dayjs from 'dayjs';
import { useStoreSettings } from 'src/stores/storeSettings';
import NavigationBar from 'src/components/Calendar/NavigationBar.vue'
import { useStoreAppointments } from 'src/stores/storeAppointments';
import { storeToRefs } from 'pinia'
import { useStoreAuth } from 'src/stores/storeAuth';
import ModalAddAppointment from 'src/components/PaymentsAndAppointments/ModalAddAppointment.vue'
import Popover from 'src/components/Calendar/Popover.vue'
import MobileInvoiceModal from 'src/components/MobileInvoiceModal.vue';
import MobileAppointmentPopup from 'src/components/MobileAppointmentPopup.vue'
import MobileApppointmentModal from 'src/components/MobileAppointmentModal.vue'
import scrollGridPlugin from '@fullcalendar/scrollgrid';

/*
 props
*/
const props = defineProps({
pageRef:{
type: Object,
required: true
},
})

const storeAppointments=useStoreAppointments()
const storeSettings=useStoreSettings()
const storeAuth=useStoreAuth()
const {  selectedDate,loadingAppointments } = storeToRefs(storeAppointments)
const doctors=computed(()=>{ return storeAuth.doctors})
const calendar = ref(null)
const externalCalendar = ref(null)
const today = dayjs().format('YYYY-MM-DDTHH:mm:ss')
const page = ref();
const appointment =ref({
resourceId:null,
eventTimeStart:null,
eventTimeEnd:null,
eventDateStart:null,
eventDateEnd:null,
doctorId:null,
appointmentId:null,
allDay:null,
})
const modals = reactive({
addAppointment:false,
})
const currentEvents = ref([])
const popupProxy= ref({})
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
  rrulePlugin,
  scrollGridPlugin,
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
resources:storeAuth.doctors.map(doctor => ({
id: doctor.doctorId,
title: doctor.name
})),
resourceOrder:'index',
slotDuration: '00:15:00',
slotLabelInterval:'01:00',
expandRows: true, // Expand rows to fit the content
slotLabelFormat:[{
hour: 'numeric',
minute: '2-digit',
omitZeroMinute: false,
meridiem: 'long'
}],
scrollTime:'14:00:00',//dayjs(today).format('HH:mm:ss')
select: handleDateSelect,
// // eventClick: handleEventClick,
eventDragStart:handleEventDragStart,
eventsSet: handleEvents,
eventAdd: handleEventAdd,
eventChange: handleEventChange,
unselectAuto:false,
events: storeAppointments.dayAppointments[storeAppointments.selectedDate],
eventLeave(info) {
  console.log('event left!', info.event._def);
  // info.event._def.resourceIds = ['b'];
},
eventReceive(info) {
  console.log('event received!', info.event._def);
  // info.event._def.resourceIds = ['b'];
},
eventClassNames: function(arg) {
  return  `text-red bg-${arg.event.extendedProps.background}-3`
},
dayMinWidth: 200,
  }})

  // Method to get the class name based on the event value
const getEventClassNames = (arg) => {
switch (arg.event.extendedProps.value) {
  case 'high':
    return 'event-high';
  case 'medium':
    return 'event-medium';
  case 'low':
    return 'event-low';
  default:
    return 'event-default';
}
}
console.log(storeAppointments.dayAppointments[storeAppointments.selectedDate],'eventoo')
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
// Add event handler for event drag start
const handleEventDragStart = (info) => {
storeAppointments.menu[info.event.extendedProps.appointmentId]=false
};
const eventSelect=ref(false)
function handleDateSelect(selectInfo) {
 eventSelect.value=true
const eventTimeStart = new Date(selectInfo.startStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const eventTimeEnd = new Date(selectInfo.endStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const eventDateStart = new Date(selectInfo.startStr).toISOString().split('T')[0];
  const eventDateEnd = new Date(selectInfo.endStr).toISOString().split('T')[0];
  const newAppointment = {
appointmentId:createEventId(),
eventTimeStart,
eventTimeEnd,
eventDateStart,
eventDateEnd,
allDay:selectInfo.allDay,
doctorId:selectInfo.resource.id,
  }
  appointment.value=newAppointment
  // storeAppointments.addAppointment(newAppointment);

console.log(appointment.value,'apppppp')

if(mobile.value){
 openAppointmentModal(newAppointment)
}
else {
modals.addAppointment=true
}


}
watch(() => modals.addAppointment, (currentValue, oldValue) => {
       if(currentValue!==true){
        handleEventUnselect ()
       }
   })


function handleEventUnselect () {
  console.log('finish')
  let calendarApi = calendar.value.getApi()
  calendarApi.unselect()
}
function handleEventClick(clickInfo) {
if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
  // clickInfo.event.remove();
  // console.log(clickInfo,'clickInfo')
  handleEventRemove(clickInfo.event.extendedProps.appointmentId);
}
}

function handleEvents(events) {
currentEvents.value = events;
}
function handleEventAdd(addInfo) {
const event = addInfo.event;
const resourceIds=event._def.resourceIds
console.log(addInfo,'evvvent')
  const newAppointmentDetails = {
    title: event.title,
    startDate: dayjs(event.startStr).format('YYYY-MM-DD'),
    endDate: dayjs(event.endStr).format('YYYY-MM-DD'),
    startTime: dayjs(event.startStr).format('HH:mm:ss'),
    endTime: dayjs(event.endStr).format('HH:mm:ss'),
    doctor: resourceIds, // Example doctor, replace with actual value
    status: 'booked'
  }

console.log(newAppointmentDetails,'newAppointmentDetails')
storeAppointments.addAppointment(newAppointmentDetails);
}

async function handleEventChange(changeInfo) {
const event = changeInfo.event;
storeAppointments.menu[event.extendedProps.appointmentId]=false
const resourceId=event._def.resourceIds
const updatedAppointment = {
    appointmentId: event.extendedProps.appointmentId,
    title: event.title,
    patientDetails:event.extendedProps.patientDetails,
    startDate: dayjs(event.startStr).format('YYYY-MM-DD'),
    endDate: dayjs(event.endStr).format('YYYY-MM-DD'),
    startTime: dayjs(event.startStr).format('HH:mm:ss'),
    endTime: dayjs(event.endStr).format('HH:mm:ss'),
    doctorId: resourceId, // Example doctor, replace with actual value
    status: 'booked'
};
await storeAppointments.dropAppointment(updatedAppointment);
console.log(updatedAppointment,'updatedAppointment')
refreshCalendarEvents ()
}

function refreshCalendarEvents (){
const calendarApi = calendar.value.getApi();
calendarApi.removeAllEvents();
calendarApi.addEventSource(storeAppointments.dayAppointments[storeAppointments.selectedDate])
}

function handleEventRemove(removeInfo) {
storeAppointments.deleteAppointment(removeInfo)
}

// Mobile detection
const mobile = computed(() => {
return Platform.is.mobile && !Platform.is.desktop;
})

function refreshCalendarView() {
if (calendar.value&&!storeAppointments.modal) {
  const calendarApi = calendar.value.getApi();
  calendarApi.render();
}
if (externalCalendar.value&&!mobile.value) {
  const externalCalendarApi = externalCalendar.value.getApi();
  externalCalendarApi.render();
}
}

onMounted(() => {
     storeAppointments.getDayAppointments(storeAppointments.selectedDate)
       watch(selectedDate, async (newValue, oldValue) => {
         const calendarApi = calendar.value.getApi();
         calendarApi.gotoDate( storeAppointments.selectedDate )
         if(!mobile){
          const externalCalendarApi = externalCalendar.value.getApi();
          externalCalendarApi.gotoDate( storeAppointments.selectedDate )
         }
       { await storeAppointments.getDayAppointments(newValue)}
       })
       watch(modals.addAppointment, async (newValue, oldValue) => {
       if (newValue=false) {
        let calendarApi = selectInfo.view.calendar
        calendarApi.unselect()
        console.log('hi')
       }
       else  console.log('hi22')
       })
   })

setInterval(()=>{
currentTime.value = dayjs().format('h:mm');
document.documentElement.style.setProperty('--now-time', `"${dayjs().format('h:mm')}"`);
refreshCalendarView()
}, 1)

function  borderClasses  (arg) {
arg.event.extendedProps.background
 return `bg-${arg.event.extendedProps.background}`
    }
function eventTime (arg) {
console.log(arg,'arg')
return arg.event.start
}
function formatEventTime(event) {
    let start = event.start
    let end = event.end
    let options = { hour: '2-digit', minute: '2-digit' }

    if (!start) return ''

    if (end) {
      return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString([], options)}`
    } else {
      return start.toLocaleTimeString([], options)
    }
  }
function   isShortEvent(event) {
    return !event.end || event.end.getTime() - event.start.getTime() <= 15 * 60 * 1000; // 1 hour or less
  }

/*
Modal
*/


const openAppointmentPopup = async (event) => {
if (mobile.value||storeAppointments.menu[event.extendedProps.appointmentId]==true)
{
modalController.dismiss(null, 'cancel')
 if(storeAppointments.menu[event.extendedProps.appointmentId]!==true){
  storeAppointments.menu[event.extendedProps.appointmentId]=true
  const modal = await modalController.create({
    component: MobileAppointmentPopup,
    componentProps: {
      event:event // Replace 'yourValue' with the value you want to pass
    },
    // presentingElement: page.value.$el,
    isOpen: storeAppointments.menu[event.extendedProps.appointmentId],
    initialBreakpoint: 0.25,
    breakpoints: [0,0.25, 0.5, 0.75],
    backdropDismiss: true,
    backdropBreakpoint:0.5,
  })

  console.log(storeAppointments.menu,'hiii')
  modal.present();
  const { data, role } = await modal.onWillDismiss();
  // modal.onDidDismiss(() => storeAppointments.CLEAR_DATA());

  if (role === 'confirm') {
    console.log('data', data);
    // message.value = `Hello, ${data}!`;
  }
}
}
}
// const closeAllEventPopups = () => {
//   console.log('hiiiii')
//   Object.keys(storeAppointments.menu).forEach((key) => {
//     storeAppointments.menu[key] = false;
//   });
// };
const { pageRef } = toRefs(props);
const openAppointmentModal = async (newAppointment) => {
  const modal = await modalController.create({
    component: MobileApppointmentModal,
    isOpen:storeAppointments.modal,
    componentProps: {
      appointment:newAppointment// Replace 'yourValue' with the value you want to pass
    },
    presentingElement: pageRef.value.$el,
  });
  storeAppointments.modal=true
  modal.present();
  const { data, role } = await modal.onWillDismiss();
  modal.onDidDismiss(handleEventUnselect ()
  // ||storeInvoices.CLEAR_DATA()
  )
  if (role === 'confirm') {
    storeAppointments.modal=false
    console.log('data',data)
    // message.value = `Hello, ${data}!`;
  }

};

</script>

<style scoped lang="scss">

.calendar-container {
display: flex;
flex-direction: row;
flex-wrap: wrap;
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



.fc-timegrid-event-harness-inset .fc-timegrid-event,
.fc-timegrid-event.fc-event-mirror,
.fc-timegrid-more-link {
  box-shadow:0 0px 2px 0 rgba(0, 0, 0, .14), 0 1px 10px -5px hsla(0, 0%, 60%, .4);
  border: 0 !important;
  /* border-left: 3px solid red !important; 2px left border */
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
.event-content {
display: flex;
align-items: stretch; /* Ensure children stretch to the same height */
height: 100%; /* Ensures the event content takes the full height of the event slot */
}

.appointment-border {
margin:3px 0px 3px 3px;
width: 5px; /* Adjust the width as needed */
background-color: #000; /* Change color as needed */
margin-right: 8px; /* Adjust the spacing between the border and the title */
border-radius: 3px;
}

.fc-event-main-frame {
display: flex;
flex-direction: column;
height: 100%;
justify-content: center;
padding: 2px 4px;
}

.fc-event-title-container {
display: flex;
flex-direction: column;
}

.fc-event-title {
font-weight: bold;
}

/* .fc-event-time {
color: orange;
} */

/* Adjust styles for short events */
.short-event .fc-event-title-container {
flex-direction: row;
align-items: center;
}

.short-event .fc-event-time {
margin-left: 4px;
}
/* Custom style for the modal handle */
ion-modal::part(handle) {
background-color: white;
}
.fc .fc-scroller::-webkit-scrollbar {
  display: none;
}
/* New style to adjust the height of hour slots */
.fc .fc-timegrid-slot {
height: 25px !important; /* Adjust this value to change the slot height */
}


.fc .fc-timegrid-slot-lane {
height: 25px !important; /* Adjust this value to change the slot height */
}
</style>
