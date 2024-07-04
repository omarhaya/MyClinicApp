<template>
   <q-card style="min-width: 350px">
      <q-toolbar class="bg-primary text-white" style="min-width: 340px;,background-color=red;">
            <q-toolbar-title >
              Add New Appointment
            </q-toolbar-title>
            <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
          </q-toolbar>
       <q-card-section >
           <div >
    <form @submit.prevent.stop="onSubmit" @reset.prevent.stop="onReset" class="q-gutter-md">


        <q-card-section class="q-pt-none">

     <!-- <q-badge color="secondary" multi-line>
        Model: "{{ appointmenttitle }}"
      </q-badge> -->

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

     <q-input v-model="appointment.time" type="time" filled  label="Enter date & time" ></q-input>
       <q-input v-model="appointment.date" type="date" filled  label="Date" ></q-input>
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
          <q-tab name="Aws" label="Dr.Aws" />
          <q-tab name="Omar" label="Dr.Omar" />
          <q-tab name="Duaa" label="Dr.Duaa" />
        </q-tabs>



        </q-card-section>

        <q-card-actions align="left" class="text-primary">
          <q-btn  label="Add Appointment" color="primary" type="submit" v-close-popup />
          <q-btn label="Reset"  type="reset" color="primary" flat class="q-ml-sm" />
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>
       </form>
      </div>
      </q-card-section>

      </q-card>

</template>
<script setup>
import {  ref } from 'vue'
import {useStoreAppointments} from 'stores/storeAppointments'
import { useStorePatients } from 'src/stores/storePatients'
import { uid, useQuasar } from 'quasar'



/*
 Quasar Lib
*/

const $q =useQuasar()

/*
  store
*/
   const storeAppointments=useStoreAppointments()
   const storePatients=useStorePatients()

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
              id:uid()
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

/*
 addAppointment
*/
  const appointment = ref({
    time:'',
    duration:'',
    bgcolor:'',
    details:'',
    date:'',
    doctor:'',
    title:'',
  })

  const onSubmit= ()=> {
            storeAppointments.loadingAppointments=true
            console.log(appointment.value)
            storeAppointments.addAppointment(appointment.value)
            closeModal()
            storeAppointments.loadingAppointments=false
            //  addpatientdialog.value=false
              $q.notify({
                        icon: 'done',
                        color: 'positive',
                        message: 'Appointment Added',
                        actions: [{ label: 'Dismiss', color: 'white', handler: () => { /* ... */ } } ]
                        })

          }

       const onReset= ()=> {
        appointment.value.duration = ''
        appointment.value.title = null
        appointment.value.time = ' '
        appointment.value.date = ' '
        appointment.value.details = 'Check up'
        appointment.value.doctor = ''
        appointment.value.bgcolor = 'orange'
        // moneyhavetopayRef.value.resetValidation()
        // moneypaidRef.value.resetValidation()
        // detailsRef.value.resetValidation()

      }



/*
   props
*/
   const props = defineProps({

   appointment:{
    type:Object
   }
   })




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
</script>

<style lang="scss">
.q-list--dense > .q-item, .q-item--dense {
    padding: 0px 0px;
}

</style>
