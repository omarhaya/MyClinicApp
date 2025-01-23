<template>
  <ion-page ref="page">
      <ion-header v-if="mobile" :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button :text="lastRouteText" :default-href="lastRoute"></ion-back-button>
      </ion-buttons>
      <ion-title>Back Button</ion-title>
    </ion-toolbar>
  </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>

        </ion-toolbar>
      </ion-header>
      <div class="q-pa-xs">
      <div class="flex items-center space-x-2">
        <router-link v-if="!mobile" class="nav-link" :to="lastRoute">
          <Button variant="outline" size="icon" class="h-7 w-7 button-custom">
            <ChevronLeft class="h-4 w-4" />
            <span class="sr-only">Back</span>
          </Button>
        </router-link>
        <PatientTitle :patientId="patientId" />
      </div>
      <div :class="{'row reverse q-mr-md ' :$q.screen.gt.sm , 'row ' :!$q.screen.gt.sm} " >
<div :class="{'q-pl-md q-mb-lg q-mr-xs col-12 col-sm-4 q-gutter-md' :$q.screen.gt.sm , 'q-mb-lg col-12 col-md-auto q-pa-xs' :!$q.screen.gt.sm} " >

        </div>
       <div :class="{'col-12 col-sm-8' :$q.screen.gt.sm , ' col-12 ' :!$q.screen.gt.sm} ">
        <div class="q-gutter-y-md">

        </div>
        </div>
       </div>
       <q-card :class="{'sticky-tabs-mobile' :mobile , ' sticky-tabs-desktop' :!mobile}">
          <q-tabs
              align="justify"
              v-model="tab"
              indicator-color="white"
              class="bg-secondary text-grey-5 shadow-2 "
              active-color="white"
              font-size="40px"
            >
              <q-tab name="appointments" icon="calendar_today" font-size="40px" ><div v-if="!mobile">Appointments</div></q-tab>
              <q-tab name="payments" icon="swap_horiz" ><div v-if="!mobile">Payments</div></q-tab>
              <q-tab name="invoices" icon="request_page" ><div v-if="!mobile">Invoices</div></q-tab>

            </q-tabs>
            <q-separator />


        <q-tab-panels class="text-center"  v-model="tab" animated  >
        <q-tab-panel style="padding: 0px;" name="appointments">
        <!-- Appointments -->
        <AppointmentsPatientView  :patientId="patientId "></AppointmentsPatientView>
        </q-tab-panel>
        <q-tab-panel style="padding: 0px;"  name="payments">
        <!-- Payments -->
        <PaymentsPatientView :pageRef="page"  :patientId="patientId"></PaymentsPatientView>
        </q-tab-panel>
        <q-tab-panel style="padding: 0px;" name="invoices">
       <InvoicesPatientView :pageRef="page" @openPaymentModal="openPaymentModal"  :patientId="patientId"></InvoicesPatientView>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    </div>

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
import Button from 'src/components/ui/button/Button.vue'
import {  ChevronLeft } from 'lucide-vue-next'
import PatientTitle from 'src/components/Patients/PatientTitle.vue'
 const page=ref()
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
const patient = computed (()=>{
  console.log(storePatients.patients.find(patient=>patient.patientId===patientId.value),'ssaa')
  return storePatients.patients.find(patient=>patient.patientId===patientId.value)
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
<style scoped>
.sticky-tabs-desktop {
  position: sticky;
  top: 0;
  z-index: 10; /* Adjust as needed to ensure it appears above other content */
  margin:10px;
}
.sticky-tabs-mobile {
  position: sticky;
  top: 0;
  z-index: 10; /* Adjust as needed to ensure it appears above other content */
  border-radius: 0;
}
body.dark .q-tab-panels {
  background-color: #142325; /* Background color for dark mode */
}
</style>
