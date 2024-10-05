<template>

      <q-toolbar v-if="!mobile" class="bg-primary text-white" style="min-width: 340px;background-color:red;">
            <q-toolbar-title >
              Add New Appointment
            </q-toolbar-title>
            <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
          </q-toolbar>
       <q-card-section >
           <div >
    <form ref="formRef" @submit.prevent.stop="onSubmit" @reset.prevent.stop="onReset" class="q-gutter-md">
        <q-card-section class="q-pt-none">
      <q-select
        filled
        v-model="appointment.title"
        behavior="menu"
        use-chips
        stack-label
        use-input
        input-debounce="0"
        :options="options"
        :loading="storePatients.loading"
        :disable="storePatients.loading"
        transition-show="jump-up"
        transition-hide="jump-up"
        @filter="filterFn"
        label="Patient's Name"
        color="primary"
        options-selected-class="text-primary "
        popup-content-style= "width:10px "
        option-label="namef"
        option-value="namef,id"
        emit-value
        map-options
        autofocus
        @new-value="createValue"
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

     <q-input v-model="appointment.startTime" type="time" filled  label="Enter date & time" ></q-input>
     <q-input v-model="appointment.endTime" type="time" filled  label="Enter date & time" ></q-input>
       <q-input v-model="appointment.startDate" type="date" filled  label="Date" ></q-input>
         <q-input v-model="appointment.duration" filled  label="Duration" ></q-input>
         <q-input v-model="appointment.bgcolor" filled  label="color" ></q-input>
           <q-input v-model="appointment.details" filled  label="Details" ></q-input>

   <q-tabs
          v-model="appointment.doctor"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab v-for="doctor in storeAuth.doctors" :name= doctor><div>Dr.{{ doctor.name }}</div></q-tab>
        </q-tabs>
        </q-card-section>
        <div class="column">
          <q-toggle class="col" v-model="appointment.sendWhatsAppMessage"   label="Send WhatsApp Message"></q-toggle>
          <q-toggle class="col" v-model="appointment.sendWhatsAppReminder"   label="Send Sameday Reminder(At 12:00 PM)"></q-toggle>
        </div>


        <q-card-actions v-if="!mobile" align="left" class="text-primary">
          <q-btn  label="Add Appointment" color="primary" type="submit" />
          <q-btn label="Reset"  type="reset" color="primary" flat class="q-ml-sm" />
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>
       </form>
      </div>
      </q-card-section>



</template>
<script setup>
import { computed, ref } from 'vue'
import {useStoreAppointments} from 'stores/storeAppointments'
import { useStorePatients } from 'src/stores/storePatients'
import { useStoreAuth } from 'src/stores/storeAuth'
import { uid, useQuasar } from 'quasar'
import { Platform } from 'quasar'

/*
 Quasar Lib
*/

const $q =useQuasar()

/*
   props
*/
const props = defineProps({

modelValue:{
  type:Boolean,
  default:false
},
patientId:{
  type: String,
},
appointment:{
  type:Object,
  default:''
},
startTime:{
  type: String,
  default:''
},
endTime:{
  type: String,
  default:''
},
startDate:{
  type: String,
  default:''
},
endDate:{
  type: String,
  default:''
},
doctorId:{
  type: String,
  default:''
}
})

/*
  store
*/
   const storeAppointments=useStoreAppointments()
   const storePatients=useStorePatients()
   const storeAuth=useStoreAuth()

/*
  Patients Ref
*/
  const patients=ref('')
  const options = ref(patients)
  patients.value=storePatients.patients
/*
  Patients
*/
  const createValue= (val, done)=> {

          if (val.length > 0) {
            const duplicate = patients.value.some(patient => patient.namef === val)
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
            done(Patient, 'toggle')
            }
          }
   }
   const  filterFn = (val, update) => {
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


/*
  Appointment Ref
*/
  const moneyhavetopayRef=ref()
  const moneypaidRef=ref()
  const detailsRef=ref()
  const status = ref('booked')

/*
 addAppointment
*/
  const appointment = ref({
    startTime:props.startTime,
    endTime:props.endTime,
    startDate:props.startDate,
    endDate:props.endDate,
    title:null,
    content: 'Endo.',
    doctor:storeAuth.doctors.find(doc => doc.doctorId === props.doctorId),
    status:status.value,
    sendWhatsAppMessage:false,
    sendWhatsAppReminder:false,
  })

 /*
  Submission
 */

  defineExpose({
      submitAppointmentFormMobile
    })
    const formRef = ref(null)
    function submitAppointmentFormMobile (){
      const form = formRef.value;
  if (form.checkValidity()) {
    if (appointment.title === null) {
  $q.notify({
    message: 'Choose a Patient please.',
    color: 'negative',
    icon: 'report_problem',
    actions: [
      { label: 'Dismiss', color: 'white', handler: () => { /* console.log('wooow') */ } }
    ]
  });
// } else if (!storeInvoices.workItemList|| storeInvoices.workItemList.length === 0) {
//   $q.notify({
//     message: 'Choose a Work please.',
//     color: 'orange',
//     icon: 'report_problem',
//     actions: [
//       { label: 'Dismiss', color: 'white', handler: () => { /* console.log('wooow') */ } }
//     ]
//   });
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
      // console.log('submitting')
      //  if (storeInvoices.editInvoice) {
      //    updateInvoice()
      //    return
      //  }
      onSubmit()
     }
  const onSubmit= ()=> {
    if (!appointment.value.title) {
    $q.notify({
      color: 'negative',
      message: 'Please select a patient.',
    })
    return
  }


  console.log(appointment.value)
  if (appointment.value.sendWhatsAppReminder==true&&!appointment.value.title.phone||appointment.value.sendWhatsAppMessage==true&&!appointment.value.title.phone
  ) {
    $q.notify({
      color: 'negative',
      message: 'Patient Has No Phone Number assigned.',
    })
    appointment.value.sendWhatsAppReminder==false

  }
  storeAppointments.addAppointment(appointment.value)
  closeModal()

          }

       const onReset= ()=> {
        appointment.value.duration = ''
        appointment.value.title = null
        appointment.value.startTime = props.startTime
        appointment.value.endTime = props.endTime
        appointment.value.startDate = props.startDate
        appointment.value.details = 'Check up'
        appointment.value.doctor = ''
        appointment.value.bgcolor = 'orange'
        appointment.value.sendWhatsAppMessage=false
        appointment.value.sendWhatsAppReminder=false
        // moneyhavetopayRef.value.resetValidation()
        // moneypaidRef.value.resetValidation()
        // detailsRef.value.resetValidation()
      }



/*
   emits
*/

   const emit = defineEmits(['update:modelValue'])

/*
   close modal
*/
     const closeModal = () => {
      emit('update:modelValue',false)
     }


/*
 Icons
*/


const myIcons = {
  'IQD': 'img:/currency/IQD.svg',
  '$': 'attach_money',
  'IQD_choose': 'img:/currency/IQD_choose.svg',
  'price_change_green': 'img:/currency/price_change_green.svg',
  'price_change_red': 'img:/currency/price_change_red.svg'
  }

     $q.iconMapFn = (iconName) => {
    const icon = myIcons[iconName]
    if (icon !== void 0) {
      return { icon: icon }
     }
     }


// Mobile detection
const mobile = computed(() => {
  return Platform.is.mobile && !Platform.is.desktop;
})

</script>

<style lang="scss">
.q-list--dense > .q-item, .q-item--dense {
    padding: 0px 0px;
}
</style>
