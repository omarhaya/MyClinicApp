<template>
     <!-- add/edit an appointment -->
     <q-dialog v-model="modals.showAppointment"  >
      <CalendarAppointmentCard
      v-if="modals.showAppointment"
      v-model="modals.showAppointment"
      :appointment="Appointment"
       />
     </q-dialog>
     <q-dialog v-model="storeAppointments.appointmentModal"  >
      <appointmentModal
      v-if="storeAppointments.appointmentModal"
      v-model="storeAppointments.appointmentModal"
      :time="time"
      :duration="duration"
      :date="storeAppointments.selectedDate"
       />
      </q-dialog >
      <q-dialog v-model="modals.editAppointment"  >
       <ModalEditAppointment
       v-if="modals.editAppointment"
       v-model="modals.editAppointment"
       />
     </q-dialog>

        <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut">
    <q-page
  class=" column no-wrap"
  :style-fn="pageStyleFn">

   <NavigationBar
   :selectedDate="storeAppointments.selectedDate"
   :transition="transition"
   @onNext="onNext"
   @onPrev="onPrev"
   @selectedDate="changeSelectedDate($event)"
   />

   <q-calendar-day
          ref="calendarRef"
          v-model="storeAppointments.selectedDate"
          bordered
          animated
          hoverable
          v-touch-swipe.mouse.left.right="handleSwipe"
          view="day"
          time-clicks-clamped
          :selected-start-end-dates="startEndDates"
          transition-next="slide-left"
          transition-prev="slide-right"
          no-active-date
          :weekdays="[0,1,2,3,4,5,6]"
          :interval-minutes="15"
          :interval-start="36"
          :interval-count="60"
          :interval-height="20"
          :column-count="1"
          :column-header-after="true"
          @change="onChange"
          @moved="onMoved"
          @mousedown-time="onMouseDownTime"
          @mouseup-time="onMouseUpTime"
          @mousemove-time="onMouseMoveTime"
          @click-date="onClickDate"
          @click-interval="onClickInterval"
          @click-head-intervals="onClickHeadIntervals"
          @click-head-day="onClickHeadDay">
          <template #head-day-event="{ scope: { timestamp } }">
            <div style="display: flex; justify-content: center; flex-wrap: wrap; padding: 2px;">
              <template
                v-for="appointment in appointmentsMap[timestamp.date]"
                :key="appointment.id"
              >
                <q-badge
                  v-if="!appointment.time"

                  :class="badgeClasses(appointment, 'header')"
                  :style="badgeStyles(appointment, 'header')"
                  style="width: 100%; cursor: pointer; height: 12px; font-size: 10px; margin: 1px;"
                >
                  <div class="title q-calendar__ellipsis">
                    {{ appointment.title }}
                    <q-tooltip>{{ appointment.details }}</q-tooltip>
                  </div>
                </q-badge>
                <q-badge
                  v-else
                  :class="badgeClasses(appointment, 'header')"
                  :style="badgeStyles(appointment, 'header')"
                  style="margin: 1px; width: 10px; max-width: 10px; height: 10px; max-height: 10px; cursor: pointer"
                  @click="scrollToAppointment(appointment)"
                >
                  <q-tooltip>{{ timeFormat(appointment.time) + ' - ' + appointment.details }}</q-tooltip>
                </q-badge>
              </template>
            </div>
          </template>

          <template #day-body="{ scope: { timestamp, timeStartPos, timeDurationHeight,doctor } }">

            <template
              v-for="appointment in getAppointments(timestamp.date)"
              :key="appointment.id"
            >

              <div
                v-if="appointment.time !== ''"
                class="my-appointment"
                :class="badgeClasses(appointment, 'body') "
                :style="badgeStyles(appointment, 'body', timeStartPos, timeDurationHeight)"
              >
              <div class="appointment-border" :class="borderClasses(appointment, 'body') "></div>

                <div @click="modals.showAppointment=true;Appointment=appointment" :class="{'line-through' : appointment.completed}" style="font-size: 16px;font-weight: 500" class="title q-calendar__ellipsis">
              <div v-if="$q.screen.gt.xs">
                     {{timeFormat(appointment.time)+' - '+ appointment.title  }}
                   </div>
                   <div v-else class="title-appointment">{{appointment.title}}</div>
       <!-- <q-btn :disable="appointment.completed"  @click="deleteAppointment(appointment.id)" flat color="white" class="absolute-right appointment-btn" icon="delete" /> -->
        <div v-if="appointment.moneypaid>0">
        <div  v-if="$q.screen.gt.xs">
          <q-badge class="badge-payment absolute-top-right"   color="green"  ><div class=" text-weight-bold">Money Paid</div>: {{(appointment.moneypaid)}} {{appointment.currencypaid}}</q-badge>
        </div>
        <div  v-else>
          <q-badge class="badge-payment absolute-top-right"  color="green"  ><div class="badge-payment text-weight-bold">Paid</div>: {{(appointment.moneypaid)}} {{appointment.currencypaid}}</q-badge>
        </div>
        </div>

        <q-tooltip>{{ appointment.details }}</q-tooltip>
                </div>
            <q-btn  @click="storeAppointments.completeAppointment(appointment)" flat class="absolute-right appointment-btn" icon="done" @contextmenu="handler($event)" >
            <q-tooltip anchor="top middle"  class="bg-green text-black shadow-4" self="bottom middle" :offset="[10, 10]">
              <strong>Right-Click to Add Payment</strong>
              (<q-icon name="payments"/>)
            </q-tooltip>
             </q-btn>
              </div>
            </template>
          </template>
          <template #head-intervals>
                  <q-btn flat style="color: green; width:100%" label="Today" />
          </template>

            <template #day-container="{ scope: { days }}">
            <template v-if="hasDate(days)">
              <div
                class="day-view-current-time-indicator"
                :style="style"
              />
              <div
                class="day-view-current-time-line"
                :style="style"
              />
            </template>
             </template>
          </q-calendar-day>
    </q-page>
   </transition>
</template>

<script setup>
import {
  QCalendarDay,
  addToDate,
  createNativeLocaleFormatter,
  getEndOfWeek,
  getStartOfWeek,
  getWeekdaySkips,
  parseTimestamp,
  isBetweenDates,
  today,
  parsed,
  parseTime,
  parseDate,
  getDayTimeIdentifier,
  getDateTime,
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass'
import { useStoreAppointments } from 'src/stores/storeAppointments'
import { ref, reactive,onMounted,onBeforeUnmount,computed,watch } from 'vue'
import appointmentModal from 'src/components/appointmentModal.vue'
import NavigationBar from 'src/components/Calendar/NavigationBar.vue'
import CalendarAppointmentCard from './CalendarAppointmentCard.vue'
import ModalEditAppointment from '../PaymentsAndAppointments/ModalEditAppointment.vue'

  /*
   Store
  */
   const storeAppointments=useStoreAppointments()

  /*
   CalendarRefs
  */

        const selectedDate=computed(()=>{ return storeAppointments.selectedDate})
        const changeSelectedDate=(e)=>{
          storeAppointments.selectedDate=e
          return storeAppointments.selectedDate
        }
        const  calendarRef = ref(null),
          weekdays = reactive([ 6, 0, 1, 2, 3, 4, 5 ]),
          transitionPrev = ref('slide-right'),
          transitionNext = ref('slide-left'),
          transition = ref(''),
          anchorTimestamp = ref(null),
          otherTimestamp = ref(null),
          mouseDown = ref(false),
          mobile=ref(false),
          anchorDayTimeIdentifierVisible=ref(false)


    /*
      Appointments
    */

      const appointments = computed(()=>{return storeAppointments.appointments})
      const time=ref('')
      const duration=ref('')

      onMounted(() => {
          storeAppointments.getdayAppointments(storeAppointments.selectedDate)
        watch(selectedDate, (newValue, oldValue) => {
          storeAppointments.getdayAppointments(newValue)
        })
        })


    /*
    selecting time
    */
    function leftClick (e) {
      return e.button === 0
    }

    const startEndDates = computed(() => {
      const dates = []
      if (anchorDayTimeIdentifier.value !== false && otherDayTimeIdentifier.value !== false && anchorDayTimeIdentifierVisible.value !==false) {
        if (anchorDayTimeIdentifier.value <= otherDayTimeIdentifier.value) {
          dates.push(getDateTime(anchorTimestamp.value), getDateTime(otherTimestamp.value))
        }
        else {
          dates.push(getDateTime(otherTimestamp.value), getDateTime(anchorTimestamp.value))
        }
      }
      return dates
    })

    const anchorDayTimeIdentifier = computed(() => {
      if (anchorTimestamp.value !== null) {
        return getDayTimeIdentifier(anchorTimestamp.value)
      }
      return false
    })

    const otherDayTimeIdentifier = computed(() => {
      if (otherTimestamp.value !== null) {
        return getDayTimeIdentifier(otherTimestamp.value)
      }
      return false
    })

    function onMouseDownTime ({ scope, event }) {
      anchorDayTimeIdentifierVisible.value=true
      console.log('onMouseDownTime', { scope, event })
      if (leftClick(event)) {
        if (mobile.value === true
          && anchorTimestamp.value !== null
          && otherTimestamp.value !== null
          && getDateTime(anchorTimestamp.value) === getDateTime(otherTimestamp.value)) {
          otherTimestamp.value = scope.timestamp
          mouseDown.value = false
          return
        }
        // mouse is down, start selection and capture current
        mouseDown.value = true
        anchorTimestamp.value = scope.timestamp
        otherTimestamp.value = scope.timestamp
        console.log(otherTimestamp.value.time,'hieee')
      }
    }

    function onMouseUpTime ({ scope, event }) {
      if (mobile.value !== true && leftClick(event)) {
        // mouse is up, capture last and cancel selection
        otherTimestamp.value = scope.timestamp

        let hour1=otherTimestamp.value.hour
        let hour2=anchorTimestamp.value.hour
        let min1=otherTimestamp.value.minute
        let min2=anchorTimestamp.value.minute
         if(hour1>=hour2){ duration.value = ((hour1-hour2)*60)+(min1-min2+15)
                          time.value=anchorTimestamp.value.time
                    }
         if(hour1<hour2){ duration.value = (-(hour1-hour2)*60)+(-(min1-min2)+15)
                          time.value=otherTimestamp.value.time
                    }
         if(hour1==hour2&&min1<min2){ duration.value = (-(hour1-hour2)*60)+(-(min1-min2)+15)
                          time.value=otherTimestamp.value.time
                          console.log('hi earth')
                    }

        console.log(time.value,duration.value,'hiSS')
        storeAppointments.TOGGLE_APPOINTMENT()
        mouseDown.value = false
      }
    }

    function onMouseMoveTime ({ scope, event }) {
      if (mobile.value !== true && mouseDown.value === true) {
        otherTimestamp.value = scope.timestamp
      }
    }


  /*
    Calendar
  */
    const weekdaySkips = computed(() => {
      return getWeekdaySkips(weekdays)
    })

    const parsedStart = computed(() => {
      if (storeAppointments.selectedDate) {
        return getStartOfWeek(parseTimestamp(storeAppointments.selectedDate), weekdays, today2.value)
      }
      return undefined
    })

    const parsedEnd = computed(() => {
      if (selectedDate.value) {
        return getEndOfWeek(parseTimestamp(storeAppointments.selectedDate), weekdays, today2.value)
      }
      return undefined
    })

    const today2 = computed(() => {
      return parseTimestamp(today())
    })


    function onPrev () {
      const ts = addToDate(parsedStart.value, { day: -7 })
      storeAppointments.selectedDate = ts.date
      transition.value = 'q-calendar--' + transitionPrev.value
    }

    function onNext () {
      const ts = addToDate(parsedStart.value, { day: 7 })
      storeAppointments.selectedDate = ts.date
      transition.value = 'q-calendar--' + transitionNext.value
    }

    function onMoved (data) {
      console.log('onMoved', data)
    }
    function onChange (data) {
     transition.value = ''
      console.log('onChange', data)
    }
    function onClickDate (data) {
      console.log('onClickDate', data)
    }
    // function onClickTime (data,timehour) {

    //   console.log('onClickTime', data)
    // }
    function onClickInterval (data) {
      console.log('onClickInterval', data)
    }
    function onClickHeadIntervals (data) {
      transition.value=''
      storeAppointments.selectedDate=today()
      console.log('onClickHeadIntervals', data)
    }
    function onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    }

    function  handleSwipe ({evt, ...info} ){

            if (info.direction === 'right') {
              calendarRef.value.prev()
              transition.value=''
              anchorDayTimeIdentifierVisible.value=false
            }
            else if (info.direction === 'left') {
              calendarRef.value.next()
              transition.value=''
              anchorDayTimeIdentifierVisible.value=false
            }
      }


    const pageStyleFn = (offset, height) => {
          return { height: `${ height - offset }px` }
        }
  /*
   Computed
   */
// convert the appointments into a map of lists keyed by date
   const appointmentsMap = computed(() => {
      const map = {}
      // this.appointments.forEach(appointment => (map[ appointment.date ] = map[ appointment.date ] || []).push(appointment))
      appointments.value.forEach(appointment => {
        if (!map[ appointment.date ]) {
          map[ appointment.date ] = []
        }
        map[ appointment.date ].push(appointment)
        if (appointment.days) {
          let timestamp = parseTimestamp(appointment.date)
          let days = appointment.days
          do {
            timestamp = addToDate(timestamp, { day: 1 })
            if (!map[ timestamp.date ]) {
              map[ timestamp.date ] = []
            }
            map[ timestamp.date ].push(appointment)

          } while (--days > 0)
        }
      })
      return map
    })

    function  badgeClasses  (appointment, type) {
        const isHeader = type === 'header'
        if (appointment.completed===true){
        return {
          [ `text-grey-4 bg-${appointment.bgcolor}-3` ]: true,
          'full-width': !isHeader && (!appointment.side || appointment.side === 'full'),
          'left-side': !isHeader && appointment.side === 'left',
          'right-side': !isHeader && appointment.side === 'right',
          'rounded-border': true
        }}
        else{
        return {
          [ `text-${ appointment.bgcolor } bg-${ appointment.bgcolor }-2` ]: true,
          'full-width': !isHeader && (!appointment.side || appointment.side === 'full'),
          'left-side': !isHeader && appointment.side === 'left',
          'right-side': !isHeader && appointment.side === 'right',
          'rounded-border': true
        }}
      }
    function badgeStyles (appointment, type, timeStartPos = undefined, timeDurationHeight = undefined) {
        const s = {}
        if (timeStartPos && timeDurationHeight) {
          s.top = timeStartPos(appointment.time) + 'px'
          s.height = timeDurationHeight(appointment.duration-1) + 'px'
        }
        s[ 'align-items' ] = 'flex-start'
        return s
      }
      function  borderClasses  (appointment) {
        if (appointment.completed===true){
        return {
          [ `text-${ appointment.bgcolor }-4 ` ]: true,
        }}
        else{
        return {
          [ `text-${ appointment.bgcolor } ` ]: true,
        }}
      }
    function  getAppointments (dt) {
        // get all appointments for the specified date
        const appointments = appointmentsMap.value[ dt ] || []
        if (appointments.length === 1) {
          appointments[ 0 ].side = 'full'
        }
        else if (appointments.length === 2) {
          // this example does no more than 2 appointments per day
          // check if the two appointments overlap and if so, select
          // left or right side alignment to prappointment overlap
          const startTime = addToDate(parsed(appointments[ 0 ].date), { minute: parseTime(appointments[ 0 ].time) })
          const endTime = addToDate(startTime, { minute: appointments[ 0 ].duration })
          const startTime2 = addToDate(parsed(appointments[ 1 ].date), { minute: parseTime(appointments[ 1 ].time) })
          const endTime2 = addToDate(startTime2, { minute: appointments[ 1 ].duration })
          if (isBetweenDates(startTime2, startTime, endTime, true) || isBetweenDates(endTime2, startTime, endTime, true)) {
            appointments[ 0 ].side = 'left'
            appointments[ 1 ].side = 'right'
          }
          else {
            appointments[ 0 ].side = 'full'
            appointments[ 1 ].side = 'full'
          }
        }
        return appointments
      }
    const  scrollToAppointment =(appointment)=> {
        calendarRef.value.scrollToTime(appointment.time, 350)
      }

    const  onToday= () =>{
       calendarRef.value.moveToToday()
      }
  /*
    timelineRefs
  */
   const currentDate = ref(null),
      currentTime = ref(null),
      timeStartPos = ref(0)
    let intervalId = null

  /*
  timeline
  */
   onMounted(() => {
  adjustCurrentTime()
      // now, adjust the time every minute
      intervalId = setInterval(() => {
        adjustCurrentTime()
      }, 60000)
 })

    onBeforeUnmount(() => {
      clearInterval(intervalId)
    })
   const style = computed(() => {
      return {
        top: timeStartPos.value + 'px'
      }
    })

 function hasDate (days) {
      return currentDate.value
        ? days.find(day => day.date === currentDate.value)
        : false
    }
 function adjustCurrentTime () {
      const now = parseDate(new Date())
      currentDate.value = now.date
      currentTime.value = now.time
      timeStartPos.value = calendarRef.value.timeStartPos(currentTime.value, false)
    }

 /*
  Pop up
*/

 const modals = reactive({
  deletePatient:false,
  addPatient:false,
  addAppointment:false,
  addPayment:false,
  showAppointment:false,
  editAppointment:false
 })
 watch(() => storeAppointments.appointmentModal, (currentValue, oldValue) => {
        if(currentValue===false){
          anchorDayTimeIdentifierVisible.value=false
        }
    })

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

</script>

<style lang="sass" >
.title-appointment
  position: absolute
  margin-left: 40px
  left:5px
.badge-payment
  margin-top:0
  border-top-right-radius: 0 !important
  border-bottom-right-radius: 0
  border-top-left-radius: 0
// Appointment css
.my-appointment
  z-index: 0
  position: absolute
  font-size: 12px
  justify-content: center
  margin: 1px 1px
  text-overflow: ellipsis
  overflow: hidden
  cursor: pointer

.title
  position: relative
  display: flex
  justify-content: center
  align-items: center
  height: 100%
.appointment-border
  margin: 0px 1px
  border: 0
  border-bottom: 2px solid
.text-white
  color: white
.bg-blue
  background: blue
.bg-green
  background: green
.bg-orange
  background: orange
.bg-red
  background: red
.bg-teal
  background: teal
.bg-grey
  background: grey
.bg-purple
  background: purple

.full-width
  left: 0
  width: calc(100% - 2px)
.left-side
  left: 0
  width: calc(50% - 3px)
.right-side
  left: 50%
  width: calc(50% - 3px)
.rounded-border
  border-radius: 3px
//calendar css
.q-calendar-day__interval--text
  font-size: 12px
.line-through
  text-decoration: line-through
  color: #f3f3f3ba
.appointment-btn
  z-index: 2
  padding:0px 10px
  min-height:0
  font-size: 10px
// current day-time indicator
.day-view-current-time-indicator
  position: absolute
  left: -5px
  height: 10px
  width: 10px
  margin-top: -4px
  background-color: rgba(0, 0, 255, .5)
  border-radius: 50%

.day-view-current-time-line
  position: absolute
  left: 5px
  border-top: rgba(0, 0, 255, .5) 2px solid
  width: calc(100% - 5px)

.q-dark,
.body--dark,
.q-calendar--dark
  .day-view-current-time-indicator
    background-color: rgba(255, 255, 0, .85)

  .day-view-current-time-line
    border-top: rgba(255, 255, 0, .85) 2px solid
.head-intervals
  display: flex
  justify-content: space-around
  flex-direction: column
  width: 100%
  font-size: 13px
  font-weight: 700
  align-content: space-between
  align-items: center

.q-calendar-day__day-interval--section.q-range-first, .q-calendar-day__day-interval--section.q-range-last, .q-calendar-day__day-interval--section.q-range
  background: #fa9b2da3
  min-height: 20px
  border: 0px

.q-calendar-day__day-interval.q-range-first, .q-calendar-day__day-interval.q-range-last, .q-calendar-day__day-interval.q-range
  background: #fa9b2da3
  border: 0

</style>
