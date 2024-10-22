<template>
   <template   v-if="invoices.length&&!loadingInvoices||storePayments.paymentModal">
    <q-table
    grid
       :filter="filter"
       ref="tableRef"
       :rows="invoices"
       class="InvoicesTable col "
       :columns="columns"
       color="secondary"
       row-key="paymentId"
       virtual-scroll
       :rows-per-page-options="[0]"
       selection="multiple"
       v-model:selected="selected"
       dense
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
        <div   class="invoice "><Invoice :pageRef="pageRef" :mobile="mobile"     @openPaymentModal="openPaymentModal" class="invoice"  :invoice="props.row" :key="index" /></div>
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
          <template  v-else-if="!loadingInvoices&&invoices &&!invoices.length">
            <h5 style="height:410px;" class="text-center q-pt-xl q-ml-md q-mr-md text-grey ">Patient has no added Invoices Yet. </h5>
         </template>
         <template v-else>
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

 import {ref,getCurrentInstance, computed,toRefs} from 'vue'
 import { useStoreAppointments } from 'src/stores/storeAppointments'
 import { date } from 'quasar'
 import { useRouter } from 'vue-router'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { storeToRefs } from 'pinia'
import Invoice from "src/components/Invoice.vue"
import invoiceLoading from "src/components/InvoiceLoading.vue"
import { Platform } from 'quasar'
import MobileInvoiceModal from '../MobileInvoiceModal.vue'
import {  modalController } from '@ionic/vue';
import MobilePaymentModal from '../MobilePaymentModal.vue'
import { useStorePayments } from 'src/stores/storePayments'


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

const storeInvoices=useStoreInvoices()
const storePayments=useStorePayments()
const {  loadingInvoices } = storeToRefs(storeInvoices)

/*
  Invoices
*/

  const invoices=computed(()=>{

    const patientInvoices = storeInvoices.patientInvoices

if (patientInvoices) {
  return patientInvoices;
} else {
  return [];
}
})

  storeInvoices.SET_PATIENT_INVOICES(props.patientId)
  const filter=ref('')
  const columns = [
      { name: 'invoiceId',label: 'invoiceId',field: 'invoiceId',},
      { name: 'date',label: 'date',field: 'date',},
    ]
    const instance = getCurrentInstance()




    const openInvoiceModal = async () => {
    const modal = await modalController.create({
      component: MobileInvoiceModal,
      presentingElement:pageRef.value.$el,

    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss(storeInvoices.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }

  };


  const openPaymentModal = async () => {
    const modal = await modalController.create({
      component: MobilePaymentModal,
      presentingElement:pageRef.value.$el,
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss( storePayments.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }
  };
</script>
<style lang="scss" scoped>
.dark .InvoicesTable {
  background-color: #142325;
}
.dark .invoiceContainer{
  background-color: #142325;
}
.card-appointment {

  .row{
    align-content:flex-start !important;
  }
}
.invoice{
  flex-wrap: nowrap;
  width: 100%;
  max-width: 850px;
  margin: 5px auto;
  height: 100% !important;
  min-height: auto !important;

}
.invoiceLoading {
  margin-top:10px;
}

.invoiceLoad{
  margin-top:25px;
}
</style>
