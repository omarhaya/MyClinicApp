<template>
  <div class="expense-wrap flex flex-column">
     <LoadingPaymentModal v-if="!mobile" v-show="loadingModal" />
     <form ref="expenseFormRef" id="form" name="name" @submit.prevent="submitForm" class="expense-content">
      <!-- <v-banner
      v-if="mobile"
      :sticky="true"
      lines="one"
    >
    <div class="row justify-between">
     <div >
     <q-btn flat @click="closeExpense">Cancel</q-btn>
       </div>
       <div >
        <h5 v-if="!storeExpenses.editExpense">New Expense</h5>
       <span v-else>Edit Expense</span>
      </div>
      <div class="justify-end">
   <q-btn flat v-if="!storeExpenses.editExpense" type="submit">Create</q-btn>
   <q-btn flat v-if="storeExpenses.editExpense" type="sumbit">Update</q-btn>
  </div>
    </div>
    </v-banner> -->
       <div class="m1" v-if="!storeExpenses.editExpense&&!mobile">New Expense</div>
       <div class="m1" v-if="storeExpenses.editExpense&&!mobile">Edit Expense</div>

       <!-- Patient Details -->
       <div class="patient-details flex flex-column">
         <h4>Patient Details</h4>

         <div class="input flex">
           <div class="input flex flex-column">
             <label for="patient">Patient's Name</label>
             <!-- <q-btn @click="console1">hi</q-btn> -->
             <v-autocomplete
              v-model="storeExpenses.patient"
              @update:model-value="getPatientInvoices"
              :items="options"
              chips
              item-title="namef"
              item-value="patientId"
              clearable
              return-object
              density="compact"
              transition="scroll-y-transition"
            >
            <template v-slot:chip="{ props, item }">
                <q-chip
                  v-bind="props"
                  dense
                >
                <q-avatar class="absolute" font-size="15px" color="white" text-color="black" icon="person" />
             <div class="q-ml-md">{{ item.raw.namef }}</div>
              </q-chip>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.namef"
                  :subtitle="item.raw.index"
                ></v-list-item>
              </template>
            </v-autocomplete>
           </div>

         </div>
         <div class="input flex flex-column">
             <label for="appointmentDate">Appointment's Date</label>
             <q-input id="appointmentDate" v-model="appointmentDate" dense type="date" ></q-input>
           </div>
        </div>
     <!-- Invoice Details -->
     <div :class="{ 'invoice-details flex flex-column': !mobile, 'invoice-details-mobile flex flex-column': mobile }">
         <h4>Invoice Details</h4>
         <div class="input ">
           <div class="input flex flex-column">
             <label for="type">Invoice Number</label>
             <v-select
              required
              :disabled="storeInvoices.loading||storeExpenses.loading||!storeExpenses.patient"
              :loading="storeInvoices.loading||storeExpenses.loading"
              v-model="storeExpenses.expenseInvoices"
              :items="patientInvoices"
              chips
              closable-chips
              single-line
              :menu-props="{ location: 'top' }"
              item-value="invoiceId"
              return-object
              multiple
              clearable
              density="compact"
              transition="scroll-y-transition"
            >
              <template v-slot:chip="{ props, item }">

                <q-card v-if="storeInvoices.loading||storeExpenses.loading" class="card-invoice" flat bordered>
          <q-card-section>
        <div  class="row items-center no-wrap">
          <div class="text-overline q-pl-md col"><q-item-label caption>
          <q-skeleton type="text" width="22%" />
        </q-item-label>
      </div>

          <div class="col-auto">
            <q-btn v-bind="props" flat round icon="close" color="black" background-color="grey" right class="justify-end close-button" />
          </div>
        </div>
      </q-card-section>

      <q-item style="max-width: 300px">
      <q-item-section avatar>
        <q-skeleton type="QAvatar" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-skeleton type="text" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" width="65%" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" width="75%" />
        </q-item-label>
      </q-item-section>
    </q-item>
    </q-card>
                <q-card v-else class="card-invoice" flat bordered>
          <q-card-section>
        <div  class="row items-center no-wrap">
          <div class="text-overline q-pl-md col">#{{ item.raw.invoiceId }}</div>

          <div class="col-auto">
            <q-btn v-bind="props" flat round icon="close" color="black" background-color="grey" right class="justify-end close-button" @click=" removeInvoice(item.raw.invoiceId)  "/>
          </div>
        </div>
      </q-card-section>

      <q-list>
        <q-item v-bind="props" :disable="work.paidPercentage==100" @click.stop.prevent v-for="work in item.raw.works" :class="`${work.selected ? `bg-${work.color}-1` : ''}`" clickable @click="selectWork(work,item.raw.works)">
          <q-item-section avatar>
            <q-circular-progress
      show-value
      font-size="13px"
      :value="work.paidPercentage"
      :color="work.paidPercentage==100?'teal-4':'orange'"
      track-color="grey-3"
      size="50px"
      :thickness="0.15"
      reverse
    >
    <span v-if="work.paidPercentage<100">
     {{work.paidPercentage+'%'}}</span>
     <q-icon v-else name="done" size="25px" color="teal-4"> </q-icon>
    </q-circular-progress>
          </q-item-section>
          <q-item-section>
            <q-item-label :class="`q-mt-xs text-${work.color} text-bold`">{{ work.label }}</q-item-label>
            <q-item-label caption><div class="text-black">Total: <span class="currency">{{work.currency }}</span>{{ formatMoney(work.price-work.discount) }}</div> <div class="text-orange">Remaining: <span class="currency">{{work.currency }}</span>{{ formatMoney(work.price-work.discount-work.allPaid) }}</div></q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item
                  @click="selectWorksInvoice(item.raw)"
                  v-bind="props"
                  :prepend-avatar="item.raw.avatar"
                  :title="item.raw.label"
                  :subtitle="item.raw.group"
                  :color="item.raw.color"
                  class="col-4"
                >
               <q-item>
            <q-item-section class="col-4">
                #{{ item.raw.invoiceId }}
    <q-circular-progress
      show-value
      font-size="13px"
      :value="item.raw.works.overallPercentage"
      :color="item.raw.works.overallPercentage==100?'teal-4':'orange'"
      track-color="grey-3"
      size="50px"
      :thickness="0.15"
      reverse
    >

    <span v-if="item.raw.works.overallPercentage<100">
     {{item.raw.works.overallPercentage+'%'}}</span>
     <q-icon v-else name="done" size="25px" color="teal-4"> </q-icon>
    </q-circular-progress>
            </q-item-section>
            <q-item-section class="col-8">
              <div v-for="work in item.raw.works" > <q-item-label :class="`q-mt-xs text-${work.color}`">{{ work.label }}</q-item-label>
              </div>
              <q-item-label caption>{{ item.raw.invoiceDate }}</q-item-label>
            </q-item-section>
          </q-item>
          </v-list-item>
              </template>

            </v-select>
            <div v-if="storeExpenses.expenseInvoices"  v-for="currency in uniqueCurrencies">
            <!-- <q-input v-if="expenseItemList[currency]" mask="###,###,###" reverse-fill-mask  :suffix="currency" dense  type="text" v-model="expenseItemList[currency].paid" :rules="[ val => val!=='0' || 'Please use maximum 3 characters']" required >
                         <template v-slot:append>
                          <q-knob
                          reverse
                          :step="25"
                          v-model="expenseItemList[currency].percentage"
                          show-value
                          size="30px"
                          :thickness="0.22"
                          :color="expenseItemList[currency].percentage==100?'green':'orange'"
                          track-color="grey-2"
                          :class="expenseItemList[currency].percentage==100?'text-green':''"
                        > {{ expenseItemList[currency].percentage }}</q-knob>
                          </template>
                       </q-input> -->

                       <v-text-field   required autofocus  density="compact" @input="calculatePercentage2(expenseItemList[currency])" color="primary" :prefix="currency" dense  type="tel" v-model="expenseItemList[currency].paid" >
                         <template v-slot:append>
                          </template>
                       </v-text-field>
                       <!-- <ion-input  ref="paidRef" required v-model="expenseItemList[currency].paid" @input="calculatePercentage2(expenseItemList[currency])" type="tel" placeholder="Enter Amount">
                        <div slot="start" aria-hidden="true">{{ currency }}</div>
                      </ion-input> -->
        </div>
       </div>
         </div>

       </div>


       <!-- Save/Exit -->
       <div class="save flex">
         <div class="left">
           <button v-if="!mobile" type="button" @click="closeExpense" class="red">Cancel</button>
         </div>
         <div class="right flex">
           <!-- <button v-if="!storeExpenses.editExpense" type="submit"  class="grey">Draft</button> -->
           <button v-if="!storeExpenses.editExpense&&!mobile" type="submit" class="green">Add Expense</button>
           <button v-if="storeExpenses.editExpense&&!mobile" type="sumbit" class="green">Update Expense</button>
         </div>
       </div>
     </form>
   </div>
 </template>

 <script setup>
 import LoadingPaymentModal from './LoadingPaymentModal.vue'
 import { useStoreExpenses } from 'src/stores/storeExpenses'
 import { useStoreWorks } from 'src/stores/storeWorks'
 import { storeToRefs } from 'pinia'
 import { useStorePatients } from 'src/stores/storePatients'
 import { ref,computed,reactive,watch } from 'vue'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { useQuasar } from 'quasar'
import { uid } from 'uid'
import { Platform } from 'quasar';
import { IonInput, IonItem, IonList } from '@ionic/vue';
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

 const storeExpenses=useStoreExpenses()
 const storePatients=useStorePatients()
 const storeWorks=useStoreWorks()
 const storeInvoices=useStoreInvoices()
 const {loadingModal} = storeToRefs(storeExpenses)
 const $q= useQuasar()
 const     patient= ref(null)
 const     appointmentDate=ref(null)
 const     expenseInvoices=ref(null)
 const     expenseItemList=ref({})
 const     patientInvoices=computed(()=>{
if(storeExpenses.patient){
  return storeInvoices.GET_PATIENT_INVOICES(storeExpenses.patient.patientId)||[]
}
else return storeInvoices.invoiceData

 })

 const uniqueCurrencies = computed(() => {
  const selectedWorks = [];
  // Add a check to ensure storeExpenses.expenseInvoices is not null or undefined
  if (storeExpenses.expenseInvoices) {
    storeExpenses.expenseInvoices.forEach(expenseInvoice => {
      const filteredWorks = expenseInvoice.works.filter(work => work.selected);
      selectedWorks.push(...filteredWorks);
    });
  }
  const uniqueCurrencies = [...new Set(selectedWorks.map(item => item.currency))];
  console.log('uniqueCurrencies:', uniqueCurrencies); // Debugging
  return uniqueCurrencies;
});

// Define watcher outside the function
watch(uniqueCurrencies, (newVal, oldVal) => {
  const expenseItemListCurrency = {};
  if (Array.isArray(newVal)) {
    newVal.forEach(currency => {
      expenseItemListCurrency[currency] = {
        paid: 0,
        percentage: 0,
        currency,
      };
    });
  }
  expenseItemList.value = expenseItemListCurrency;
  console.log('expenseItemList:', expenseItemList.value);
}, { immediate: true }); // Immediate option ensures the watcher runs immediately after setup

const selectWorksInvoice = (option) => {
  console.log(option,'option');
  option.works.forEach(work => {
    if (parseInt(work.paidPercentage) !== 100) {
      work.selected = true;
    }
  });
};
 function closeExpense() {
       storeExpenses.TOGGLE_EXPENSE()
       if (storeExpenses.editInvoice) {
        storeExpenses.TOGGLE_EDIT_INVOICE();
       }
     }

     const calculatePercentage2 = (expenseItemList) => {
      const selectedWorks = [];
  // Add a check to ensure storeExpenses.expenseInvoices is not null or undefined
  if (storeExpenses.expenseInvoices) {
    storeExpenses.expenseInvoices.forEach(expenseInvoice => {
      const filteredWorks = expenseInvoice.works.filter(work => work.selected);
      selectedWorks.push(...filteredWorks);
    });
  }
  let workItem=selectedWorks[0]
  // const price = parseInt(workItem.price.replace(/\,/g, '')) || 0;
  //       const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0;

        expenseItemList.paid=formatWithCommas(expenseItemList.paid)

     console.log(selectedWorks,'work')
       }
       const calculateValue2 = (workItem) => {
        const price = parseInt(workItem.price.replace(/\,/g, '')) || 0;
        const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0;
        const total =(price - discount)
        const percent=workItem.expenseItemList.value/100
        if(workItem.expenseItemList.value!==0){
        workItem.expenseItemList.paid=(String((total*percent).toFixed(0)))
        workItem.expenseItemList.paid=formatWithCommas(workItem.expenseItemList.paid)
        }
       else workItem.expenseItemList.paid=0
      }
      const calculateKnobPercentage=(workItem)=>{
        if(workItem.expenseItemList.value>0)
        return workItem.expenseItemList.value.toFixed(0)
      else return workItem.expenseItemList.value=0

      }
 /*
   Patients
 */
 const createValue= (val, done)=> {
       if (val.length > 0) {
         const duplicate = storePatients.patients.some(patient => patient.namef === val)
         if (duplicate) {
           $q.notify({
           color: 'negative',
           message: 'Choose The Same Patient from List or choose different Name!!'
         })}
         else{
         const Patient = ref({
           namef:val,
           age:'',
           gender:'',
           phone:'',
           patientId:uid()
         })
         storePatients.addPatient(Patient.value)
           $q.notify({
           color: 'positive',
           message: 'Patient Added'
         })
         done(Patient.value, 'toggle')
         }
       }
       }
       const  filterPatients = (val, update) => {
       if (val === '') {
       update(() => {
         options.value = storePatients.patients
       })
       return
       }
       else{
       update(() => {
       const needle = val.toLowerCase()
       options.value = storePatients.patients.filter(v => v.namef.toLowerCase().indexOf(needle) > -1)
       })}
       }
       const options = ref(storePatients.patients)
       function getPatientInvoices(){
        if(storeExpenses.patient)
        storeInvoices.SET_PATIENT_INVOICES(storeExpenses.patient.patientId)
       }
const selectWork=(work,works)=>{
  work.selected=!work.selected
}
/*
 Submission
*/
    defineExpose({
      submitFormMobile
    })
    const expenseFormRef = ref(null)
    function submitFormMobile (){
   const form = expenseFormRef.value
   form.reportValidity()
   submitForm()
    }

function submitForm() {
       if (storeExpenses.editExpense) {
         updateExpense()
         return
       }
       uploadExpense()
     }
    function uploadExpense() {
      const worksByCurrency = {}
      storeExpenses.expenseInvoices.forEach(expenseInvoice => {
        expenseInvoice.works.forEach(work => {
          if (!worksByCurrency[work.currency]) {
            worksByCurrency[work.currency] = []
          }
       worksByCurrency[work.currency].push(work)
        })
      })
      Object.keys(worksByCurrency).forEach(currency => {
        const works = worksByCurrency[currency]
        console.log(works,'works')
        // Filter the 'works' array to get only the objects where 'selected' is true
        const selectedWorks = works.filter(work => work.selected === true)
        // Check the length of the filtered array
        console.log(expenseItemList.value[currency].paid,'paid')
        if (selectedWorks.length === 1&&expenseItemList.value[currency].paid!==0) {
          const work=({
           expenseItemList:expenseItemList.value[currency],
           currency,
           workId:selectedWorks[0].workId,
           invoiceId:selectedWorks[0].invoiceId,
           doctor:selectedWorks[0].doctor,
           patientDetails:storeExpenses.patient,
         })
            storeExpenses.addExpense(work)
        }
        else{

          if(expenseItemList.value[currency].paid<1){
            $q.notify({
          type: 'orange',
          message: 'Please add Value to Pay!'
        })
          }
          else
          $q.notify({
          type: 'negative',
          message: 'You Cant Choose Two Works to Pay!'
        })
        }
        });
     }

     function updateExpense() {

       storeInvoices.updateInvoice(data)
     }
const removeInvoice = (invoiceId) => {

  const index = storeExpenses.expenseInvoices.findIndex(item => item.invoiceId === invoiceId);
  console.log(invoiceId,storeExpenses.expenseInvoices,index)
  if (index !== -1) {
    storeExpenses.expenseInvoices.splice(index, 1);
  }
};
/*
    Styling
*/

       const formatMoney = (value) => {
         const stringValue = value.toString()
         return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
       }
       const formatWithCommas = (number) => {
        // Remove existing commas and leading zeros before formatting
        const formattedNumber = number.replace(/,/g, '').replace(/^0+/, '');

        // Split the number into integral and decimal parts (if any)
        const parts = formattedNumber.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Join the integral and decimal parts (if any) and return the formatted number
        return parts.join('.');
      };
 </script>

<style lang="scss" scoped>

.expense-wrap {
  position:static;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: scroll;
  background-color:white;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 900px) {
    left:57px;
    min-width: 500px;
  }

  .expense-content {
    position: relative;
    // padding: 36px;
    height:initial;
    // max-width: 400px;
    width: 100%;
    background-color: #ffffff;
    color: #2f2e2e;

    h1 {
      margin-bottom: 48px;
      color: #131212;
    }

    h3 {
      font-size: 18px;
      line-height: 2.125rem;
      color: #141516;
    }

    h4 {
      color: #109809;
      font-size: 14px;
      margin-bottom: 24px;
    }
    h5 {
      color: #000000;
      font-size: 14px;
      line-height: 1.2rem;
    }
    h6 {
      font-size: 14px;
    }
    .card-invoice{

            width:100%;
            .q-card__section--vert {
            padding: 0px;
            }
          }
    .card-invoice:hover {
   cursor: pointer;
    }
    // Bill To / Bill From
    .bill-to,
    .patient-details {
      margin-bottom: 36px;
     @media (min-width: 900px) {
      // width: 700px;
      padding-left: 36px;
      padding-right:36px;
     }
     @media (max-width: 900px) {
      padding-left: 10px;
      padding-right:10px;
     }

      .input {

        gap: 16px;
        div {
          flex: 1;
          .row{
            flex:none;
          }
        }
      }

    }
    .invoice-details {
      @media (min-width: 900px) {
      width:500px;
      padding-left: 36px;
      padding-right:36px;
     }
     @media (max-width: 900px) {
      padding-left: 10px;
      padding-right:10px;
     }

    }

    .invoice-details-mobile {
      @media (min-width: 900px) {
      // width:500px;
      padding-left: 36px;
      padding-right:36px;
     }
     @media (max-width: 900px) {
      padding-left: 10px;
      padding-right:10px;
     }

    }
    // Invoice Work & Expense

    .invoice-expense {

      .expense {
        gap: 24px;
        div {
          flex: 1;
        }
      }

      .work-items {
        input{
          background-color: #fff;
        }

        .item-list {
          width: 100%;
          // Item Table Styling
          .table-heading,
          .table-items {
            gap: 16px;
            font-size: 12px;
            .price {
              flex-basis: 19%;
            }
            .percent {
              flex-basis: 19%;
            }
            .discount {
              flex-basis: 19%;
            }
            .invoice-to {
              flex-basis: 20%;
              align-self: center;
            }
            .q-field{
               max-width:min-content;
               background-color: #fff !important;
              }

          }

        }
      }
      .expense-items {

        .item-list {
          width: 100%;

          // Item Table Styling
          .table-heading,
          .table-items {
            gap: 16px;
            font-size: 12px;
            .total {
              flex-basis: 35%;
              align-self: center;
            }

            .paid-item {
              flex-basis: 35%;
            }

            .remaining {
              flex-basis: 30%;
              align-self: center;
            }
          }
          .table-heading {
            th {
              text-align: left;
            }
          }
          .table-items {
            position: relative;

            img {
              position: absolute;
              top: 15px;
              right: 0;
              width: 12px;
              height: 16px;
            }
          }
        }
        .button {
          color: #000000;
          background-color: #ffffff;
          align-items: center;
          justify-content: center;
          width: 100%;
          img {
            margin-right: 4px;
          }
        }
      }
    }

    .save {
      padding:36px;
      .right {
        justify-content: flex-end;
      }
    }
  }

  .input {
    margin-bottom: 0px;
  }

  label {
    font-size: 12px;
    margin-bottom: 6px;
  }

  input,
  select {
    width: 100%;
    background-color: #e2e4f0;
    color: #000000;
    border-radius: 4px;
    padding: 12px 4px;
    border: none;

    &:focus {
      outline: none;
    }
  }

.flex {
    flex-wrap:nowrap
}
}
.m1 {
    font-size: 2.5em;
    font-weight:bold;
    padding:36px 0px 0px 36px;
      }
.q-field {
             height: auto;
             padding: 0 12px;
             width: 100%;
             background: rgba(211, 54, 54, 0.05);
             border-radius: 4px;
             background-color: #e2e4f0;
             transition: box-shadow 0.36s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.36s cubic-bezier(0.4, 0, 0.2, 1);
          }
.work-card {
    margin-left: -57px !important;
    margin-bottom:-4px;
    width: 119.2% !important;
    box-shadow: inset 0px 1px 6px -2px rgba(0, 0, 0, 0.2), 0 0px 0px rgba(0, 0, 0, 0.14), 0 0px 0px 0px rgba(0, 0, 0, 0.12) !important;
    border-radius: 0px !important;
    vertical-align: top;
    background: #fff;
    position: relative;
      .work-item {
      padding-right: 57px;
      padding-left: 57px;
        .q-field{

                  background-color: #fff !important;
                }

      }

}
.close-button {
         padding: 0 !important;
         margin-top:5px
        }
 .close-icon:hover {
   cursor: pointer;
}
.v-input {
  height: auto;
  padding: 0 12px ;
  width: 100%;
  background: rgba(211, 54, 54, 0.05);
  border-radius: 4px;
  background-color: #e2e4f0;
  transition: box-shadow 0.36s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.36s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0px;
  margin-bottom: 6px;
}

</style>
<style lang="scss">
.v-field__overlay{
    background-color: none ;
    opacity: 0 !important;
    transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .v-field {
    font-size: 13px !important;
    --v-field-padding-start: 0px !important;
    --v-field-padding-end: 0px !important;
    --v-field-padding-top: 8px;
    --v-field-padding-bottom: 4px;
    --v-field-input-padding-top: calc(var(--v-field-padding-top, 8px) + var(--v-input-padding-top, 0));
    --v-field-input-padding-bottom: var(--v-field-padding-bottom, 4px);
}
.v-input__details {
    display: none !important;
}
.invoice-details,.invoice-details-mobile{
  .v-select__selection {
    display: contents !important;;
    align-items: center;
    height: 1.5rem;
    letter-spacing: inherit;
    line-height: inherit;
    max-width: calc(100% - 2px);
}
}


.v-banner__content {
    align-items: center;
    display: table !important;
    grid-area: content;
}
.v-banner {
    z-index: 1;
    padding-inline: 0px 0px !important;
    border-style: none !important;
    background-color: #ffffffc6 !important;
    backdrop-filter: blur(3px);
}
.v-card {
  border-radius: 15px 15px 0px 0px !important; /* Adjust the radius according to your preference */
}
</style>
