<template>

  <div class="invoice-wrap flex flex-column">
     <Loading v-show="loadingModal" />
     <form @submit.prevent="submitForm" class="invoice-content">
       <div class="m1" v-if="!storeInvoices.editInvoice">New Invoice</div>
       <div class="m1" v-else>Edit Invoice</div>

       <!-- Patient Details -->
       <div class="type-work flex flex-column">
         <h4>Patient Details</h4>

         <div class="patient-details flex">
           <div class="input flex flex-column">
             <label for="patient">Patient's Name</label>
             <!-- <q-btn @click="console1">hi</q-btn> -->
       <q-select
         v-model="patient"
         id="patient"
         use-chips
         use-input
         fill-input
         :input-style="patient!==null ? { zIndex: -100, } : {}"
         input-class
         validate-on
         :options="options"
         :loading="storePatients.loading"
         :disable="storePatients.loading"
         transition-show="jump-up"
         transition-hide="jump-down"
         @filter="filterPatients"
         color="primary"
         options-selected-class="text-primary "
         option-label="namef"
         option-value="namef,patientId"
         emit-value
         map-options
         dense
         required
         autofocus
         @new-value="createValue"
         popup-content-class="menu-style"
         popup-content-style="width:100px"
         persistent
         menu-anchor="bottom start"
         menu-self="top start"
         virtual-scroll-slice-size="60"
       >
         <template v-slot:option="scope">
           <q-item style="width:absolute" v-bind="scope.itemProps">
             <q-item-section col avatar>
               <q-icon class="row" name="person" />
               <div v-if="scope.opt.index!==''" class="row">#{{ scope.opt.index }} </div>
             </q-item-section>
             <q-item-section>
               <q-item-label>{{ scope.opt.namef }}</q-item-label>
               <q-item-label   caption><div v-show="scope.opt.age >0" > Age: {{ scope.opt.age }}</div></q-item-label>
             </q-item-section>
           </q-item>
         </template>
           <template v-slot:no-option>
           <q-item>
             <q-item-section class="text-grey">
               No Such a Patient "press Enter to Add as New"
             </q-item-section>
           </q-item>
         </template>
         <template v-slot:selected-item="scope">
           <q-chip
             removable
             dense
             @remove="scope.removeAtIndex(scope.index)"
             :tabindex="scope.tabindex"
             color="white"
             text-color="black"
             class="q-ma-none"
           >
             <q-avatar color="black" text-color="white" icon="person" />
             {{ scope.opt.namef||scope.opt }}
           </q-chip>
         </template>
       </q-select>
           </div>
           <div class="input flex flex-column">
             <label for="appointmentDate">Appointment's Date</label>
             <q-input id="appointmentDate" v-model="appointmentDate" dense type="date" ></q-input>
           </div>
         </div>

            <!-- Invoice Work Details -->
            <div class="flex flex-column">
         <h4>Work Details</h4>
         <div class="patient-details flex">
           <div class="input flex flex-column">
             <label for="type">Type of Work</label>
             <v-autocomplete
              v-model="storeInvoices.workItemList"
              :items="workOptions"
              :custom-filter="customFilter"
              chips
              closable-chips
              single-line
              item-text="label"
              item-value="workId"
              return-object
              multiple
              clearable
              density="compact"
              transition="scroll-y-transition"
            >
              <template v-slot:chip="{ props, item }">
                <q-chip
                  v-bind="props"
                  removable
                  dense
                  :color="item.raw.color"
                  @remove="deleteWorkItem(item.raw.workId)"
                >
                <q-avatar class="absolute" font-size="15px" color="white" text-color="black" icon="medical_services" />
             <div class="q-ml-md">{{ item.raw.label }}</div>
              </q-chip>
              </template>

              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :prepend-avatar="item.raw.avatar"
                  :title="item.raw.label"
                  :subtitle="item.raw.group"
                  :color="item.raw.color"
                ></v-list-item>
              </template>
            </v-autocomplete>
       </div>


         </div>
          <div class="row ">
           <div v-for="opt in mapWorkOptions">
               <q-chip
               v-if="!storeInvoices.workItemList.some((option) => option.label === opt.label)"
               clickable
               @click="addNewWorkItem(opt)"
               dense
               :color="opt.color"
               text-color="white"
               icon="medical_services"
               square
               >
                 {{opt.label}}
               </q-chip>
           </div>
        </div>
         <!-- <div class="input flex flex-column">

           <label for="workDescription">Description</label>
           <input required type="text" id="workDescription" v-model="workDescription" />
         </div> -->
       </div>
       </div>

         <q-card v-for="(workItem,index) in storeInvoices.workItemList" :key="index" :class="workCardClass(workItem)" class="work-card no-warp">

          <div class="work-item" >
            <div class="row"> <h3 class="col"  :style="`color:${workItem.color}`">{{ workItem.label }}</h3><q-btn flat round :color="workItem.color" icon="close"  class="justify-end close-button" @click="deleteWorkItem(workItem.workId)"/></div>
            <q-chip  clickable @click="storeInvoices.TOGGLE_TEETHSELECTION(index)">Add Teeth +     <q-dialog
                      :key="'dialog_' + index"
                      full-width
                      full-height
                      allow-focus-outside
                      v-model="storeInvoices.teethModals[index]"
                      >
                        <TeethSelectionModal :workItem="workItem" @toothSelected="handleToothSelected(workItem, $event)" />
                      </q-dialog>
            </q-chip>
            <span v-for="tooth in workItem.teeth" key="tooth" > {{ tooth }}</span>
                <div class="row">
                   <div class="col q-pr-lg">
                     <label for="price">Description</label>
                     <v-combobox
                      v-model="workItem.description"
                      multiple
                      :items="workSubOptions.find(item1 => item1.work ===workItem.label)?.data || []"
                      id="work.description"
                      chips
                      :color="workItem.color"
                      transition="scroll-y-transition"
                      @update:model-value="handleWorkItemChange"
                    >
                    <template v-slot:chip="{ props, item ,index}">
                <q-chip
                  v-bind="props"
                  removable
                  dense
                  color="grey-3"
                  :text-color="`${workItem.color}-8`"
                  @remove="workItem.description.splice(index, 1)"
                >
             <div >{{ item.raw }}</div>
              </q-chip>
              </template>
                </v-combobox>
                   </div>
                   <div class="col">
                     <div class="row ">
           <div v-for="(opt,index) of workOptions2.find(item1 => item1.work ===workItem.label)?.data || []">
               <q-chip
               v-if="!workItem.description.some((option) => option === opt)"
               clickable
               @click="workItem.description.push(opt),showOptions()"
               dense
               color="grey-7"
               text-color="white"
               >
                 {{opt}}
               </q-chip>
           </div></div>
            </div>
            </div>
            <div class="row">
                   <div class="col q-pr-lg">
                     <div class="row">
                       <div class="col q-pr-lg">
                     <label for="item">Price</label>
              <v-text-field density="compact" :color="workItem.color" required  id="workItem.price"  @input="calculatePercentage(workItem)" :prefix="workItem.currency"  v-model="workItem.price" />

            </div>
                   <div class="col">
                     <label for="price">Currency</label>
              <v-select required hide-details density="compact"  id="currency" type="text" v-model="workItem.currency" :items="currencies"  :color="workItem.color"/>
                   </div>
                 </div>
                 </div>
                 <div class="col">
                     <div class="row">
                       <div class="col q-pr-lg">
                     <label for="price">Discount</label>
              <v-text-field  density="compact" :color="workItem.color" id="discount" @input="calculatePercentage(workItem)" :prefix="workItem.currency" mask="###,###,###" reverse-fill-mask v-model="workItem.discount" dense />
                   </div>
                   <div class="col">
                     <label for="price">Percentage</label>
              <v-text-field  density="compact" :color="workItem.color" id="percent"  prefix="%" type="number" @input="calculateValue(workItem)"  max="100" min="0" v-model="workItem.percent" dense />
                   </div>
                 </div>
                 </div>
            </div>

             <!-- Payment Details -->
             <div class="row">
             <div class="col ">
             <label for="paymentTerms">Payment Terms</label>
              <v-select
                  @update:menu="calculateDueDate(workItem,index)"
                  required
                  type="text"
                  id="paymentTerms"
                  hide-details
                  density="compact"
                  v-model="workItem.paymentTerms"
                  :items="['20 days','30 days','Immediate Payment']"
                  prefix="Net:"
                  :color="workItem.color"
                  dense
                  popup-content-class="menu-style"
              />
                 </div>
                 </div>
                 <div class="col ">
                     <div class="row">
                       <div class="col q-pr-lg">
                        <label for="invoiceDate">Invoice Date</label>
                      <v-text-field  density="compact" readonly dense  id="invoiceDate" v-model="invoiceDate" />
                   </div>
                   <div class="col">
                    <label for="paymentDueDate">Payment Due</label>
                      <v-text-field  density="compact" readonly dense  id="paymentDueDate" v-model="workItem.paymentDueDate" />
                   </div>
                 </div>
            </div>
              <div class="invoice-payment flex flex-column">
                <!-- Payments -->
                <div class="payment-items q-pt-lg">
                  <table class="item-list" v-if="workItem.paymentItemList">
                    <tr class="table-heading flex">
              <th class="total">Subtotal:</th>
              <th class="paid-item">Paid Amount</th>
              <th class="remaining flex">Remaining</th>
                    </tr>
                    <tr class="table-items flex" >
                      <td class="total"> {{ formatMoney(calculateTotalResultItem(workItem)) }}</td>
                      <td class="paid-item"><v-text-field  density="compact" @input="calculatePercentage2(workItem)" :color="workItem.color" :prefix="workItem.currency" dense  type="text" v-model="workItem.paymentItemList.paid" >
                         <template v-slot:append>
                          <q-knob
                          reverse
                          :step="25"
                          v-model="workItem.paymentItemList.value"
                          @change="calculateValue2(workItem)"
                          show-value
                          size="30px"
                          :thickness="0.22"
                          :color="workItem.paymentItemList.value==100?'green':'orange'"
                          :track-color="`${workItem.color}-2`"
                          :class="workItem.paymentItemList.value==100?'text-green':`text-${workItem.color}-8`"
                        > {{ calculateKnobPercentage(workItem) }}</q-knob>
                          </template>
                       </v-text-field></td>
                      <td class="remaining flex">{{ formatMoney(calculateRemaining(workItem))+' '+workItem.currency}}</td>
                      <img class="close-icon" @click="deletePaymentItem(index)" src="../assets/icon-delete.svg" alt="" />
                    </tr>
                  </table>
                  <div v-show="!workItem.paymentItemList" @click="addNewPaidItem(index)" class="flex button">
                    <img src="../assets/icon-plus.svg" alt="" />
                    <span>Add Payment</span>
                  </div>
                </div>
              </div>
           <div :class="`row text-${workItem.color}-7 text-bold q-pb-sm q-pt-md`">
           <div class="col">
            <label class="q-pr-sm" for="price">Paid to</label>
            <q-select
            popup-content-class="menu-style"
            v-if="!workItem.doctor"
            v-model="workItem.doctor"
            id="doctor"
            use-input
            fill-input
            :input-style="{zIndex:-100}"
            input-class
            prefix="Dr."
            :options="storeAuth.doctors"
            :loading="storeAuth.loadingDoctors"
            :disable="storeAuth.loadingDoctors"
            transition-show="jump-up"
            transition-hide="jump-down"
            options-selected-class="text-primary "
            option-label="name"
            map-options
            dense
            required
            :color="workItem.color"
            />
            <h6 class="q-pr-xl" v-if="workItem.doctor">Dr. {{ workItem.doctor.name }}<q-icon class="on-right close-icon" v-if="workItem.doctor" name="close" size="20px" @click="workItem.doctor=null"/></h6>
           </div>
           <div class="col text-right self-end">
            <label for="price">Subtotal:</label>
          {{ formatMoney((workItem.price.replace(/\,/g,'')-workItem.discount.replace(/\,/g,'') ))+' '+workItem.currency}}
          </div>
         </div>
       </div>
      </q-card>
         <div v-for="item in filteredItems" class="column q-pt-md text-bold">
          <div class="self-end">
                <h5 class="self-left text-green" for="total"> +{{ formatMoney(calculateTotal(item.currency)) }}  </h5>
                <h5 class="self-left  text-orange-10 " for="total"> -{{ formatMoney(calculateTotalDiscount(item.currency)) }}  </h5>

              <q-separator color="primary q-mb-xs q-mt-xs"  />
                <h5 class="self-left text-bold q-ml-sm" :class="{'text-primary' :(calculateTotalResult)>=0 , ' text-red ' :(calculateTotalResult(item.currency))<0 }"  for="total"> {{formatMoney(calculateTotalResult(item.currency)) }}  </h5>
              </div>
            </div>
       <!-- Save/Exit -->
       <div class="save flex">
         <div class="left">
           <button type="button" @click="closeInvoice" class="red">Cancel</button>
         </div>
         <div class="right flex">
           <button v-if="!storeInvoices.editInvoice" type="submit" @click="saveDraft" class="grey">Save Draft</button>
           <button v-if="!storeInvoices.editInvoice" type="submit" class="green">Create Invoice</button>
           <button v-if="storeInvoices.editInvoice" type="sumbit" class="green">Update Invoice</button>
         </div>
       </div>
     </form>
   </div>
 </template>

 <script setup>
 import { useQuasar } from 'quasar';
 import { uid } from 'uid'
 import Loading from './Loading.vue'
 import { ref,computed,reactive,watch } from 'vue'
 import { storeToRefs } from 'pinia'
 import { useStoreInvoices } from 'src/stores/storeInvoices'
 import { useStorePatients } from 'src/stores/storePatients'
 import { useStoreAuth } from 'src/stores/storeAuth'
 import { useStorePayments } from 'src/stores/storePayments'
 import { useStoreWorks } from 'src/stores/storeWorks'
 import TeethSelectionModal from 'src/components/TeethSelectionModal.vue'
 const $q=useQuasar()
 const storeInvoices=useStoreInvoices()
 const storePatients=useStorePatients()
 const storeAuth=useStoreAuth()
 const storePayments=useStorePayments()
 const storeWorks=useStoreWorks()
 const { paymentItemList,loadingModal,currencies,workItemList} = storeToRefs(storeInvoices)

  const     dateOptions= { year: "numeric", month: "short", day: "numeric" }
  const     docId= ref(null)
  const     patient= ref(null)
  const     appointmentDate=ref(null)
  const     invoiceDateUnix= ref(null)
  const     invoiceDate= ref(null)
  const     paymentTerms= ref('Immediate Payment')
  const     paymentDueDateUnix= ref(null)
  const     paymentDueDate= ref(null)
  const     invoicePending= ref(null)
  const     invoiceId= ref(uid(6))
  const     invoiceDraft= ref(null)
  const     invoiceWrap=ref(null)
  const     paymentTotal=ref(0)

const     customFilter= (itemTitle, queryText, item)=> {
        const textOne = item.raw.label.toLowerCase()
        // const textTwo = item.raw.abbr.toLowerCase()
        const searchText = queryText.toLowerCase()
        return textOne.indexOf(searchText) > -1
      }
const    handleWorkItemChange=(value)=> {
      // Implement logic to handle value changes
      console.log(value,'value'); // Check the value and its structure
      // You can manually handle what gets added to storeInvoices.workItemList
      // Check if the 'value' contains the correct 'workId' property
    }
   const calculateTotal = (currency) => {
  // You can calculate the total based on the currency here
  const total = storeInvoices.workItemList.reduce((accumulator, item) => {
    if (item.currency === currency) {
      const price = parseInt(item.price.replace(/\,/g, '')) || 0;
      return accumulator + price
    }
    return accumulator
  }, 0)
  return total+ ' '+ currency
  }
  const calculateTotalDiscount = (currency) => {
  // You can calculate the total based on the currency here
  const total = storeInvoices.workItemList.reduce((accumulator, item) => {
    if (item.currency === currency) {
      const discount = parseInt(item.discount.replace(/\,/g, '')) || 0;
      return accumulator + discount
    }
    return accumulator
  }, 0)
  return total+ ' '+ currency
  }
  const calculateTotalResult = (currency) => {
  // You can calculate the total based on the currency here
  const total = storeInvoices.workItemList.reduce((accumulator, item) => {
    if (item.currency === currency) {
      const price = parseInt(item.price.replace(/\,/g, '')) || 0;
      const discount = parseInt(item.discount.replace(/\,/g, '')) || 0;
      return accumulator + (price - discount)
    }
    return accumulator
  }, 0)
  return total+ ' '+ currency
  }

  const calculateTotalResultItem=(work) => {
  // You can calculate the total based on the currency here
    const price = parseInt(work.price.replace(/\,/g, '')) || 0;
    const discount = parseInt(work.discount.replace(/\,/g, '')) || 0;
    const total =(price - discount)
    return total+ ' '+ work.currency
  }

  const calculateRemaining=(item) => {
  if(item.paymentItemList.paid){
    const price = parseInt(item.price.replace(/\,/g, '')) || 0;
    const discount = parseInt(item.discount.replace(/\,/g, '')) || 0;
    const paid =  parseInt(item.paymentItemList.paid.replace(/\,/g, '')) || 0;
    const total =(price - discount)
    if(paid&&paid<=total)
   return total-paid
      else return 0
    }
    else {
      return parseInt(item.price.replace(/\,/g, '')-item.discount.replace(/\,/g, ''))
    }
    }

  // const paidEqualTotal =(item)=>{
  //   if(item.price){
  //   const price = parseInt(item.price.replace(/\,/g, '')) || 0;
  //   const discount = parseInt(item.discount.replace(/\,/g, '')) || 0;
  //   const total =(price - discount)
  //   item.paymentItemList.paid=String(total)
  //  }
  //  }
  const filteredItems = computed(() => {
    const uniqueValues = new Set()
    return storeInvoices.workItemList.filter((item) => {
      if (!uniqueValues.has(item.currency)) {
        uniqueValues.add(item.currency)
        return true
      }
      return false
    })
    })
  const workOptions1 = reactive([{
   label:'Fixed Applaince',
   color:'green',
   price: '5,000,000',
   discount:'0',
   currency:'IQD',
   description:[],
   doctor: '',
   teeth:[],
   workId:uid(),
   },
   {
   label:'Impacted Wisdom ',
   color:'red',
   price: '60,000',
   discount:'0',
   currency:'IQD',
   description:[],
   doctor: '',
   teeth:[],
   workId:uid(),
   },
   {
   label:'Implant',
   color:'lime',
   price: '0',
   discount:'0',
   currency:'IQD',
   description:[],
   doctor: '',
   teeth:[],
   workId:uid(),
   },
     {
   label:'Removable Orthodontic Appliance',
   color:'pink',
   price: '0',
   discount:'0',
   currency:'IQD',
   description:[],
   doctor: '',
   teeth:[],
   workId:uid(),
   }
  ])

  const workOptions=ref(workOptions1)
  const workOptions2 = reactive([ { work: 'Implant', data: ['ClassI44','classII','Class V','Composite','A2','A1']},
  { work: 'Removable Orthodontic Appliance', data: ['ClassI','classII2']},
  { work: 'Fixed Applaince', data: ['ClassI','classII3']}])

  const workSubOptions=ref(workOptions2)
  function showOptions(){console.log(storeInvoices.workItemList,'iteemlist')}
  const mapWorkOptions=computed(()=>{
  const map =[]
   workOptions1.forEach((option=>{
     const index = workOptions1.indexOf(option)
     if(index<4)
     map.push(option)
   })
   )
   return map
  })

  const handleToothSelected=(workItem,toothSelected)=>{
    workItem.teeth=toothSelected
    console.log(storeInvoices.workItemList)
  }
  const  filterSubWorkOptions = (val, update) => {
       if (val === '') {
       update(() => {
         workSubOptions.value = workOptions2
       })
       return
       }
       else{
       update(() => {
       const needle = val.toLowerCase()
       workSubOptions.value= workOptions2.map(obj => ({
       work: obj.work,
       data: obj.data.filter(item => item.toLowerCase().indexOf(needle) > -1)
        })
        )
       })}
       }
       const  filterWorkOptions = (val, update) => {
       if (val === '') {
       update(() => {
         workOptions.value = workOptions1
       })
       return
       }
       else{
       update(() => {
       const needle = val.toLowerCase()
       workOptions.value= workOptions1.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
       })}
       }
 /*
   Calculate Discount
 */
        const calculatePercentage = (workItem) => {
          workItem.price = formatWithCommas(workItem.price)
          workItem.discount = formatWithCommas(workItem.discount)
          const price = parseInt(workItem.price.replace(/\,/g, '')) || 0
          const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0
          const total = price - discount
          const percent = (discount / price) * 100
          workItem.percent = percent.toFixed(0).replace(/^0+/, '')

          if (workItem.paymentItemList) {
            if (workItem.paymentItemList.paid == 0) {
              workItem.paymentItemList.value = 0
            } else {
              const paid = parseInt(workItem.paymentItemList.paid.replace(/\,/g, ''));
              const calculatedValue = (paid / total) * 100

              workItem.paymentItemList.value = Number.isNaN(calculatedValue) ? 0 : Math.round(calculatedValue);
            }
          }
        }
        const calculateValue = (workItem) => {
          workItem.discount = ((workItem.price.replace(/\,/g, '') * (workItem.percent / 100)).toString()).replace(/\.\d+/, '');
          workItem.discount = formatWithCommas(workItem.discount);

          if (workItem.paymentItemList) {
            if (workItem.paymentItemList.paid == 0) {
              workItem.paymentItemList.value = 0;
            } else {
              const price = parseInt(workItem.price.replace(/\,/g, '')) || 0;
              const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0;
              const total = price - discount;
              const paid = parseInt(workItem.paymentItemList.paid.replace(/\,/g, ''));
              const calculatedValue = (paid / total) * 100;

              workItem.paymentItemList.value = Number.isNaN(calculatedValue) ? 0 : Math.round(calculatedValue);
            }
          }
        }
       const calculatePercentage2 = (workItem) => {
        const price = parseInt(workItem.price.replace(/\,/g, '')) || 0;
        const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0;
        const total =(price - discount)
        const paid =parseInt(workItem.paymentItemList.paid.replace(/\,/g, '')) || 0;
         workItem.paymentItemList.value = ((paid / (total)) * 100)
         if(!workItem.paymentItemList.paid){
          workItem.paymentItemList.value=0
          workItem.paymentItemList.paid=0
        }
       }
       const calculateValue2 = (workItem) => {
        const price = parseInt(workItem.price.replace(/\,/g, '')) || 0;
        const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0;
        const total =(price - discount)
        const percent=workItem.paymentItemList.value/100
        if(workItem.paymentItemList.value!==0){
        workItem.paymentItemList.paid=(String((total*percent).toFixed(0)))
        workItem.paymentItemList.paid=formatWithCommas(workItem.paymentItemList.paid)
        }
       else workItem.paymentItemList.paid=0
      }
      const calculateKnobPercentage=(workItem)=>{
        if(workItem.paymentItemList.value>0)
        return workItem.paymentItemList.value.toFixed(0)
      else return workItem.paymentItemList.value=0

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
         console.log(Patient.value)
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

 /*
 Get Modal Date
 */
   if (!storeInvoices.editInvoice) {
       invoiceDateUnix.value = Date.now()
       invoiceDate.value = new Date().toLocaleDateString("en-us", dateOptions)
     }
/*
   Claculate DueDate
*/
    const calculateDueDate =  (item) => {
      if (item.paymentTerms!=='Immediate Payment'){
      const futureDate = new Date()
      item.paymentDueDateUnix = futureDate.setDate(futureDate.getDate() + parseInt(item.paymentTerms))
      item.paymentDueDate = new Date(item.paymentDueDateUnix).toLocaleDateString("en-us", dateOptions)
         }
         else{
              item.paymentDueDateUnix=invoiceDateUnix.value
              item.paymentDueDate=invoiceDate.value
         }
    }

 /*
 Edit Modal Data
 */
   if (storeInvoices.editInvoice) {
     console.log(storeInvoices.currentInvoiceArray[0],'currentinvoicearray00')
       const currentInvoice = storeInvoices.currentInvoiceArray[0]
       docId.value = currentInvoice.docId
       work.value.type = currentInvoice.type;
       billerCity.value = currentInvoice.billerCity;
       billerZipCode.value = currentInvoice.billerZipCode;
       billerCountry.value = currentInvoice.billerCountry;
       patient.value = storePatients.patients.filter(v => v.patientId==(currentInvoice.patientId) )[0]
       patientEmail.value = currentInvoice.patientEmail;
       workDescription.value = currentInvoice.workDescription;
       patientCity.value = currentInvoice.patientCity;
       doctorTreated.value = currentInvoice.doctorTreated;
       patientCountry.value = currentInvoice.patientCountry;
       invoiceDateUnix.value = currentInvoice.invoiceDateUnix;
       invoiceDate.value = currentInvoice.invoiceDate;
       paymentTerms.value = currentInvoice.paymentTerms;
       paymentDueDateUnix.value = currentInvoice.paymentDueDateUnix;
       paymentDueDate.value = currentInvoice.paymentDueDate;
       invoicePending.value = currentInvoice.invoicePending;
       invoiceDraft.value = currentInvoice.invoiceDraft;
       paymentItemList.value = currentInvoice.paymentItemList;
       paymentTotal.value = currentInvoice.paymentTotal;
     }

 /*
  invoice functions
 */
     function closeInvoice() {
       storeInvoices.TOGGLE_INVOICE()
       if (storeInvoices.editInvoice) {
         storeInvoices.TOGGLE_EDIT_INVOICE();
       }
     }
     function addNewPaidItem(index) {
       storeInvoices.workItemList[index].paymentItemList={
         paymentId: uid(6),
         itemName: null,
         qty: "",
         paid: 0,
         value:0,
       }
     }
     function addNewWorkItem(opt) {
       storeInvoices.workItemList.push({
         workId: opt.workId,
         label: opt.label,
         color: opt.color,
         price: opt.price,
         discount:opt.discount,
         currency:opt.currency,
         description:opt.description,
         paymentDueDate:invoiceDate.value,
         paymentDueDateUnix:invoiceDateUnix.value,
         paymentTerms:'Immediate Payment',
         doctor: storeAuth.doctors[0],
         paymentItemList:null,
         invoiceId:invoiceId.value,
         teeth:[],
       })
       console.log(storeInvoices.workItemList)
     }


     function deletePaymentItem(index) {
       storeInvoices.workItemList[index].paymentItemList = null
     }
     function deleteWorkItem(workId) {
       storeInvoices.workItemList = storeInvoices.workItemList.filter((item) => item.workId !== workId)
     }
     function calPaymentTotal() {
       paymentTotal.value = 0
       paymentItemList.value.forEach((item) => {
         paymentTotal.value += item.total
       })
     }
     function publishInvoice() {
       invoicePending.value = true
     }
     function saveDraft() {
       invoiceDraft.value = true
     }
 /*
  Submission
 */
    function submitForm() {
       if (storeInvoices.editInvoice) {
         updateInvoice()
         return
       }
       uploadInvoice()
     }
    function uploadInvoice() {
         const data=({
           appointmentDate:appointmentDate.value,
           patientDetails:patient.value,
           invoiceDateUnix:invoiceDateUnix.value,
           invoiceDate:invoiceDate.value,
           invoicePending:invoicePending.value,
           invoiceDraft:invoiceDraft.value,
           invoiceId:invoiceId.value,
         })
       storeInvoices.addInvoice(data)
       storeInvoices.workItemList.forEach(work=>{
        console.log(work,'workkk')
        work.patientDetails=patient.value
        storeWorks.addWork(work)
        if(work.paymentItemList){
          if(work.paymentItemList.paid!==0)
          storePayments.addPayment(work)
        }
      })
     }
     function updateInvoice() {
        calPaymentTotal()
         const data=({
         docId:docId.value,
         work:work.value,
         billerCity:billerCity.value,
         billerZipCode:billerZipCode.value,
         billerCountry:billerCountry.value,
         patientDetails:patient.value,
         patientEmail:patientEmail.value,
         workDescription:workDescription.value,
         patientCity:patientCity.value,
         doctorTreated:doctorTreated.value,
         patientCountry:patientCountry.value,
         invoiceDateUnix:invoiceDateUnix.value,
         invoiceDate:invoiceDate.value,
         paymentTerms:paymentTerms.value,
         paymentDueDateUnix:paymentDueDateUnix.value,
         paymentDueDate:paymentDueDate.value,
         invoicePending:invoicePending.value,
         invoiceDraft:invoiceDraft.value,
         paymentTotal:paymentTotal.value,
         invoiceWrap:invoiceWrap.value,
         })
       storeInvoices.updateInvoice(data)
     }

   /*
    Styling
   */
       function  workCardClass  (work) {
         if (work.color)
         return {[ `bg-${ work.color }-1` ]: true }
       else return
       }
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

 .invoice-wrap {
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
   }

   .invoice-content {
     position: relative;
     padding: 56px;
     height:initial;
     max-width: 700px;
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
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 2rem;
    letter-spacing: normal;
     }
     h6 {
       font-size: 14px;
     }


     // Bill To / Bill From
     .bill-to,
     .type-work {
       margin-bottom: 30px;
       min-width: 588px;

       .patient-details {
         gap: 16px;
         div {
           flex: 1;
         }
       }
     }

     // Invoice Work & Payment

     .invoice-payment {

       .payment {
         gap: 24px;
         div {
           flex: 1;
         }
       }

       .work-items {
         .v-input{
           background-color: #fff !important;
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
       .payment-items {
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
           color: #000000 !important;
           background-color: #e2e4f0;
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
       margin-top: 60px;

       div {
         flex: 1;
       }

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
     font-weight:bold
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
         .v-input{
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

</style>
