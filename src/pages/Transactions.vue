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
          <Payments @openPaymentModal="openPaymentModal" :pageRef="page"/>
         </q-tab-panel>
           <q-tab-panel class="panel-properties" name="expenses">
      <Expenses @openPaymentModal="openPaymentModal" :pageRef="page"/>
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
  import { IonSegment, IonSegmentButton, IonHeader, IonLabel , IonToolbar ,IonPage ,IonContent, modalController,IonCard,IonList,
    IonIcon ,
   IonInfiniteScrollContent,
   IonInput} from '@ionic/vue';
  import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'
  import { Platform } from 'quasar';

  import Payment from 'src/components/Payment.vue'
  import { useStorePatients } from 'src/stores/storePatients';
  import CardWidget from 'src/components/CardWidget.vue';
  import dayjs from 'dayjs'
  import { Haptics, ImpactStyle } from '@capacitor/haptics';
  import { searchCircleOutline} from 'ionicons/icons';
  import Payments from 'src/components/TransactionsPanels/Payments.vue';
  import Expenses from 'src/components/TransactionsPanels/Expenses.vue';
 const storePatients=useStorePatients()
  const $q = useQuasar()
  const storePayments=useStorePayments()
  const storeWorks=useStoreWorks()
  const {  selectedDate } = storeToRefs(storePayments)
  function handleSegmentChange(event) {
        tab.value = event.detail.value;
        console.log('hi')
      }
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
  // onMounted(() => {
  //   if (storePayments.selectedDate && storePayments.selectedDate.from) {
  //        storePayments.getIntervalPayments(storePayments.selectedDate.from, storePayments.selectedDate.to);
  //       // Perform other actions if needed
  //     }
  //     else{
  //        storePayments.getdayPayments(storePayments.selectedDate);
  //     }

  //       console.log(storePayments.selectedDate,'storePayments.selectedDate')
  //          watch(selectedDate, async (newValue, oldValue) => {
  //           console.log(selectedDate, 'gi');
  //     if (newValue && newValue.from) {
  //       await storePayments.getIntervalPayments(newValue.from, newValue.to);
  //       // Perform other actions if needed
  //     }
  //     else{
  //       await storePayments.getdayPayments(newValue);
  //     }
  //          })
  //      })
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
  const limit = ref(10);  // Start with 10 payments

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

// async function load(ev) {
//   console.log('increasing')
//   // Increase limit by 10 each time infinite scroll is triggered
//    limit.value += 10;
//   setTimeout(() => ev.target.complete(), 50);
// }


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
    background-color:#0c0a09;
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

.v-input__details {
    display:contents !important;
}

ion-input.search-input  {
    --background: none !important;
    --color: #000000;
    --placeholder-color: #ddd;
    --placeholder-opacity: 0.8;

    --padding-bottom: 0px !important;
    --padding-end: 10px;
    --padding-start: 10px;
    --padding-top: 0px !important;
    display: unset !important;
  }
  .input-wrapper.sc-ion-input-md {

    border:solid 0px grey  !important;
    border-radius: 5px;
    min-height: 30px ;

  }
  /* .sc-ion-input-md {
    display: unset;
  } */
  .input-wrapper.sc-ion-input-ios {

    border-radius: 5px;
    border:solid 1px grey !important;
    min-height: 30px ;
  }


</style>

<style lang="scss" scoped>

.payment {

.dateFormat {
  color: grey;
  font-size: clamp(10px, 2vw + 6px, 14px)!important; /* Dynamically scale with container size */

}
text-decoration: none;
cursor: pointer;
// gap: 16px;
margin-bottom: 16px;
color: #000000;
border-radius: 20px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0px 3px rgba(0, 0, 0, 0.08);
border: 1px 1px 1px 1px solid rgba(0, 0, 0, 0.1);

// min-height: 100px;
background-color: #e1e6df;
align-items: center !important;
ion-item {
--background: #ebf0e9;
--padding-top:0px !important;
--padding-bottom:0px !important;

}
.q-checkbox {
box-sizing: border-box !important;
}
// .sliding-item{
//   background: #e1e6df;
// }
.person {
  align-items: center;

}
span {
font-size: 13px;
}

.left {
align-items: center;
flex-basis: 60%;
gap: 16px;

span {
  flex: 1;
}

.tracking-number {
  text-transform: uppercase;
  max-width:65px;
}
}

.right {
gap: 16px;
flex-basis: 40%;
align-items: center !important;

.price {
  flex: 1;
  flex-basis: 10% !important;
  font-size: clamp(18px, 2vw + 18px, 20px)!important; /* Dynamically scale with container size */
  font-weight: 600px;
  align-items: center;
  min-width: 130px;
  span {
    font-size: 10px;
  }
}
.status-button{
  flex-basis: 37% !important;
  max-width: 140px;
  min-width: 108px;
}
}
}
.progress-buttom{
border-radius: 10px !important;
flex-basis: 37% !important;
width:100%;
  max-width: 140px;
  min-width: 108px;
}
.ion-dark .payment {
background-color: #1c1917;
color: #ffffff;
ion-item {
  --background: #1c1917;
}
}

:deep(.dropdown-trigger) {
  position: relative;
  z-index: 11;
  display: flex;
  align-items: center;
  height: 100%;
}

.icon-wrapper {
  position: relative;
  z-index: 100;
  pointer-events: auto;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0px 0px 0px 8px;

  .dropdown-container {
    position: relative;
    z-index: 101;
    display: flex;
    align-items: center;
    height: 100%;
  }
}

:deep(.sliding-item) {
  &:has(+ .icon-wrapper:hover),
  &:has(~ .icon-wrapper:hover) {
    --ion-item-background: transparent !important;
    --background-hover: transparent !important;
    --background-activated: transparent !important;
    --background-focused: transparent !important;
    --ripple-color: transparent !important;
    background: transparent !important;

    &::part(native) {
      background: transparent !important;
    }
  }
}

// Prevent button hover state
ion-item {
  &:has(.icon-wrapper:hover) {
    --background-hover: transparent !important;
    --background-activated: transparent !important;
    --background-focused: transparent !important;
    --ripple-color: transparent !important;
    pointer-events: none;

  }
}

// Remove hover effects globally when dropdown is open
:deep([data-state="open"]) {
  & ~ ion-item,
  & ~ .sliding-item,
  & ~ * ion-item {
    --background-hover: transparent !important;
    --background-activated: transparent !important;
    --background-focused: transparent !important;
    --ripple-color: transparent !important;
    pointer-events: none !important;
  }
}
</style>

<style lang="scss">
.v-progress-linear__background {
border-radius: 10px !important;
}
.v-progress-linear__determinate {
position: initial !important;
}
.fade-out {
opacity: 0;
transition: opacity 0.3s ease-in-out;
}
.line-through {
  text-decoration: line-through;
}
// Prevent ion-item ripple effect when dropdown is open
:deep(.ion-activated) {
  --ion-color-primary: transparent !important;
  --ion-color-primary-contrast: transparent !important;
  --ion-color-primary-shade: transparent !important;
  --ion-color-primary-tint: transparent !important;
  --ion-ripple-color: transparent !important;
}

// Override ion-item button styles when dropdown is active
:deep(.ion-item-button-active) {
  background: transparent !important;
  opacity: 1 !important;
}
</style>
