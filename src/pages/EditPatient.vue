<template>
 <q-card>
        <q-card-section class="row items-center">
          <div class="q-pa-md" style="max-width: 400px">
    <form @submit.prevent.stop="onSubmit" @reset.prevent.stop="onReset" class="q-gutter-md">
     <div class="row justify-around">
       <q-input
        dense
        class="col q-ml-sm"
        ref="namefRef"
        filled
        v-model="Patient.namef"
        label="Patient's Name *"
        hint="First and Last Name "
        lazy-rules
        :rules="[
        val => (val && val.length > 0 ) || 'Please type something',
        val => (val && val.length < 30) || 'Name is too long'
        ]"
      />

      </div>

      <div class="row justify-around" >
          <q-input
          class="col q-ml-sm"
            dense
            v-model.number="Patient.age"
            ref="ageRef"
            label="Age "
            hint="Patient's real Age "
            type="number"
            filled
            lazy-rules
            :rules="[
            val => (val && val > 0 ) || 'Please type something',
            val => (val > 4 && val < 120) || 'Please type a real age'
            ]"
          />
        </div>
            <div class="row justify-around">
              <MazPhoneNumberInput
                v-model="Patient.phone"
                countrySelectorWidth="110px"
                size="3px"
                :translations="{
                countrySelector: {
                  placeholder: 'Country',
                  },
                }"

                listPosition="top"

                fetchCountry
              />
<!--
            <q-input
              dense
              class="col q-ml-sm"
              ref="phoneRef"
              filled
              label="Mobile phone "
              v-model="Patient.phone"
              label-slot
              mask="#### ### ####"
              hint="Ex.: #### - ### - ####"
            > <template v-slot:label>
                <div class=" items-center all-pointer-events">
                  <q-icon size="20px" color="deep-orange" name="smartphone" />
                  Phone Number
                  <q-tooltip class="bg-grey-8" anchor="top left" self="bottom left" :offset="[0, 8]">Patient's Mobile Number</q-tooltip>
                </div>
              </template>
              </q-input> -->
            </div>

          <q-btn-toggle
              v-model="Patient.gender"
              push
              ref="genderRef"
              rounded
              glossy
              spread

              toggle-color="primary"
              :options="[
                {value: 'Male', slot: 'male'},
                {value: 'Female', slot: 'female'}
              ]"
            >
              <template  v-slot:male>
                <div class="row items-center no-wrap">
                <q-icon left name="male" color="blue" />
                  <div class="text-center">
                  Male <br>
                  </div>
                </div>
              </template>
              <template v-slot:female>
                <div class="row items-center no-wrap">
                  <div class="text-center">
                  Female <br>
                  </div>
                  <q-icon right name="female" color="pink" />
                </div>
              </template>
            </q-btn-toggle>

      <div>
        <q-btn :disable="storePatients.loading" color="primary" label="Save" type="submit"  />
        <q-btn label="Reset"  type="reset" color="primary" flat class="q-ml-sm" />
        <q-btn  flat label="Cancel" color="primary" @click="router.push('/patients')" />
      </div>
    </form>
  </div>
        </q-card-section>
      </q-card>

</template>
<script setup>
import {ref,onMounted} from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {useStorePatients} from 'stores/storePatients'
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput'
import 'maz-ui/css/main.css'


/*
 Quasar Lib
*/

const $q =useQuasar()

/*
  Patient Ref
*/
  const namefRef=ref()
  const ageRef=ref()
  const phoneRef=ref()
  const genderRef=ref()

/*
  router
*/
  const route = useRoute()
  const router=useRouter()

/*
  store Patients
*/
  const storePatients= useStorePatients()

/*
  Save clicked
*/
 const handleSaveClicked=()=>{
    storePatients.updatePatient(route.params.patientId,Patient.value)
    router.push('/patients')
 }




  const onSubmit= ()=> {
        namefRef.value.validate()
        ageRef.value.validate()
        if (namefRef.value.hasError || ageRef.value.hasError ) {
          // form has error
        }
        else if (Patient.value.gender !== 'Male'&& Patient.value.gender !== 'Female') {
          $q.notify({
            color: 'negative',
            message: 'Please add gender later'
          })

        }
        else {
       const duplicate = storePatients.patients.some(patient => (patient.namef === Patient.value.namef&&patient.patientId !==Patient.value.patientId))
       if (duplicate) {
            $q.notify({
            color: 'negative',
            message: 'same patient name already exist please choose different name'
          })}
          else{
            storePatients.loading=true
            handleSaveClicked()
            storePatients.loading=false
            //  addpatientdialog.value=false
              $q.notify({
                        icon: 'done',
                        color: 'positive',
                        message: 'Patient Updated',
                        actions: [{ label: 'Dismiss', color: 'white', handler: () => { /* ... */ } } ]
                        })


          }

        }
      }

       const onReset= ()=> {
        Patient.value.namef = ''
        Patient.value.age = ''
        Patient.value.phone = ''
        Patient.value.gender = ''
        namefRef.value.resetValidation()
        ageRef.value.resetValidation()
        phoneRef.value.resetValidation()

      }

/*
  Patients
*/
 const Patient = ref({
    namef:'',
    age:'',
    gender:'',
    phone:''
  })

Patient.value.namef=storePatients.getPatient(route.params.patientId).namef
Patient.value.age=storePatients.getPatient(route.params.patientId).age
Patient.value.gender=storePatients.getPatient(route.params.patientId).gender
Patient.value.phone=storePatients.getPatient(route.params.patientId).phone
Patient.value.patientId=storePatients.getPatient(route.params.patientId).patientId
</script>
