<template>
   <template v-if="payments.length&&!storePayments.loadingPayments">
    <q-table
       grid
       :filter="filter"
       ref="tableRef"
       :rows="payments"
       class="PaymentsTable col "
       :columns="columns"
       color="secondary"
       row-key="paymentId"
       virtual-scroll
       :rows-per-page-options="[0]"
       selection="multiple"
       v-model:selected="selected"
       dense
       @selection="handleSelection"
       :visible-columns="visibleColumns"
       hide-bottom
    >
      <!-- <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->
      <template v-slot:item="props">
        <div class="payment"> <Payment  :tableProps="props" :mobile="mobile"  class="payment"  :payment="props.row" :key="props.row.paymentId"  :pageRef="pageRef" /></div>
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
          <template  v-else-if="!storePayments.loadingPayments &&payments && !payments.length">
            <h5 style="height:410px;" class="text-center q-pt-xl q-ml-md q-mr-md text-grey ">Patient has no added Invoices Yet. </h5>
         </template>
         <template v-else >
          <q-spinner-ball
          color="teal"
          size="8em"
          class="q-pt-xl"
          transition-show="fade"
          transition-hide="fade"
        />

  </template>

</template>

<script setup>
 import {ref,reactive,toRaw, nextTick,computed,toRefs} from 'vue'
 import { storeToRefs } from 'pinia'
 import { useStorePayments } from 'src/stores/storePayments'
 import { colors, date } from 'quasar'
 import { useRouter } from 'vue-router'
import { useStoreWorks } from 'src/stores/storeWorks'
import { useStorePatients } from 'src/stores/storePatients'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import Payment from '../Payment.vue'
import { Platform } from 'quasar';
 const { getPaletteColor } = colors
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
    pageRef:{
     type: Object,
     required: true
  },
})

const { pageRef } = toRefs(props);

/*
store
*/
const storePayments = useStorePayments()
const storeWorks=useStoreWorks()
const storePatients=useStorePatients()
const storeInvoices=useStoreInvoices()
const { loading } = storeToRefs(storePayments)
const tableRef= ref()
/*
 Router
*/
 const router = useRouter()

/*
  Payments
*/
  storePayments.getPatientPayments(props.patientId)
  const payments=computed(()=>{

    const selectedPayments = storePayments.patientPayments[props.patientId]

if (selectedPayments) {
  selectedPayments.forEach(payment => {
   const patient = storePatients.patients.find(patient => patient.patientId === props.patientId);
   console.log(patient,'patient1')
   if (patient) {
    payment.patientName = patient.namef;
       }
    if (payment && storeWorks.paymentsWorks[payment.workId]) {
      const workDetails = storeWorks.paymentsWorks[payment.workId];
      payment.work = workDetails.label;
      payment.color = workDetails.color;
      payment.workTotal = workDetails.price - workDetails.discount;
      payment.patientName = patient.namef;
      payment.currency = workDetails.currency;
      payment.doctor = workDetails.doctor;
      payment.remaining = payment.workTotal - workDetails.allPaid;
    }
  });

  // Sort payments by payment.dateUnix in descending order
  selectedPayments.sort((a, b) => b.dateUnix - a.dateUnix);

  return selectedPayments;
} else {
  return [];
}
})

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
const editPayments=ref(false)
let storedSelectedRow


function handleSelection ({ rows, added, evt }) {
          // ignore selection change from header of not from a direct click event
          if (rows.length !== 1 || evt === void 0) {
            return
          }

          const oldSelectedRow = storedSelectedRow
          const [newSelectedRow] = rows
          const { ctrlKey, shiftKey } = evt

          if (shiftKey !== true) {
            storedSelectedRow = newSelectedRow
          }

          // wait for the default selection to be performed
          nextTick(() => {
            if (shiftKey === true) {
              const tableRows = tableRef.value.filteredSortedRows
              let firstIndex = tableRows.indexOf(oldSelectedRow)
              let lastIndex = tableRows.indexOf(newSelectedRow)

              if (firstIndex < 0) {
                firstIndex = 0
              }

              if (firstIndex > lastIndex) {
                [ firstIndex, lastIndex ] = [ lastIndex, firstIndex ]
              }

              const rangeRows = tableRows.slice(firstIndex, lastIndex + 1)
              // we need the original row object so we can match them against the rows in range
              const selectedRows = selected.value.map(toRaw)

              selected.value = added === true
                ? selectedRows.concat(rangeRows.filter(row => selectedRows.includes(row) === false))
                : selectedRows.filter(row => rangeRows.includes(row) === false)
            }
            else if (ctrlKey !== true && added === true) {
              selected.value = [newSelectedRow]
            }
          })
        }
function exportTable () {
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    payments.value.map(row => columns.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }}

const selected = ref([])
function  newPayment() {
        storePayments.patient=storePatients.patients.find(
        patient => patient.patientId === props.patientId)
        storeInvoices.SET_PATIENT_INVOICES(props.patientId)
      storePayments.TOGGLE_PAYMENT()
    }
const filter=ref('')
const columns = [
      { name: 'paid',label: 'paid',field: 'paid',align: 'left'},
      { name: 'date',label: 'date',field: 'date',align: 'left'},
      { name: 'invoiceId',label: 'invoiceId',field: 'invoiceId'},
    ]
    function  cardStyle  (appointment) {
        if (appointment.status==='Booked'){
          console.log(appointment,'appointment')
        return {
       // card color
       'background-color':  getPaletteColor('grey-1'),
        'color': getPaletteColor('grey-8'),
        // caption color
        '--caption-color':getPaletteColor('grey-8'),
        // status badge color
        '--status-dot-color':getPaletteColor('grey-8'),
        '--status-color':getPaletteColor('grey-8'),
        '--status-background-color':getPaletteColor('grey-3')
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
        '--status-background-color':getPaletteColor('orange-3')
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
        '--status-background-color':getPaletteColor('yellow-3')
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
        '--status-background-color':getPaletteColor('pink-3')
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
        '--status-background-color':getPaletteColor('green-3')
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
        '--status-background-color':getPaletteColor('purple-3')
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
        '--status-background-color':getPaletteColor('teal-3')
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
        '--status-background-color':getPaletteColor('red-3')
        }}
      }


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
const formatMoney = (value) => {
  const stringValue = value.toString()
         return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
       }
const formatDate= (value) => {
  const date = new Date(parseInt(value))
  const timeFormatted = date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
  const dateFormatted = date.toISOString().split('T')[0];
  return timeFormatted +' '+dateFormatted
}

 /*
  Mobile
 */
 const   mobile=computed(()=>{
           if (Platform.is.desktop){
             return false
           }
           if (Platform.is.mobile){
         return true
           }
         })
</script>

<style lang="scss" scoped>
.card-appointment {

  .row{
    align-content:flex-start !important;
  }
}
.payment{
  flex-wrap: nowrap;
  width: 100%;
  max-width: 850px;
  margin: 5px auto;
  height: 100% !important;
}
.dark .PaymentsTable {
  background-color: #142325;
}
</style>
