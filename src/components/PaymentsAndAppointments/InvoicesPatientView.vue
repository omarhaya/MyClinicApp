<template>
   <template   v-if="patientInvoices&&patientInvoices.length&&!loading">
    <q-table
      grid
      title="Invoices"
      class="invoices-table"
      card-container-class="my-card-style"
      :rows="patientInvoices"
      :columns="columns"
      row-key="invoiceId"
      :filter="filter"
      hide-header
      virtual-scroll
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:item="props" v-if="storeInvoices.patientInvoices.length &&!loading">
        <div class="invoice"><Invoice :mobile="mobile"   @openPaymentModal="openPaymentModal" class="invoice"  :invoice="props.row" :key="index" /></div>
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
          <template  v-else-if="!loading &&patientInvoices && !patientInvoices.length">
            <h5 style="height:410px;" class="text-center q-pt-xl q-ml-md q-mr-md  text-grey ">Patient has no added Invoices Yet. </h5>
         </template>
         <template v-else>
<q-card class="card-appointment q-mb-md" flat bordered >
      <q-item>
        <q-item-section>
          <q-item-label>
            <q-skeleton width="10%"  type="text" class="text-subtitle2" animation="fade" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton width="50%" type="text" class="text-subtitle2" animation="fade" />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-card-section>
        <q-skeleton type="text" width="25%" class="text-subtitle2" animation="fade" />
        <q-skeleton type="text" width="25%" class="text-subtitle2" animation="fade" />
      </q-card-section>
    </q-card>

  </template>

</template>

<script setup>

 import {ref,getCurrentInstance, computed} from 'vue'
 import { useStoreAppointments } from 'src/stores/storeAppointments'
 import { date } from 'quasar'
 import { useRouter } from 'vue-router'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { storeToRefs } from 'pinia'
import Invoice from "src/components/Invoice.vue"
import invoiceLoading from "src/components/InvoiceLoading.vue"
import { Platform } from 'quasar'

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

/*
 props
*/
const props = defineProps({
    patientId:{
      type: String,
      required:true
    }
})

/*
store
*/

const storeInvoices=useStoreInvoices()
const {  patientInvoices,loading } = storeToRefs(storeInvoices)

/*
  Appointments
*/
  storeInvoices.SET_PATIENT_INVOICES(props.patientId)
  const filter=ref('')
  const columns = [
      { name: 'invoiceId',label: 'invoiceId',field: 'invoiceId',},
      { name: 'date',label: 'date',field: 'date',},
    ]
    const instance = getCurrentInstance()
const openPaymentModal = async () => {
  instance.emit('openPaymentModal')
  };
</script>
<style lang="scss" scoped>

.invoice{
  flex-wrap: nowrap;
  width: 100%;
  max-width: 850px;
  margin: 5px auto;
  height: 100% !important;
}

</style>
