<template>
    <q-table
       grid
       :filter="filter"
       flat
       ref="tableRef"
       :rows="payments"
       class="my-sticky-header-table1 col "
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
 <template v-slot:top="props">
  <div class="top-slot-container">
    <!-- Row for CardWidgets -->
    <div class="row items-center justify-around q-gutter-md">
      <CardWidget
        class="card-widget col q-ma-xs"
        label="Total"
        :totals="groupedTotals"
        style="min-height: auto;min-width: auto;width: 100%;min-height: 100px;max-width:400px;"
      />
      <CardWidget
        class="card-widget col q-ma-xs"
        label="Number"
        :prefix="''"
        :value="payments.length"
        :suffix="''"
        style="min-height: auto;min-width: auto;width: 100%;min-height: 100px;max-width:400px;"
      />
    </div>
    <!-- Row for Buttons and Date Picker -->
    <div class="row items-center justify-center q-gutter-sm">
      <div style="min-width: 390px !important; " class="col-4 col-md-8 " :class="{'text-start': $q.screen.gt.sm }">

      <v-btn
        variant="plain"
        density="compact"
        icon="mdi-chevron-left"
        @click="getPreviousDay"
        class="col arrow-btn"
      ></v-btn>
      <v-btn
        :disabled="storePayments.loading"
        :loading="storePayments.loading"
        variant="plain"
        class="col"
      >
      {{selectedDateInfo}}
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            color="teal"
            v-model="storePayments.selectedDate"
            mask="YYYY-MM-DD"
            range
            today-btn
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
       </v-btn>
      <v-btn
        class="col"
        variant="plain"
        density="compact"
        icon="mdi-chevron-right arrow-btn"
        @click="getNextDay"
      ></v-btn>

    </div>
    <div class=" text-end ">
     <div class="row">
      <div class="col">
      <!-- <v-text-field
            label="Search"
            v-model="filter"
            variant="outlined"
            append-inner-icon="mdi-magnify"
            class="text-field"
              density="compact"
          ></v-text-field> -->
          <ion-input   class="text-start search-input" fill="outline"  v-model="filter"  placeholder="Filter">
            <q-icon slot="end" name="mdi-magnify"></q-icon>
          </ion-input>
        </div>
       <div>

         <q-btn
           size="16px"
           padding="0px"
           unelevated
          class=" q-mr-xs q-ml-xs"
          text-color="grey-7"
          icon="archive"
          @click="exportTable"
         />

         <q-btn v-if="!mobile" size="16px"  padding="0px" text-color="grey-7"   unelevated    @click="newPayment" icon="add"/>
         <q-btn v-else  padding="0px" size="16px"  unelevated text-color="grey-7" icon="add" @click="instance.emit('openPaymentModal')"/>
        </div>
      </div>
        </div>
    </div>
  </div>

</template>


       <template v-slot:item="props">

         <div class="payment">
          <Payment :tableProps="props" :mobile="mobile" class="payment"  :payment="props.row" :key="props.row.paymentId" :pageRef="pageRef" /></div>
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
       <template v-slot:bottom>
        <!-- <ion-infinite-scroll threshold="0" @ionInfinite="load">
      <ion-infinite-scroll-content></ion-infinite-scroll-content>
    </ion-infinite-scroll> -->
      </template>
     </q-table>
</template>
<script setup>
import { ref ,getCurrentInstance, toRaw, nextTick,onMounted,watch,computed} from 'vue';
  import { exportFile, useQuasar } from 'quasar'
  import { useStorePayments } from 'src/stores/storePayments'
  import { storeToRefs } from 'pinia'
  import { useStoreWorks } from 'src/stores/storeWorks';
  import {
   modalController,
   IonInput} from '@ionic/vue';
  import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'
  import { Platform } from 'quasar';
  import Payment from 'src/components/Payment.vue'
  import { useStorePatients } from 'src/stores/storePatients';
  import CardWidget from 'src/components/CardWidget.vue';
  import dayjs from 'dayjs'
  import { Haptics, ImpactStyle } from '@capacitor/haptics';

  const props = defineProps({
    pageRef:{
  type: Object,
  required: true
  },
  })
  const instance = getCurrentInstance()
  const storePatients=useStorePatients()
  const $q = useQuasar()
  const storePayments=useStorePayments()
  const storeWorks=useStoreWorks()
  const {  selectedDate } = storeToRefs(storePayments)
const selectedDateInfo = computed (()=>{
  const selectedDate=storePayments.selectedDate
  console.log(selectedDate,'selectedDateInfo')
  if (
      selectedDate.to&&selectedDate.from
      ) {
        return   dayjs(selectedDate.from).format('DD/MM/YYYY') + " - "+dayjs(selectedDate.to).format('DD/MM/YYYY')
        }
        else return dayjs(selectedDate).format('DD/MM/YYYY')
})
  onMounted(() => {
    if (storePayments.selectedDate && storePayments.selectedDate.from) {
         storePayments.getIntervalPayments(storePayments.selectedDate.from, storePayments.selectedDate.to,'payment');
        // Perform other actions if needed
      }
      else{
         storePayments.getdayPayments(storePayments.selectedDate,'payment');
      }

        console.log(storePayments.selectedDate,'storePayments.selectedDate')
           watch(selectedDate, async (newValue, oldValue) => {
            console.log(selectedDate, 'gi');
      if (newValue && newValue.from) {
        await storePayments.getIntervalPayments(newValue.from, newValue.to,'payment');
        // Perform other actions if needed
      }
      else{
        await storePayments.getdayPayments(newValue,'payment');
      }
           })
       })
  const columns = [
  { name: 'invoiceId', align: 'center', label: 'Invoice #', field: 'invoiceId', align: 'left'},
  { name: 'paid', label: 'Paid', field: 'paid',align: 'center', },
  {
      name: 'work',
      label: 'Work',
      align: 'left',
      field:'work',
      sortable: true
    },

    {
      name: 'patientName',
      label: 'Clients Name',
      align: 'left',
      field:'patientName',
      sortable: true
    },

    {
      name: 'doctor',
      label: 'Doctor',
      align: 'center',
      field:'doctor',
      sortable: true
    },
    {
      name: 'date',
      label: 'Date',
      align: 'left',
      field:'date',
      sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
    },
    {
      name: 'buttons',
      label: 'Buttons',
      align: 'right',
      field:'buttons',
      sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
    },


  ]
  const visibleColumns=ref([ 'invoiceId', 'paid','date','patientName','doctor','work','buttons'])

const payments = computed(() => {
  const payments = storePayments.dayPayments[storePayments.selectedDate] || [];
  // Filter payments where type is 'expenses'
  const selectedPayments = payments.filter(payment => payment.type === 'payment');


  if (selectedPayments) {
    selectedPayments.forEach(payment => {
      const patient = storePatients.patients.find(patient => patient.patientId === payment.patientId);
      if (patient) {
        payment.patientName = patient.namef;
      }
      if (payment && storeWorks.paymentsWorks[payment.workId]) {
        const workDetails = storeWorks.paymentsWorks[payment.workId];
        payment.work = workDetails.label;
        payment.color = workDetails.color;
        payment.workTotal = workDetails.price - workDetails.discount;
        payment.remaining = payment.workTotal - workDetails.allPaid;
        payment.patientName = patient.namef;
        payment.currency = workDetails.currency;
        payment.doctor = workDetails.doctor;
      }
    });

    // Sort payments by payment.dateUnix in descending order
    selectedPayments.sort((a, b) => b.dateUnix - a.dateUnix);

    // Return the limited number of payments based on the current `limit`
    return selectedPayments;
  }
  return [];
});


  function  newPayment() {
  storePayments.TOGGLE_PAYMENT()
      }

  function wrapCsvValue (val, formatFn, row) {
    let formatted = formatFn !== void 0
      ? formatFn(val, row)
      : val

    formatted = formatted === void 0 || formatted === null
      ? ''
      : String(formatted)

    formatted = formatted.split('"').join('""')
    /**
     * Excel accepts \n and \r in strings, but some other CSV parsers do not
     * Uncomment the next two lines to escape new lines
     */
    // .split('\n').join('\\n')
    // .split('\r').join('\\r')

    return `"${formatted}"`
  }
   async  function getNextDay() {
     await Haptics.impact({ style: ImpactStyle.Light });
        let date
          if (typeof storePayments.selectedDate === 'object') {
            date = storePayments.selectedDate.to
          } else {
            date = storePayments.selectedDate
          }
        const dateObject = new Date(date);
        dateObject.setDate(dateObject.getDate() + 1);
        storePayments.selectedDate= dateObject.toISOString().split('T')[0];
      }
   async  function getPreviousDay() {
    await  Haptics.impact({ style: ImpactStyle.Light });
       let date
          if (typeof storePayments.selectedDate === 'object') {
            date = storePayments.selectedDate.from
          } else {
            date = storePayments.selectedDate
          }
        const dateObject = new Date(date);
        dateObject.setDate(dateObject.getDate() - 1);
        storePayments.selectedDate= dateObject.toISOString().split('T')[0];
      }
  const editPayments=ref(true)
  const filter= ref('')
  const totals = computed(() => {
    const payments = storePayments.dayPayments[storePayments.selectedDate] || [];

    // Filter payments where type is 'expenses'
    const selectedPayments = payments.filter(payment => payment.type === 'payment');


    if (selectedPayments && selectedPayments.length > 0) {
      const totalByCurrency = selectedPayments.reduce((totals, payment) => {
        const { currency, paid } = payment;
        console.log(selectedPayments,'totalByCurrency')
        const currencyIndex = totals.findIndex(item => item.currency === currency);

        if (currencyIndex !== -1) {
          totals[currencyIndex].totalPaid += parseInt(paid);
        } else {
          totals.push({ currency, totalPaid: parseInt(paid) });
        }

        return totals;
      }, []);

      return totalByCurrency;
    } else {
      // Return default value when selectedPayments is empty or undefined
      return [{ currency: '', totalPaid: 0 }];
    }
  });

      const tableRef = ref()
      const selected = ref([])
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

  const openPaymentModal = async () => {
     const modal = await modalController.create({
       component: MobilePaymentModal,
       presentingElement:page.value.$el,
     });

     modal.present();
     const { data, role } = await modal.onWillDismiss();
     modal.onDidDismiss( storePayments.CLEAR_DATA())
     if (role === 'confirm') {
       console.log('data',data)
       // message.value = `Hello, ${data}!`;
     }
   }
/// Assuming formatPrice is defined somewhere
function formatPrice(value, currency) {
        const absoluteValue = Number(Math.abs(value).toLocaleString().replace(/,/g, '') || 0); // Format the absolute value
        const sign = value < 0 ? '-' : ''; // Determine the sign
        return {sign,absoluteValue,currency}; // Format: [sign] [price] [currency]
       }

const groupedTotals = computed(() => {
  const totalsByCurrency = {};

  // Group totals by currency
  totals.value.forEach(total => {
    if (!totalsByCurrency[total.currency]) {
      totalsByCurrency[total.currency] = { currency: total.currency, totalPaid: 0 };
    }
    totalsByCurrency[total.currency].totalPaid += total.totalPaid;
  });

  // Apply formatPrice to totalPaid
  const formattedTotals = Object.values(totalsByCurrency).map(item => {
    return {
      currency: item.currency,
      totalPaid: formatPrice(item.totalPaid).absoluteValue  // Format the totalPaid value
    };
  });

  return formattedTotals;
});

   const page = ref();

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
  .my-sticky-header-table1{
    .q-table tbody td:after{
      background: rgba(0,0,0,.06)
     }
  }
  .total-card {
    width: 100%;
    max-width: 250px;
    box-shadow: none;


    .text-h6 {
      font-size: 1rem !important;
      font-weight: 500;
      line-height: 2rem;
      letter-spacing: 0.0125em;
    }
    .text-card {
      font-size: 1.1rem !important;
      font-weight: 500;
      line-height: 2rem;
      letter-spacing: 0.0125em;
    }
  }

.payment{
  flex-wrap: nowrap;
  width: 100%;
  max-width: 850px;
  margin: 5px auto;
  height: 100% !important;
}

  ion-card-title {
    // --color: #52ffe4;
    font-size:20px;
  }

  ion-card-content {
    --color: #19c940;
   font-size: 20px;
  }
  .card-widget {
    .row, .column, .flex{
      justify-content:space-evenly;
      align-content:stretch;
    }
    padding: 0 !important;
    p  {
      margin:0 !important;
    }
  }
  .top-slot-container {
    margin-top:20px !important;

  display: flex;
  flex-direction: column; /* Stack rows vertically */
  align-items: center;    /* Center content horizontally */
  width: 100%;            /* Ensure the container spans the full width */
  gap: 1rem;              /* Add space between rows */
  .row, .column, .flex{
      width: 100%;
      margin-left:0px !important;
      margin-right:0px !important;
      margin-bottom: 0px !important;
    }
    .q-btn  {
     border:solid 1px grey;
}

}
.text-field {
  min-width:200px;
  box-sizing: border-box !important;
}
.arrow-btn {
  padding:0px !important;
  box-sizing: border-box !important;
}
  </style>
<style>

.text-field  input{
height:30px;
min-height: auto !important;
}
.v-field__overlay{
    background-color: none ;
    opacity: 0 !important;
    transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
.v-field {
    height:100%;
    font-size: 16px !important;
    --v-field-padding-start: 10px !important;
    --v-field-padding-end: 0px !important;
    --v-field-padding-top: 0px;
    --v-field-padding-bottom: 0px;
    --v-field-input-padding-top: calc(var(--v-field-padding-top, 0px) + var(--v-input-padding-top, 0));
    --v-field-input-padding-bottom: var(--v-field-padding-bottom, 0px);
}
.v-btn--icon .v-btn--density-compact{
    width: calc(var(--v-btn-height) ) !important;
    height: calc(var(--v-btn-height) ) !important;
    padding:0px !important;
}
.v-btn--density-compact {

}
.v-input__details {
    display:contents !important;
}

</style>


