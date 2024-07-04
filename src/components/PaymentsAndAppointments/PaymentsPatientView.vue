<template>
  <template  v-if="payments">
  <q-table
      :filter="filter"
      flat
      ref="tableRef"
      :rows="payments"
      :columns="columns"
      class="payments-table"
      row-key="paymentId"
      virtual-scroll
      :rows-per-page-options="[0]"
      selection="multiple"
      v-model:selected="selected"

      @selection="handleSelection"

    >


    <template v-slot:header="props">
  <q-tr :props="props">
    <q-th v-show="editPayments">
      <q-checkbox v-model="props.selected" />
    </q-th>
    <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
         {{ col.label }}
          </q-th>
  </q-tr>
</template>
<template v-slot:top-left>
        <q-btn color="primary" @click="newPayment">
           New Payment
        </q-btn>
      </template>

      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          class="q-mr-md q-ml-md"
          color="primary"
          icon-right="archive"
          no-caps
          @click="exportTable"
        />
      </template>

    <template v-slot:body="props">
        <q-tr  :props="props" >
          <q-td  v-show="editPayments"  auto-width  key="invoiceId" :props="props">
            <q-checkbox  :model-value="props.selected" @update:model-value="(val, evt) => { Object.getOwnPropertyDescriptor(props, 'selected').set(val, evt) }" />
          </q-td>
          <q-td key="paid"  :props="props">
            <div><span  class="text-green paid-row">+<span class="currency text-bold">{{ props.row.currency }}</span><span class="text-bold"> {{ formatMoney(props.row.paid)}}</span></span></div>
            Dr. {{ props.row.doctor }}
          </q-td>
          <q-td key="doctor" :props="props">
              Dr. {{ props.row.doctor }}
          </q-td>
          <q-td key="date" :props="props">
            {{ formatDate(props.row.dateUnix)}}
          </q-td>
          <q-td  key="invoiceId" :props="props">
            <router-link  v-if="props.row.invoiceId" :to="{ name: 'Invoice', params: { invoiceId: props.row.invoiceId } }">{{'#'+ props.row.invoiceId }}</router-link>
          </q-td>
          <q-td key="buttons" :props="props">
            {{ props.row.buttons}}
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data="{ icon, message, filter }">
        <div class="full-width row flex-center text-orange q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>
             {{ message }}
          </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
    </q-table>
  </template>
</template>

<script setup>
 import {ref,reactive,toRaw, nextTick,computed} from 'vue'
 import { storeToRefs } from 'pinia'
 import { useStorePayments } from 'src/stores/storePayments'
 import { colors, date } from 'quasar'
 import { useRouter } from 'vue-router'
import { useStoreWorks } from 'src/stores/storeWorks'
import { useStorePatients } from 'src/stores/storePatients'
import { useStoreInvoices } from 'src/stores/storeInvoices'

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
})

/*
store
*/
const storePayments = useStorePayments()
const storeWorks=useStoreWorks()
const storePatients=useStorePatients()
const storeInvoices=useStoreInvoices()
const { loading } = storeToRefs(storePayments)

/*
 Router
*/
 const router = useRouter()

/*
  Payments
*/
  storePayments.getPayments(props.patientId)
  const payments=computed(()=>{
  const payments=storePayments.payments[props.patientId]

  if(payments){
    payments.forEach(payment=>{
      if(payment)
      if(storeWorks.paymentsWorks[payment.workId]){
     payment.work=storeWorks.paymentsWorks[payment.workId].label
     payment.color=storeWorks.paymentsWorks[payment.workId].color
     payment.workTotal=storeWorks.paymentsWorks[payment.workId].price-storeWorks.paymentsWorks[payment.workId].discount
     payment.patientName=storeWorks.paymentsWorks[payment.workId].patientName
     payment.currency=storeWorks.paymentsWorks[payment.workId].currency
     payment.doctor=storeWorks.paymentsWorks[payment.workId].doctor
     payment.remaining=payment.workTotal-storeWorks.paymentsWorks[payment.workId].allPaid
      }
      console.log(payments,'computed')
    })
     // Sort payments by payment.date in descending order
     payments.sort((a, b) => (b.dateUnix) - (a.dateUnix))
    return payments
  }
  else return []
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
</script>

<style lang="sass">
.payments-table
  /* height or max-height is important */
  min-height: 410px !important

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff !important

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
.paid-row
  font-size: large

</style>
