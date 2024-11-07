<template>
  <ion-page ref="page">
     <ion-header :translucent="true" collapse="fade">
      <ion-toolbar class="text-center row">
         <ion-segment class="segments col" @ionChange="handleSegmentChange" :value="tab">
           <ion-segment-button class="segment" value="payments">
             <ion-label>Payments</ion-label>
           </ion-segment-button>
           <ion-segment-button class="segment" value="expenses">
             <ion-label>Expenses</ion-label>
           </ion-segment-button>
         </ion-segment>
       </ion-toolbar>
     </ion-header>
   <ion-content class="ion-content" :fullscreen="true">
       <div class="q-gutter-y-sm">
         <q-tab-panels
           v-model="tab"
           animated
           transition-prev="fade"
           transition-next="fade"
           class=" text-center"
         >
         <q-tab-panel class="panel-properties" name="payments">
           <div class="row">
         <!-- <q-card class=" ">
           <q-card-section>
             <div v-if="totals.length<=1" class="text-h6">Total</div>
             <div v-else class="text-h6">Totals</div>
             <div v-for="total in totals" class="text-h5"><span class="currency">{{ total.currency+' ' }}</span>{{formatMoney(total.totalPaid)}}</div>
           </q-card-section>
         </q-card>
         <q-card class="total-card col q-ma-sm bg-grey-3 ">
           <q-card-section>
             <div class="text-h6">New</div>
             <div class="text-h5">{{payments.length}}</div>
           </q-card-section>
         </q-card> -->
         <!-- <ion-card class="col q-ma-xs">
          <div>
    <ion-card-header>
      <ion-card-title v-if="totals.length<=1" class="text-h6">Total</ion-card-title>
    </ion-card-header>
  </div>
  <div>
    <ion-card-content class="text-green-7" v-for="total in totals"><span v-if="total.totalPaid!==0">+</span><span class="currency">{{ total.currency+' ' }}</span>{{formatMoney(total.totalPaid)}}

    </ion-card-content>
  </div>
  </ion-card> -->
  <CardWidget
      class="col q-ma-xs"
      label="Total"
      :totals="groupedTotals"
    />

    <!-- Card for New Payments -->
    <CardWidget
      class="col q-ma-xs"
      label="New"
      :prefix="''"
      :value="payments.length"
      :suffix="''"
    />
  <!-- <ion-card class="col q-ma-xs">
    <div>
    <ion-card-header>
      <ion-card-title>New</ion-card-title>
    </ion-card-header>
  </div>
    <div>
    <ion-card-content>
      {{payments.length}}
    </ion-card-content>
  </div>
  </ion-card> -->
        </div>
        <ion-card class="q-ma-xs">
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
 <template v-slot:top-left>
   <q-btn v-if="!mobile" color="secondary" @click="newPayment">
            New Payment
         </q-btn>
         <q-btn v-else color="secondary" @click="openPaymentModal">
            New Payment
         </q-btn>
         <v-btn variant="plain" density="compact" icon="mdi-chevron-left" @click="getPreviousDay"></v-btn>
         <q-icon size="20px" name="event" class="cursor-pointer">
           <q-popup-proxy cover transition-show="scale" transition-hide="scale">
             <q-date color="teal" v-model="storePayments.selectedDate" mask="YYYY-MM-DD" range today-btn>
               <div class="row items-center justify-end">
                 <q-btn v-close-popup label="Close" color="primary" flat />
               </div>
             </q-date>
           </q-popup-proxy>
         </q-icon>
         <v-btn variant="plain" density="compact" icon="mdi-chevron-right" @click="getNextDay"></v-btn>
       </template>

       <template v-slot:top-right>
         <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
           <template v-slot:append>
             <q-icon name="search" />
           </template>
         </q-input>
         <q-btn
           class="q-mr-md q-ml-md"
           color="secondary"
           icon-right="archive"
           no-caps
           @click="exportTable"
         />
       </template>

       <template v-slot:item="props">
         <!-- <q-tr  :props="props" >
           <q-td  v-show="editPayments"  auto-width  key="invoiceId" :props="props">
             <q-checkbox  :model-value="props.selected" @update:model-value="(val, evt) => { Object.getOwnPropertyDescriptor(props, 'selected').set(val, evt) }" />
           </q-td>
           <q-td auto-width  key="invoiceId" :props="props">
             <router-link  v-if="props.row.invoiceId" :to="{ name: 'Invoice', params: { invoiceId: props.row.invoiceId } }">{{'#'+ props.row.invoiceId }}</router-link>
           </q-td>
           <q-td key="paid"  :props="props">
             <span  class="text-green ">+<span class="currency">{{ props.row.currency }}</span><span class="text-bold"> {{ formatMoney(props.row.paid)}}</span></span>
           </q-td>
           <q-td key="work"  :props="props">
             <q-badge v-if="props.row.work" :color="`${props.row.color}-5`" class=" text-bold">{{ props.row.work }}</q-badge>
             <q-item-label  v-if="props.row.work" caption><div class="text-black">Total: <span class="currency">{{props.row.currency }}</span>{{ formatMoney(props.row.workTotal) }}</div> <div class="text-orange">Remaining: <span class="currency">{{props.row.currency }}</span>{{ formatMoney(props.row.remaining) }}</div></q-item-label>
           </q-td>
              <q-td v-if="props.row.patientName" key="patientName" :props="props">
               <q-avatar v-if="!isArabic(props.row.patientName)" class="avatar-name" font-size="15px" size="30px" color="green-3" text-color="white"> {{getInitials( props.row.patientName) }}</q-avatar>
               <q-avatar v-if="isArabic(props.row.patientName)" class="avatar-person" font-size="34px" size="30px" icon="person" color="green-3" text-color="white"/>
             {{ props.row.patientName }}
           </q-td>
           <q-td key="doctor" :props="props">

               Dr. {{ props.row.doctor }}
           </q-td>


           <q-td key="date" :props="props">
             {{ formatDate(props.row.dateUnix)}}
           </q-td>
           <q-td key="buttons" :props="props">
           <q-icon  name="delete" size="20px" @click="storePayments.deletePayment(props.row.paymentId)"/>
           </q-td>
         </q-tr> -->
         <div class="payment">
          <Payment :tableProps="props" :mobile="mobile"    class="payment"  :payment="props.row" :key="props.row.paymentId" :pageRef="page" /></div>
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
     </ion-card>
         </q-tab-panel>
           <q-tab-panel class="panel-properties" name="expenses">
      <Expenses/>
           </q-tab-panel>


         </q-tab-panels>

      </div>
     </ion-content>
   </ion-page>

  </template>

  <script setup>
  import { ref , toRaw, nextTick,onMounted,watch,computed} from 'vue';
  import { exportFile, useQuasar } from 'quasar'
  import { useStorePayments } from 'src/stores/storePayments'
  import { storeToRefs } from 'pinia'
  import { useStoreWorks } from 'src/stores/storeWorks';
  import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
  import { IonSegment, IonSegmentButton, IonHeader, IonLabel , IonToolbar ,IonPage ,IonContent, modalController,IonCard} from '@ionic/vue';
  import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'
  import { Platform } from 'quasar';
  import Expenses from './Expenses.vue';
  import Payment from 'src/components/Payment.vue'
  import { useStorePatients } from 'src/stores/storePatients';
  import CardWidget from 'src/components/CardWidget.vue';

 const storePatients=useStorePatients()
  const $q = useQuasar()
  const storePayments=useStorePayments()
  const storeWorks=useStoreWorks()
  const {  selectedDate } = storeToRefs(storePayments)
  function handleSegmentChange(event) {
        tab.value = event.detail.value;
        console.log('hi')
      }
  onMounted(() => {
    if (storePayments.selectedDate && storePayments.selectedDate.from) {
         storePayments.getIntervalPayments(storePayments.selectedDate.from, storePayments.selectedDate.to);
        // Perform other actions if needed
      }
      else{
         storePayments.getdayPayments(storePayments.selectedDate);
      }

        console.log(storePayments.selectedDate,'storePayments.selectedDate')
           watch(selectedDate, async (newValue, oldValue) => {
            console.log(selectedDate, 'gi');
      if (newValue && newValue.from) {
        await storePayments.getIntervalPayments(newValue.from, newValue.to);
        // Perform other actions if needed
      }
      else{
        await storePayments.getdayPayments(newValue);
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
    const selectedPayments = storePayments.dayPayments[storePayments.selectedDate];

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
     function getNextDay() {
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
     function getPreviousDay() {
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
  const tab= ref('payments')
  const editPayments=ref(true)
  const filter= ref('')
  // function customFilter(rows, terms,cols,cellValue){
  //       // rows contain the entire data
  //       // terms contains whatever you have as filter
  //     //   rows = rows.filter(row => row.paid ==0);
  //     //   console.log(rows,'cols')
  //     //   // console.log(terms,rows,cols,cellValue,'rowsss')

  //     //  let lowerSearch = terms.search ? terms.search: ""

  //       // const filteredRows = rows.filter(
  //       //   (row, i) =>{

  //       //   let ans = false


  //       //   //Gather search condition



  //       //   //Assume true in case there is no search
  //       //   let s1 = true

  //       //   //If search term exists, convert to lower case and see which rows contain it
  //       //   if(lowerSearch != ""){
  //       //     s1 = false
  //       //     //Get the values
  //       //     let s1_values = Object.values(row)
  //       //     //Convert to lowercase
  //       //     let s1_lower = s1_values.map(x => x.toString().toLowerCase())
  //       //     for (let val = 0; val<s1_lower.length; val++){
  //       //       if (s1_lower[val].includes(lowerSearch)){
  //       //         s1 = true
  //       //         break
  //       //       }
  //       //     }
  //       //   }
  //       //   //assume row doesn't match
  //       //   ans = false
  //       //   //check if any of the conditions match
  //       //   if ( (c1 && s1) || (c2 && s1) || (c3 && s1) ) {
  //       //     ans = true
  //       //   }
  //       //   return ans
  //       //   })
  //       return rows
  //     }
  const totals = computed(() => {
    const payments = storePayments.dayPayments[storePayments.selectedDate];

    if (payments && payments.length > 0) {
      const totalByCurrency = payments.reduce((totals, payment) => {
        const { currency, paid } = payment;
        console.log(payments,'totalByCurrency')
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
      // Return default value when payments is empty or undefined
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

  /*
   page style
  */
  const pageStyleFn = (offset, height) =>{
            return { height: `${ height - offset }px` }
        }
  /*
   Filters
  */
  const isArabic=(value) =>{
    return /[\u0600-\u06FF]/.test(value)
  }
  function getInitials(name) {
            const nameParts = name.split(' ');
            const firstName = nameParts[0].charAt(0).toUpperCase();
            const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            return `${firstName}${lastName}`;
         }
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
// Computed property to group totals by currency
const groupedTotals = computed(() => {
  const totalsByCurrency = {};

  // Group totals by currency
  totals.value.forEach(total => {
    if (!totalsByCurrency[total.currency]) {
      totalsByCurrency[total.currency] = { currency: total.currency, totalPaid: 0 };
    }
    totalsByCurrency[total.currency].totalPaid += total.totalPaid;
  });

  // Return an array of totals grouped by currency
  return Object.values(totalsByCurrency);
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
  .q-dark .panel-properties {
    background-color:#142325;
  }
  .panel-properties {
    .row, .column, .flex{
      justify-content:space-evenly;
      align-content:stretch;
    }
    padding: 0 !important;
    p  {
      margin:0 !important;
    }
  }
 .segment {
     margin-top: 2px !important;
     margin-bottom: 2px !important;
 }
 .segments {
   margin-top: 4px !important;
   margin-bottom: 4px !important;
   margin-right:80px !important;
   margin-left:80px !important;
 }
 .ion-content::part(scroll) {
 --offset-top: 0px !important;
 // --offset-bottom: 0px !important;
 }
.payment{
  flex-wrap: nowrap;
  width: 100%;
  max-width: 850px;
  margin: 5px auto;
  height: 100% !important;
}
ion-card {
    // --background: #000;
    // --color: #9efff0;
  }

  ion-card-title {
    // --color: #52ffe4;
    font-size:20px;
  }

  ion-card-content {
    --color: #19c940;
   font-size: 20px;
  }
  </style>
