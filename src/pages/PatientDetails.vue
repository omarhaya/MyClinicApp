<template>
  <ion-page>
    <ion-header v-if="mobile" :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button :text="lastRouteText" :default-href="lastRoute"></ion-back-button>
      </ion-buttons>
      <ion-title>Back Button</ion-title>
    </ion-toolbar>
  </ion-header>
      <ion-header collapse="condense">
        <ion-toolbar>

        </ion-toolbar>
      </ion-header>
    <ion-content  color="light" >
      <router-link v-if="!mobile" class="nav-link flex" :to="lastRoute">
      <img src="../assets/icon-arrow-left.svg" alt="" />
      Back
    </router-link>
      <div :class="{'row reverse q-mt-lg q-mr-md ' :$q.screen.gt.sm , 'row q-mt-lg ' :!$q.screen.gt.sm} " >

<div :class="{'q-pl-md q-mb-lg q-mr-xs col-12 col-sm-4 q-gutter-md' :$q.screen.gt.sm , 'q-mb-lg col-12 col-md-auto q-pa-xs' :!$q.screen.gt.sm} " >
<!-- Patient details -->
<Patient  :patientId="patientId"/>
        </div>
       <div :class="{'col-12 col-sm-8' :$q.screen.gt.sm , ' col-12 ' :!$q.screen.gt.sm} ">
        <div class="q-gutter-y-md">
          <q-card>
          <q-card-section>
          </q-card-section>
        </q-card>

        </div>
        </div>
       </div>
          <q-card class="q-ma-xs"   style="min-height: 323px">
          <q-tabs

              v-model="tab"
              indicator-color="orange-6"
              class="bg-primary text-grey-5 shadow-2 "
              active-color="white"
            >
              <q-tab name="appointments" icon="calendar_today" />
              <q-tab name="payments" icon="payments" />
              <q-tab name="invoices" icon="request_page" />

            </q-tabs>
            <q-separator />

        <q-tab-panels  v-model="tab" animated  >
        <q-tab-panel style="padding: 0px;" name="appointments">
        <!-- Appointments -->
        <AppointmentsPatientView  :patientId="patientId "></AppointmentsPatientView>
        </q-tab-panel>
        <q-tab-panel style="padding: 0px;"  name="payments">
        <!-- Payments -->
        <PaymentsPatientView  :patientId="patientId"></PaymentsPatientView>
        </q-tab-panel>
        <q-tab-panel style="padding: 0px;" name="invoices">
       <InvoicesPatientView @openPaymentModal="openPaymentModal"  :patientId="patientId"></InvoicesPatientView>
        </q-tab-panel>
      </q-tab-panels>

      </q-card>
    </ion-content>
    </ion-page>
</template>
<script setup>
import {ref,computed} from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {useStorePatients} from 'stores/storePatients'
import AppointmentsPatientView from 'src/components/PaymentsAndAppointments/AppointmentsPatientView.vue'
import PaymentsPatientView from 'src/components/PaymentsAndAppointments/PaymentsPatientView.vue'
import InvoicesPatientView from 'src/components/PaymentsAndAppointments/InvoicesPatientView.vue'
import Patient from 'src/components/Patients/Patient.vue'
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonPage, IonHeader, IonToolbar, IonTitle, IonContent , IonBackButton, IonButtons, } from '@ionic/vue';
import { Platform } from 'quasar'

 const tab=ref('payments')
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
const patientId=computed(()=>{
  console.log(route.params.patientId,'route.params.patientId')
  return route.params.patientId
})
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
       const lastRoute = computed(() => {
      const route = router.options.history.state.back;
      return route ? route : '/';  // Default to home if no last route is found
    });

    const lastRouteText = computed(() => {
      const route = router.options.history.state.back;
      if (route) {
        const parts = route.split('/');
        return parts.length > 1 ? parts[1] : parts[0];
      } else {
        return 'home';
      }
    });

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
