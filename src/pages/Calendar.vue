<template>
  <ion-page ref="page">


       <ion-header :translucent="true">
      <ion-toolbar class="toolbar-container ">
        <NavigationBar  v-if="!mobile"
  :selectedDate="storeAppointments.selectedDate"
  />
      </ion-toolbar>
    </ion-header>
    <ion-content>
   <AppointmentSchedule :pageRef="page"/>
  </ion-content>
  <NavigationBar v-if="mobile"
  :selectedDate="storeAppointments.selectedDate"
  />
  </ion-page>
</template>

<script setup>
import { ref, computed,onMounted,reactive,watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { INITIAL_EVENTS, createEventId } from './event-utils';
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
import appointmentModal from 'src/components/appointmentModal.vue'
import MobileInvoiceModal from 'src/components/MobileInvoiceModal.vue';
import MobileAppointmentPopup from 'src/components/MobileAppointmentPopup.vue'
import MobileApppointmentModal from 'src/components/MobileAppointmentModal.vue'
import AppointmentSchedule from 'src/components/Scehduler/AppointmentSchedule.vue'

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
  resources:storeAuth.doctors.map(doctor => ({
  id: doctor.doctorId,
  title: doctor.name
})),
  slotDuration: '00:15:00',
  slotLabelInterval:'01:00',
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
function handleDateSelect(selectInfo) {
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
  if (calendar.value) {
    const calendarApi = calendar.value.getApi();
    calendarApi.render();
  }
  if (externalCalendar.value&&!mobile.value) {
    const externalCalendarApi = externalCalendar.value.getApi();
    externalCalendarApi.render();
  }
}

// onMounted(() => {
//        storeAppointments.getDayAppointments(storeAppointments.selectedDate)
//          watch(selectedDate, async (newValue, oldValue) => {
//            const calendarApi = calendar.value.getApi();
//            calendarApi.gotoDate( storeAppointments.selectedDate )
//            if(!mobile){
//             const externalCalendarApi = externalCalendar.value.getApi();
//             externalCalendarApi.gotoDate( storeAppointments.selectedDate )
//            }
//          { await storeAppointments.getDayAppointments(newValue)}
//          })
//          watch(modals.addAppointment, async (newValue, oldValue) => {
//          if (newValue=false) {
//           let calendarApi = selectInfo.view.calendar
//           calendarApi.unselect()
//           console.log('hi')
//          }
//          else  console.log('hi22')
//          })
//      })

setInterval(()=>{
currentTime.value = dayjs().format('h:mm');
document.documentElement.style.setProperty('--now-time', `"${dayjs().format('h:mm')}"`);
refreshCalendarView()
}, 100)

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
   if(mobile.value){
    const modal = await modalController.create({
      component: MobileAppointmentPopup,
      componentProps: {
        event:event // Replace 'yourValue' with the value you want to pass
      },
      // presentingElement: page.value.$el,
      isOpen: true,
      initialBreakpoint: 0.75,
      breakpoints: [0,0.75],
      backdropDismiss: true,
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    // modal.onDidDismiss(() => storeAppointments.CLEAR_DATA());

    if (role === 'confirm') {
      console.log('data', data);
      // message.value = `Hello, ${data}!`;
    }
  }
};

const openAppointmentModal = async (newAppointment) => {
    const modal = await modalController.create({
      component: MobileApppointmentModal,
      componentProps: {
        appointment:newAppointment// Replace 'yourValue' with the value you want to pass
      },
      presentingElement:page.value.$el,

    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss(handleEventUnselect ()
    // ||storeInvoices.CLEAR_DATA()
    )
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }

  };

</script>

<style scoped>
 /* ion-toolbar {
  --padding-end:0px;
  --padding-start:0px;
  --padding-top: 0px;
  --padding-bottom: 0px;
  } */

</style>
