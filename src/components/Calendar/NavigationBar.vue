<template>
         <div
          class="title-bar"
          style="display: flex;"
        >
          <q-btn
            tabindex="0"
            flat
            icon="eva-arrowhead-left-outline"
            class="date-button direction-button"
            @click="onPrev();transition=('q-calendar--' + transitionPrev);Haptics.impact({ style: ImpactStyle.Medium })"
          >
            <span
              class="q-calendar__focus-helper"
              tabindex="-1"
            />
          </q-btn>
          <div class="dates-holder">
            <transition
              :name="transition" appear
            >
              <div
                :key="parsedStart.date"
                 class="row justify-between  items-center text-white overflow-hidden" style="width: calc(100%)"
              >
                <div
                  v-for="day in days"
                  :key="day.date"
                  :style="dayStyle"
                >
                  <button
                    tabindex="0"
                    style="width: 100%;"
                    :class="dayClass(day)"
                    @click="$emit('selectedDate',storeAppointments.selectedDate = day.date);transition='';Haptics.impact({ style: ImpactStyle.Light })"

                  >
                    <span
                      class="q-calendar__focus-helper"
                      tabindex="-1"
                    />
                    <div
                      style="width: 100%;"
                    >
                      {{ monthFormatter(day, true) }}
                    </div>
                    <div
                      style="width: 100%; font-size: 16px; font-weight: 700;"
                    >
                      {{ dayFormatter(day, false) }}
                    </div>
                    <div
                      style="width: 100%; font-size: 10px;"
                    >
                      {{ weekdayFormatter(day, true) }}
                    </div>
                  </button>
                </div>
              </div>
            </transition>
          </div>
          <q-btn
          flat
            tabindex="0"
            icon="eva-arrowhead-right-outline"
            class="date-button direction-button"
            @click="onNext();transition=('q-calendar--' + transitionNext);Haptics.impact({ style: ImpactStyle.Medium })"
          >
            <span
              class="q-calendar__focus-helper"
              tabindex="-1"
            />
          </q-btn>
        </div>

</template>
<script setup>
import {
  addToDate,
  createDayList,
  createNativeLocaleFormatter,
  getEndOfWeek,
  getStartOfWeek,
  getWeekdaySkips,
  parseTimestamp,
  today,
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import { useStoreAppointments } from 'src/stores/storeAppointments'
import { ref, reactive,computed,watch } from 'vue'
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/*
  Stores
*/
const storeAppointments=useStoreAppointments()

/*
   props
*/
   const props = defineProps({
    selectedDate:{
      type:String,
      required:true
    },
    transition:{
      type:String,
      default:''
    }
   })

  /*
   CalendarHeaderRefs
  */
    const selectedDate3 = computed(()=>{return props.selectedDate})
    const selectedDate = ref(selectedDate3),
          weekdays = reactive([ 6, 0, 1, 2, 3, 4, 5 ]),
          locale = ref('en-US'),
          monthFormatter = monthFormatterFunc(),
          dayFormatter = dayFormatterFunc(),
          weekdayFormatter = weekdayFormatterFunc(),
          transitionPrev = ref('slide-right'),
          transitionNext = ref('slide-left'),
          transition = ref(storeAppointments.transition)

  /*
    CalendarHeader
  */
    const weekdaySkips = computed(() => {
      return getWeekdaySkips(weekdays)
    })

    const parsedStart = computed(() => {
      if (storeAppointments.selectedDate) {
        return getStartOfWeek(parseTimestamp(selectedDate.value), weekdays, today2.value)
      }
      return undefined
    })

    const parsedEnd = computed(() => {
      if (storeAppointments.selectedDate) {
        return getEndOfWeek(parseTimestamp(selectedDate.value), weekdays, today2.value)
      }
      return undefined
    })

    const today2 = computed(() => {
      return parseTimestamp(today())
    })

    const days = computed(() => {
      if (parsedStart.value && parsedEnd.value) {
        return createDayList(
          parsedStart.value,
          parsedEnd.value,
          today2.value,
          weekdaySkips.value
        )
      }
      return []
    })

    const dayStyle = computed(() => {
      const width = 100 / weekdays.length + '%'
      return {
        width
      }
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


    function dayClass (day) {
      return {
        'date-button': true,
        'selected-date-button': storeAppointments.selectedDate === day.date
      }
    }

    function monthFormatterFunc () {
      const longOptions = { timeZone: 'UTC', month: 'long' }
      const shortOptions = { timeZone: 'UTC', month: 'short' }
      return createNativeLocaleFormatter(
        locale.value,
        (_tms, short) => (short ? shortOptions : longOptions)
      )
    }

    function weekdayFormatterFunc () {
      const longOptions = { timeZone: 'UTC', weekday: 'long' }
      const shortOptions = { timeZone: 'UTC', weekday: 'short' }
      return createNativeLocaleFormatter(
        locale.value,
        (_tms, short) => (short ? shortOptions : longOptions)
      )
    }

    function dayFormatterFunc () {
      const longOptions = { timeZone: 'UTC', day: '2-digit' }
      const shortOptions = { timeZone: 'UTC', day: 'numeric' }
      return createNativeLocaleFormatter(
        locale.value,
        (_tms, short) => (short ? shortOptions : longOptions)
      )
    }

</script>

<style lang="sass" >
//title bar css
.title-bar
  position: relative
  width: 100%
  min-height: 70px
  background :#c0f5cd
  // display: flex
  // flex-direction: row
  // flex: 1 0 100%
  // justify-content: space-between
  // align-items: center
  overflow: hidden
  border-radius: 3px
  user-select: none


.dates-holder
  position: relative
  width: 100%
  align-items: center
  display: flex
  justify-content: space-between
  color: #fff
  overflow: hidden
  user-select: none

.direction-button
  background: #c0f5cd
  color: #096616 !important
  width: 40px
  max-width: 50px !important
  min-height:70px !important

.date-button
  color: #096616 !important
  background: #c0f5cd
  z-index: 2
  height: 100%
  outline: 0
  cursor: pointer
  border-radius: 8px
  display: inline-flex
  flex: 1 0 auto
  flex-direction: column
  align-items: stretch
  position: relative
  border: 0
  vertical-align: middle
  padding: 0
  font-size: 14px
  line-height: 1.615em
  text-decoration: none
  font-weight: 500
  text-transform: uppercase
  text-align: center
  user-select: none

.selected-date-button
  color: white !important
  background: #096616 !important

</style>
