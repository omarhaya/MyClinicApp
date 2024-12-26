<template>
    <q-dialog v-model="deleteAll.itemsToDelete" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="red" text-color="white" />
          <span class="q-ml-sm">You are currently about to delete some works.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn :loading="storeWorks.loading" @click="handleDeleteItems(dataToDelete,deleteAll)" flat label="Proceed" color="red"  />
        </q-card-actions>
      </q-card>
    </q-dialog>
  <div ref="modalRef" class="invoice-wrap flex flex-column">
     <Loading v-if="!mobile" v-show="loadingModal" />
     <form ref="formRef" id="form" name="name" @submit.prevent="submitForm" >
      <!-- <v-banner
      v-if="mobile"
      :sticky="true"
      lines="one"
    >
    <div class="row justify-between">
     <div >
     <q-btn flat @click="closeInvoice">Cancel</q-btn>
       </div>
       <div >
        <h5 v-if="!storeInvoices.editInvoice">New Invoice</h5>
       <span v-else>Edit Invoice</span>
      </div>
      <div class="justify-end">
   <q-btn flat v-if="!storeInvoices.editInvoice" type="submit">Create</q-btn>
   <q-btn flat v-if="storeInvoices.editInvoice" type="sumbit">Update</q-btn>
  </div>
    </div>
    </v-banner> -->
    <div class="invoice-content" :style="{ width: mobile ? '' : '700px' }">
       <div class="m1" v-if="!storeInvoices.editInvoice&&!mobile">New Invoice</div>
       <div class="m1" v-if="storeInvoices.editInvoice&&!mobile">Edit Invoice</div>

       <!-- Patient Details -->
       <div class="type-work ">
         <h4>Patient Details</h4>
         <div class="patient-details row">
           <div class="input col-12 col-md">
             <label for="patient">Patient's Name</label>
             <!-- <q-btn @click="console1">hi</q-btn> -->
             <v-autocomplete
              type="object"
              v-model="patient"
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

           <div class="input col-12 col-md">
             <label for="appointmentDate">Appointment's Date</label>
             <q-input id="appointmentDate" v-model="appointmentDate" dense type="date" ></q-input>
           </div>
         </div>
        </div>
            <!-- Invoice Work Details -->
            <div class="column">
         <h4>Work Details</h4>
         <div class="patient-details col">
           <div class="input ">
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
                  @remove="deleteWorkItem(item.raw.workId,item.raw.docId)"
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
       </div>
       </div>

         <q-card v-for="(workItem,index) in storeInvoices.workItemList" :key="index" :class="workCardClass(workItem)" class="work-card no-warp">

          <div class="work-item" >
            <div class="row"> <h3 class="col"   :class="`text-${workItem.color}-${isDarkMode ? 2 : 10}`">{{ workItem.label }}</h3><q-btn flat round :color="workItem.color" icon="close"  class="justify-end close-button" @click="deleteWorkItem(workItem.workId,workItem.docId)"/></div>
            <q-chip  clickable @click="storeInvoices.TOGGLE_TEETHSELECTION(index)">Add Teeth +
              <v-overlay
              :key="'dialog_' + index"
              v-model="storeInvoices.teethModals[index]"
          contained
          activator="parent"
        location-strategy="connected"
        scroll-strategy="reposition"
          class="align-center justify-center"
        >
        <TeethSelectionModal :workItem="workItem" @toothSelected="handleToothSelected(workItem, $event)" />
        </v-overlay>
              <!-- <q-dialog
                      :key="'dialog_' + index"
                      full-width
                      full-height
                      allow-focus-outside
                      v-model="storeInvoices.teethModals[index]"
                      >
                        <TeethSelectionModal :workItem="workItem" @toothSelected="handleToothSelected(workItem, $event)" />
                      </q-dialog> -->
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
                   <div class="col-12 col-md " :class="{ 'q-pr-lg': $q.screen.gt.xs }">
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
                 <div class="col-12 col-md">
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
                  <div>previously Paid</div>
                  <table class="item-list" v-if="workItem.paymentItemList">
                    <tr class="table-heading flex">
              <th class="paid-item">Paid Amount</th>
              <th class="remaining flex">Remaining</th>
                    </tr>
                    <tr class="table-items flex" >
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
            <v-select
              required
              v-if="!workItem.doctor"
              v-model="workItem.doctor"
              :items="storeAuth.doctors"
              item-title="name"
              item-value="doctorId"
              clearable
              return-object
              density="compact"
              prefix="Dr."
              popup-content-class="menu-style"
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
      <div class="footer">
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
           <button v-if="!mobile" type="button" @click="closeInvoice" class="red">Cancel</button>
         </div>
         <div class="right flex">
           <button v-if="!storeInvoices.editInvoice&&!mobile" type="submit" @click="saveDraft" class="grey">Save Draft</button>
           <button v-if="!storeInvoices.editInvoice&&!mobile" type="submit" class="green">Create Invoice</button>
           <button v-if="storeInvoices.editInvoice&&!mobile" type="sumbit" class="green">Update Invoice</button>
         </div>
       </div>
      </div>
     </form>
   </div>

 </template>

 <script setup>
 import { useQuasar } from 'quasar';
 import { uid } from 'uid'
 import Loading from './Loading.vue'
 import { ref,computed,reactive,onMounted,onUnmounted } from 'vue'
 import { storeToRefs } from 'pinia'
 import { useStoreInvoices } from 'src/stores/storeInvoices'
 import { useStorePatients } from 'src/stores/storePatients'
 import { useStoreAuth } from 'src/stores/storeAuth'
 import { useStorePayments } from 'src/stores/storePayments'
 import { useStoreWorks } from 'src/stores/storeWorks'
 import TeethSelectionModal from 'src/components/TeethSelectionModal.vue'
 import { actionSheetController } from '@ionic/vue';
 import { Platform } from 'quasar'
 import { Haptics, ImpactStyle } from '@capacitor/haptics';
 const $q=useQuasar()

// Check if dark mode is enabled
 const isDarkMode = computed(() => $q.dark.isActive)

 const storeInvoices=useStoreInvoices()
 const storePatients=useStorePatients()
 const storeAuth=useStoreAuth()
 const storePayments=useStorePayments()
 const storeWorks=useStoreWorks()
 const { paymentItemList,loadingModal,currencies,currentInvoiceArray} = storeToRefs(storeInvoices)

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
  const     modalRef = ref()
  const     deleteAll=ref([])
  const     dataToDelete=ref()
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
  async function hepticFeedback () {
     console.log('hepticfeedback')
    await Haptics.impact({ style: ImpactStyle.Light })
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

  const calculateRemaining=(workItem) => {
    const payments = storePayments.invoicePayments[workItem.invoiceId] || [];
    const allPaid = payments.length > 0
      ? payments.reduce((accumulator, item) => {
          if (item.workId === workItem.workId && item.category !== 'Discount') {
            return accumulator + Number(item.paid || 0);
          }
          return accumulator;
        }, 0)
      : 0;
    if(workItem.paymentItemList.paid){
      const price = parseInt(workItem.price.replace(/\,/g, '')) || 0;
      const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0;
      const paid =  parseInt(workItem.paymentItemList.paid.replace(/\,/g, '')) || 0;
      const total =(price - discount)
      if(paid&&paid<=total)
      return total-paid-allPaid
          else return 0
        }
      else {
        return parseInt(workItem.price.replace(/\,/g, '')-workItem.discount.replace(/\,/g, ''))-allPaid
      }
    }

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
   label:'Filling ',
   color:'indigo',
   price: '70,000',
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
   label:'Endodontic treatment',
   color:'blue',
   price: '150,000',
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
   },

  ])

  const workOptions=ref(workOptions1)
  const workOptions2 = reactive([ { work: 'Implant', data: ['ClassI44','classII','Class V','Composite','A2','A1']},{ work: 'Endodontic treatment', data: ['ClassI44','classII','Class V','Composite','A2','A1']},
  { work: 'Removable Orthodontic Appliance', data: ['ClassI','classII2']},
  { work: 'Filling', data: ['ClassI','ClassII','ClassIII','ClassIV','ClassV','Composite','Amalgam']},
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
       const calculateValue2 = async (workItem) => {
        const price = parseInt(workItem.price.replace(/\,/g, '')) || 0;
        const discount = parseInt(workItem.discount.replace(/\,/g, '')) || 0;
        const payments = storePayments.invoicePayments[workItem.invoiceId] || [];
        const allPaid = payments.length > 0
          ? payments.reduce((accumulator, item) => {
              if (item.workId === workItem.workId && item.category !== 'Discount') {
                return accumulator + Number(item.paid || 0);
              }
              return accumulator;
            }, 0)
          : 0;
        const total =(price - discount-allPaid)
        const percent=workItem.paymentItemList.value/100
        if(workItem.paymentItemList.value!==0){
        workItem.paymentItemList.paid=(String((total*percent).toFixed(0)))
        workItem.paymentItemList.paid=formatWithCommas(workItem.paymentItemList.paid)
        }
       else workItem.paymentItemList.paid=0
       if (mobile.value) await hepticFeedback()
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
      console.log(item)
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
    console.log(storeInvoices.currentInvoiceArray,'storeInvoices.currentInvoiceArray')
    //  console.log(storeInvoices.currentInvoiceArray[0],'currentinvoicearray00')
       const currentInvoice = storeInvoices.currentInvoiceArray
       docId.value = currentInvoice.docId
       patient.value=storePatients.patients.find(doc => doc.patientId === currentInvoice.patientId)
       invoiceDate.value=currentInvoice.invoiceDate
       invoiceDateUnix.value =currentInvoice.invoiceDateUnix
       let workItemList = []
       console.log()
       currentInvoice.workItemList.forEach(work =>{
      let  workItem={}
        workItem.label=work.label
        workItem.color=work.color
        workItem.price=work.price.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        workItem.discount=work.discount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')||'0'
        workItem.currency=work.currency
        workItem.percent=((work.discount)/parseInt(work.price.replace(/\,/g, ''))*100).toFixed(2)
        workItem.description=work.description
        workItem.doctor=work.doctor
        workItem.teeth=work.teeth
        workItem.paymentTerms=work.paymentTerms
        workItem.workId=work.workId
        workItem.invoiceId=work.invoiceId
        workItem.paymentDueDate=new Date(work.paymentDueDateUnix).toLocaleDateString("en-us", dateOptions)
        workItem.paymentDueDateUnix=work.paymentDueDateUnix
        workItem.docId=work.docId
        // workItem.patientDetails=patient.value

        workItemList.push(workItem)
      })
      console.log(workItemList,'workke')
      storeInvoices.workItemList=workItemList
      // storeInvoices.workItemList=workItemList
//       storeInvoices.workItemList= [{   label:'Fixed Applaince',
//    color:'green',
//    price:"1000000",
//    discount:'0',
//    currency:'IQD',
//    description:[],
//    doctor: '',
//    teeth:[],
//    workId:uid(),
//    paymentTerms:"Immediate Payment",
//    invoiceId:"fae171",
// doctor:{class:"split1",
// color:"#5a4d4dd4",
// doctorId:"e1Q5Eg5McWZjGjmuZpDeJCC3bkB3",
// name:"Omar Jasim"}
//    }]
      //  billerCity.value = currentInvoice.billerCity;
      //  billerZipCode.value = currentInvoice.billerZipCode;
      //  billerCountry.value = currentInvoice.billerCountry;
      //  patient.value = storePatients.patients.filter(v => v.patientId==(currentInvoice.patientId) )[0]
      //  patientEmail.value = currentInvoice.patientEmail;
      //  workDescription.value = currentInvoice.workDescription;
      //  patientCity.value = currentInvoice.patientCity;
      //  doctorTreated.value = currentInvoice.doctorTreated;
      //  patientCountry.value = currentInvoice.patientCountry;
      //  invoiceDateUnix.value = currentInvoice.invoiceDateUnix;
      //  invoiceDate.value = currentInvoice.invoiceDate;
      //  paymentTerms.value = currentInvoice.paymentTerms;
      //  paymentDueDateUnix.value = currentInvoice.paymentDueDateUnix;
      //  paymentDueDate.value = currentInvoice.paymentDueDate;
      //  invoicePending.value = currentInvoice.invoicePending;
      //  invoiceDraft.value = currentInvoice.invoiceDraft;
      //  paymentItemList.value = currentInvoice.paymentItemList;
      //  paymentTotal.value = currentInvoice.paymentTotal;
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
     async function deleteWorkItem(workId,docId) {


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
    defineExpose({
      submitFormMobile
    })
    const formRef = ref(null)
    function submitFormMobile (){
      const form = formRef.value;
  if (form.checkValidity()) {
    if (patient.value === null) {
  $q.notify({
    message: 'Choose a Patient please.',
    color: 'negative',
    icon: 'report_problem',
    actions: [
      { label: 'Dismiss', color: 'white', handler: () => { /* console.log('wooow') */ } }
    ]
  });
} else if (!storeInvoices.workItemList|| storeInvoices.workItemList.length === 0) {
  $q.notify({
    message: 'Choose a Work please.',
    color: 'orange',
    icon: 'report_problem',
    actions: [
      { label: 'Dismiss', color: 'white', handler: () => { /* console.log('wooow') */ } }
    ]
  });
} else {
  submitForm();
}
  } else {

    form.reportValidity()
    // Handle form validation errors
    // Example: Display error messages
  }
    }
    function submitForm() {
      console.log('submitting')
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
        work.patientDetails=patient.value
        work.dateUnix=invoiceDateUnix.value
        storeWorks.addWork(work)
        if (parseInt(work.discount)>0) {
          storePayments.addDiscount(work)
        }
        if(work.paymentItemList){
          if(work.paymentItemList.paid!==0)
          storePayments.addPayment(work)
        }
      })

     }
  async function updateInvoice() {
  const data = {
    appointmentDate: appointmentDate.value,
    patientDetails: patient.value,
    invoiceDateUnix: invoiceDateUnix.value,
    invoiceDate: invoiceDate.value,
    invoicePending: invoicePending.value,
    invoiceDraft: invoiceDraft.value,
    invoiceId: storeInvoices.currentInvoiceArray.invoiceId,
    docId: docId.value,
    workItemList: storeInvoices.workItemList,
  };

  data.workItemList.forEach(item => {
    item.invoiceId = storeInvoices.currentInvoiceArray.invoiceId;
  });

  const workIdsInWorkItemList = new Set(storeInvoices.workItemList.map(item => item.workId));
  const currentWorkItems = storeInvoices.currentInvoiceArray.workItemList;

  const itemsToDelete = currentWorkItems.filter(item => !workIdsInWorkItemList.has(item.workId));
  itemsToDelete.forEach(item => {
    item.paymentsToDelete = storePayments.invoicePayments[item.invoiceId] || [];
  });

  const hasPaymentsToDelete = itemsToDelete.some(item => item.paymentsToDelete.length > 0);

  if (itemsToDelete.length > 0) {
    if (!mobile.value) {
      // Use q-dialog for desktop
      await handleDesktopDialog(itemsToDelete, hasPaymentsToDelete, data);
    } else {
      // Use actionSheet for mobile
      await handleMobileActionSheet(itemsToDelete, hasPaymentsToDelete, data);
    }
  } else {
    // No items to delete, proceed with updating the invoice
    await storeInvoices.updateInvoice(data);
    console.log(data,'wreee1')
    await data.workItemList.forEach(work=>{
      work.patientDetails=patient.value
      console.log(work,'wreee2')
      if(work.paymentItemList){
          if(work.paymentItemList.paid!==0)
          storePayments.addPayment(work)
        }
    })
    await consolidateDiscountPayments(data.workItemList);
    console.log(data, 'Updated invoice data');
  }
}
async function handleDesktopDialog(itemsToDelete, hasPaymentsToDelete, data) {
  return new Promise((resolve) => {
    $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to delete these work items?',
        ok: {
           label: 'Delete All',
           color:'red',
          push: true
        },
        cancel: {
          push: true,
          color: 'primary'
        },
        persistent: true
      }).onOk(async () => {

          if (hasPaymentsToDelete) {
            $q.dialog({
        title: 'Confirm',
        message: 'Would you like to turn on the wifi?',
        ok: {
           label: 'Delete Payments',
           color:'red',
          push: true
        },

        cancel: {
          push: true,
          label:'Distribute Payments',
          color: 'primary'
        },

        persistent: true
      }).onOk(async () => {
        await handleDeleteItemsAndPayments(data, itemsToDelete);
        resolve(); // Resolve the promise after handling
      }).onCancel(async () => {
        await handleDeleteItemsAndDistributePayments(data, itemsToDelete);
      }).onDismiss(async () => {
        // console.log('I am triggered on both OK and Cancel')
      })} else {
            await handleDeleteItems(data, itemsToDelete);
          }
      }).onCancel(async () => {

      }).onDismiss(async () => {
        // console.log('I am triggered on both OK and Cancel')
      })
  });
}
async function handleMobileActionSheet(itemsToDelete, hasPaymentsToDelete, data) {
  const actionSheet = await actionSheetController.create({
    header: 'Are you sure you want to delete these work items?',
    buttons: [
      {
        text: 'Delete All',
        role: 'destructive',
        handler: async () => {
          if (hasPaymentsToDelete) {
            const paymentsActionSheet = await actionSheetController.create({
              header: 'Delete associated payments as well?',
              buttons: [
                {
                  text: 'Delete Payments Too',
                  role: 'destructive',
                  handler: async () => {
                    await handleDeleteItemsAndPayments(data, itemsToDelete);
                  },
                },
                {
                  text: 'Distribute Payments to Other Works',
                  role: 'destructive',
                  handler: async () => {
                    await handleDeleteItemsAndDistributePayments(data, itemsToDelete);
                  },
                },
                {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: () => {
                    console.log('Deletion canceled');
                  },
                },
              ],
              presentingElement: modalRef.value.$el,
            });
            await paymentsActionSheet.present();
          } else {
            await handleDeleteItems(data, itemsToDelete);
          }
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Deletion canceled');
        },
      },
    ],
    presentingElement: modalRef.value.$el,
  });

  await actionSheet.present();
}
async function consolidateDiscountPayments(workItemList) {

  for (const work of workItemList) {
    work.patientDetails = patient.value;
    if (parseInt(work.discount.replace(/\,/g, '')) > 0) {

      const existingDiscountPayments = storePayments.invoicePayments[work.invoiceId]?.filter(
        (payment) => payment.workId === work.workId && payment.category === 'Discount'
      );
      console.log((work.discount.replace(/\,/g, '')) ,'workItemListworkItemList')
      if (existingDiscountPayments?.length > 0) {
        // Keep the first discount payment, update its value
        const primaryPayment = existingDiscountPayments[0];
        primaryPayment.paid = parseInt(work.discount.replace(/\,/g, ''));
        primaryPayment.invoiceId=work.invoiceId
        await storePayments.updatePaymentDiscount(primaryPayment);
        existingDiscountPayments.forEach(payment=>payment.invoiceId=work.invoiceId)
        console.log(existingDiscountPayments,'existingDiscountPayments')
        // Remove all other discount payments
        for (let i = 1; i < existingDiscountPayments.length; i++) {
          await storePayments.deletePayment(existingDiscountPayments[i]);
        }
      } else {
        // No existing discount payment, add a new one
        await storePayments.addDiscount(work);
      }
    }
  }
}

async function handleDeleteItems (data,itemsToDelete) {
  storeInvoices.loading=true
  console.log(itemsToDelete)
  for (const item of itemsToDelete) {
              await storeWorks.deleteWork(item.docId)
              console.log(`Deleted work item with docId: ${item.docId}`)
            }
            // Update the invoice in storeInvoices after deletion
            storeInvoices.updateInvoice(data);

            // Proceed with updating/adding works and payments
            // await handleWorkUpdates(data);
}

async function handleDeleteItemsAndPayments (data,itemsToDelete) {
  console.log('deletePaymentsand invoices')
  storeInvoices.loading=true
  console.log(itemsToDelete)
  for (const item of itemsToDelete) {
    const payments = (storePayments.invoicePayments[item.invoiceId] || []).filter(
      (payment) => payment.workId === item.workId);

              payments.forEach(async payment=>{
                payment.invoiceId=item.invoiceId
                await storePayments.deletePayment(payment)
              })

              console.log(item,payments,'paymenttttt')
              await storeWorks.deleteWork(item.docId)
              console.log(`Deleted work item with docId: ${item.docId}`)
            }
            // Update the invoice in storeInvoices after deletion
          await  storeInvoices.updateInvoice(data);
          await data.workItemList.forEach(work=>{
              work.patientDetails=patient.value
              console.log(work,'wreee2')
              if(work.paymentItemList){
                  if(work.paymentItemList.paid!==0)
                  storePayments.addPayment(work)
                }
           })
          await consolidateDiscountPayments(data.workItemList);

            // Proceed with updating/adding works and payments
            // await handleWorkUpdates(data);
}
async function handleDeleteItemsAndDistributePayments(data, itemsToDelete) {
  storeInvoices.loading = true;

  // Get remaining works in the workItemList after deletion
  const remainingWorks = data.workItemList.filter(
    (work) => !itemsToDelete.some((item) => item.workId === work.workId)
  );
    console.log(remainingWorks,'data.workItemList')
  for (const item of itemsToDelete) {
    const paymentsToDistribute = (storePayments.invoicePayments[item.invoiceId] || []).filter(
      (payment) => (payment.workId === item.workId)&&payment.type==="payment"
    );
     console.log(paymentsToDistribute,'paymentsToDistribute')
    console.log(`Payments to redistribute for workId ${item.workId}:`, paymentsToDistribute);

    if (remainingWorks.length > 0) {
      // Distribute payments among remaining works
      let remainingAmount = (paymentsToDistribute.reduce((sum, payment) => sum + payment.paid, 0));
      for (const work of remainingWorks) {
        if (parseInt(remainingAmount) <= 0) break;
        const payments=(storePayments.invoicePayments[work.invoiceId] || []).filter(
      (payment) => payment.workId === work.workId
    );

        const allPaid = payments.reduce((accumulator, item) => {
            if (item.workId === work.workId && (item.type === 'payment' || item.type === 'expense')) {
              return accumulator + Number(item.paid || 0);
            }
            return accumulator;
          }, 0);

          let price = 0;
          if (typeof work.price === 'string') {
            price = Number(work.price.replace(/,/g, '') || 0);
          } else if (typeof work.price === 'number') {
            price = work.price;
          } else {
            console.warn(`Unexpected price type for work:`, work);
          }

          // Calculate total discount from payments
          const discount = payments.reduce((accumulator, item) => {
            if (item.workId === work.workId && item.category === 'Discount') {
              return accumulator + Number(item.paid || 0);
            }
            return accumulator;
          }, 0);



        const workCapacity = Math.max(0, price- allPaid-discount); // Remaining unpaid capacity for the work
        const amountToAssign = Math.min(parseInt(remainingAmount), workCapacity);
        console.log(workCapacity,amountToAssign,price,discount,allPaid,paymentsToDistribute,remainingAmount,'amountToAssign')
        if (amountToAssign > 0) {
        // Add payment to work's paymentItemList

          // work.paymentItemList.paid=amountToAssign

          await storePayments.addPayment({
            ...work,
            patientDetails:patient.value,
            paymentItemList:{paid:amountToAssign}
          });


          console.log(`Distributed ${amountToAssign} to workId ${work.workId}`);
          remainingAmount -= amountToAssign;
        }
      }

      if (remainingAmount > 0) {
        console.warn(`Some payments could not be redistributed: ${remainingAmount}`);
      }
    }

    // Delete the work item and its associated payments
    for (const payment of paymentsToDistribute) {
      payment.invoiceId=data.invoiceId
      await storePayments.deletePayment(payment);
      console.log(`Deleted payment with paymentId: ${payment.paymentId}`);
    }

    // await storeWorks.deleteWork(item.docId);
    console.log(`Deleted work item with docId: ${item.docId}`);
  }

  // Update the invoice in storeInvoices after deletion and redistribution
  await storeInvoices.updateInvoice(data);
  await data.workItemList.forEach(work=>{
      work.patientDetails=patient.value
      console.log(work,'wreee2')
      if(work.paymentItemList){
          if(work.paymentItemList.paid!==0)
          storePayments.addPayment(work)
        }
    })
  await consolidateDiscountPayments(data.workItemList);
  storeInvoices.loading = false;

  console.log('Deleted items and redistributed payments.');
}
// Function to handle work updates and additions
async function handleWorkUpdates(data) {
  // Iterate through each work in storeInvoices.workItemList
  for (const work of storeInvoices.workItemList) {
    console.log(storeInvoices.workItemList, 'workkk');
    work.patientDetails = patient.value; // Update patientDetails for each work

    // Check if work.workId exists in storeInvoices.currentInvoiceArray.workItemList
    const matchingWork = storeInvoices.currentInvoiceArray.workItemList.find(
      currentWork => currentWork.workId === work.workId
    )
    if (parseInt(work.discount)>0) {
      console.log('discount',work)
          // storePayments.addDiscount(work)
        }
    // If a matching workId is found, trigger storeWorks.updateWork()
    if (matchingWork) {
      // await storeWorks.updateWork(work);
      console.log(work, 'workMatch');
    } else {
      work.invoiceId = data.invoiceId;
      // await storeWorks.addWork(work);
      console.log(work, 'workExtra');
    }

    // If paymentItemList exists and is paid, trigger storePayments.addPayment()
    if (work.paymentItemList && work.paymentItemList.paid !== 0) {
      console.log(work,'paymentss')
      // await storePayments.addPayment(work);
    }
  }
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
   /*
    Styling
   */
        const workCardClass = computed(() => (work) => {
        if (work.color && !isDarkMode.value) {
          return { [`bg-${work.color}-1`]: true }
        } else if (work.color && isDarkMode.value) {
          return { [`bg-${work.color}-10`]: true }
        }
        return {}
      })
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

     function validateObject(value) {
      // Check if value is an object and not empty
      if (value && typeof value === 'object' && Object.keys(value).length > 0) {
        return true; // Validation passes
      }
      return true
      }

      const actionSheetButtonsWork =ref([
        {
          text: 'Delete',
          role: 'destructive',
          data: {
            action: 'delete',
          },
          handler: () => {
          // console.log(props.invoice.invoiceId,isOpen.value)
          // const index = storeInvoices.invoiceData.findIndex(item => item.invoiceId === props.invoice.invoiceId);

          // if (index !== -1) {
          //   // If the item is found, update the property
          //   storeInvoices.invoiceData[index].deleted = true;
          // }
          isDeleted.value = true
          setTimeout(() => {
            storeInvoices.DELETE_()
          }, 280)

          const slidingItem = document.querySelector('.invoice')
          slidingItem.closeOpened()
        }
        },
        {
          text: 'Archive',
          data: {
            action: 'archive',
          },
        },
        {
          text: 'Cancel',
          role:'cancel',
          data: {
            action: 'cancel',
          },
          handler: () => {
          const slidingItem = document.querySelector('.invoice')
          slidingItem.closeOpened()
        }
        },
      ])
 </script>

 <style lang="scss" scoped>
.dark .invoice-wrap{
  background-color: #142325;
  .invoice-content{
  background-color: #142325;
  color: #fff;
  }
}
 .invoice-wrap {
   position:static;
   top: 0;
   left: 0;
   width: 100%;
   height: 100vh;
   background-color:white;
   &::-webkit-scrollbar {
     display: none;
   }
   @media (min-width: 900px) {
     left:57px;
   }

   .invoice-content {
     position: relative;
     height:initial;
    //  max-width: 700px;
     width: 100%;
     background-color: #ffffff;
     color: #2f2e2e;
     @media (min-width: 900px) {
      // width: 700px;
      padding: 56px;
     }
     @media (max-width: 900px) {
      padding: 10px;
     }
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
       min-width: 100px;
       .patient-details {
         gap: 16px;
        //  div {
        //    flex: none;
        //  }
       }
     }

     // Invoice Work & Payment

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
//Dark Mode Input field Colors
.dark .v-input, .dark .q-field  {
        background-color: black !important;
        color: white;
       }
 .work-card {
     margin-bottom:-4px;
     @media (min-width: 900px) {
      // width: 700px;
      padding-right: 57px;
      padding-left: 57px;
     }
     @media (max-width: 900px) {
      padding-right: 10px;
      padding-left: 10px;
     }
     box-shadow: inset 0px 1px 6px -2px rgba(0, 0, 0, 0.2), 0 0px 0px rgba(0, 0, 0, 0.14), 0 0px 0px 0px rgba(0, 0, 0, 0.12) !important;
     border-radius: 0px !important;
     vertical-align: top;
     background: #fff;
     position: relative;

       .v-input{
                   background-color: #fff ;
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
               flex-basis: 50%;
             }

             .remaining {
               flex-basis: 50%;
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

       }
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
     .button {
           color: #000000 !important;
           background-color: #e2e4f0;
           align-items: center;
           justify-content: center;
           width: 100%;
           padding: 23px;
           border-radius: 50px;
           img {
             margin-right: 4px;
           }
         }
 }
 .close-button {
    margin: 11px 0 11px 0 !important;
    padding: 0px;
    border-radius: 100%;

         }

  .close-icon:hover {
    cursor: pointer;
}
.footer{
  @media (min-width: 900px) {
      padding-right: 57px;
      padding-left: 57px;
      padding-bottom:57px;
      .save {
       margin-top: 30px;
      }
     }
     @media (max-width: 900px) {
      padding-right: 10px;
      padding-left: 10px;
      padding-bottom:20px;
     }

  .save {
       div {
         flex: 1;
       }

       .right {
         justify-content: flex-end;
       }
     }
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
.dark .v-input input {
  background-color: black !important;
  color: white;
}
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
