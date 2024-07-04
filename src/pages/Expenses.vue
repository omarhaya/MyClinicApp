<template>
          <div class="row">
        <q-card class="total-card col q-ma-sm bg-grey-3 ">
          <q-card-section>
            <div v-if="totals.length<=1" class="text-h6">Total</div>
            <div v-else class="text-h6">Totals</div>
            <div v-for="total in totals" class="text-h5"><span class="currency">{{ total.currency+' ' }}</span>{{formatMoney(total.totalPaid)}}</div>
          </q-card-section>
        </q-card>
        <q-card class="total-card col q-ma-sm bg-grey-3 ">
          <q-card-section>
            <div class="text-h6">New</div>
            <div class="text-h5">{{expenses.length}}</div>
          </q-card-section>
        </q-card>

       </div>
      <q-table
      :filter="filter"
      flat
      ref="tableRef"
      :rows="expenses"
      class="my-sticky-header-table1 col "
      :columns="columns"
      color="primary"
      row-key="invoiceId"
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
    <q-th v-show="editExpenses">
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
  <q-btn v-if="!mobile" color="primary" @click="newExpense">
           New Expense
        </q-btn>
        <q-btn v-else color="primary" @click="openExpenseModal">
           New Expense
        </q-btn>
        <v-btn variant="plain" density="compact" icon="mdi-chevron-left" @click="getPreviousDay"></v-btn>
        <q-icon size="20px" name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="storeExpenses.selectedDate" mask="YYYY-MM-DD" range today-btn>
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
          color="primary"
          icon-right="archive"
          no-caps
          @click="exportTable"
        />
      </template>

    <template v-slot:body="props">
        <q-tr  :props="props" >
          <q-td  v-show="editExpenses"  auto-width  key="invoiceId" :props="props">
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
          <q-icon  name="delete" size="20px" @click="storeExpenses.deleteExpense(props.row.expenseId)"/>
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

 <script setup>
 import { ref , toRaw, nextTick,onMounted,watch,computed} from 'vue';
 import { exportFile, useQuasar } from 'quasar'
 import { useStoreExpenses } from 'src/stores/storeExpenses'
 import { storeToRefs } from 'pinia'
 import { useStoreWorks } from 'src/stores/storeWorks';
 import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
 import { IonSegment, IonSegmentButton, IonHeader, IonLabel , IonToolbar ,IonPage ,IonContent, modalController} from '@ionic/vue';
//  import MobileExpenseModal from 'src/components/MobileExpenseModal.vue'
 import { Platform } from 'quasar';
 const $q = useQuasar()
 const storeExpenses=useStoreExpenses()
 const storeWorks=useStoreWorks()
 const {  selectedDate } = storeToRefs(storeExpenses)
 function handleSegmentChange(event) {
       tab.value = event.detail.value;
       console.log('hi')
     }
 onMounted(() => {
       storeExpenses.getdayExpenses(storeExpenses.selectedDate)
       console.log(storeExpenses.selectedDate,'storeExpenses.selectedDate')
          watch(selectedDate, async (newValue, oldValue) => {
           console.log(selectedDate, 'gi');
     if (newValue && newValue.from) {
       await storeExpenses.getIntervalExpenses(newValue.from, newValue.to);
       // Perform other actions if needed
     }
     else{
       await storeExpenses.getdayExpenses(newValue);
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
 const expenses = computed(() => {
   const selectedExpenses = storeExpenses.dayExpenses[storeExpenses.selectedDate];
   if (selectedExpenses) {
     selectedExpenses.forEach(expense => {
       if (expense && storeWorks.expensesWorks[expense.workId]) {
         const workDetails = storeWorks.expensesWorks[expense.workId];
         expense.work = workDetails.label;
         expense.color = workDetails.color;
         expense.workTotal = workDetails.price - workDetails.discount;
         expense.patientName = workDetails.patientName;
         expense.currency = workDetails.currency;
         expense.doctor = workDetails.doctor;
         expense.remaining = expense.workTotal - workDetails.allPaid;
       }
     });

     // Sort expenses by expense.dateUnix in descending order
     selectedExpenses.sort((a, b) => b.dateUnix - a.dateUnix);

     return selectedExpenses;
   } else {
     return [];
   }
 });

 function  newExpense() {
 storeExpenses.TOGGLE_EXPENSE()
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
         if (typeof storeExpenses.selectedDate === 'object') {
           date = storeExpenses.selectedDate.to
         } else {
           date = storeExpenses.selectedDate
         }
       const dateObject = new Date(date);
       dateObject.setDate(dateObject.getDate() + 1);
       storeExpenses.selectedDate= dateObject.toISOString().split('T')[0];
     }
    function getPreviousDay() {
      let date
         if (typeof storeExpenses.selectedDate === 'object') {
           date = storeExpenses.selectedDate.from
         } else {
           date = storeExpenses.selectedDate
         }
       const dateObject = new Date(date);
       dateObject.setDate(dateObject.getDate() - 1);
       storeExpenses.selectedDate= dateObject.toISOString().split('T')[0];
     }
 const tab= ref('expenses')
 const editExpenses=ref(false)
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
   const expenses = storeExpenses.dayExpenses[storeExpenses.selectedDate];

   if (expenses && expenses.length > 0) {
     const totalByCurrency = expenses.reduce((totals, expense) => {
       const { currency, paid } = expense;

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
     // Return default value when expenses is empty or undefined
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
           expenses.value.map(row => columns.map(col => wrapCsvValue(
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

 const openExpenseModal = async () => {
    const modal = await modalController.create({
      component: MobileExpenseModal,
      presentingElement:page.value.$el,
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss( storeExpenses.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }
  }
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
 .panel-properties {
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
 </style>
