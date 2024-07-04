<template>

 <ion-page ref="page" >

  <ion-header v-if="mobile" :translucent="true" collapse="fade">
     <ion-toolbar>
      <ion-searchbar v-model="filter" showCancelButton="focus" class="custom"></ion-searchbar>
      <ion-buttons :collapse="true" slot="end">
        <q-btn round color="primary" @click="modals.addPatient=true" size="10px" > <ion-icon slot="icon-only" :icon="personAdd"></ion-icon></q-btn>

      </ion-buttons>
      </ion-toolbar>
    </ion-header>
  <ion-content class=" column no-wrap"
  :style-fn="pageStyleFn" :fullscreen="true">
  <q-dialog v-model="modals.addPatient" persistent >
      <ModalAddPatient
      v-if="modals.addPatient"
      v-model="modals.addPatient"
       />
     </q-dialog>

      <q-dialog v-model="modals.addPayment" persistent >
      <ModalAddPayment
      v-if="modals.addPayment"
      v-model="modals.addPayment"
       />
     </q-dialog>

         <q-dialog v-model="modals.addAppointment" persistent >
      <ModalAddAppointment
      v-if="modals.addAppointment"
      v-model="modals.addAppointment"
       />
     </q-dialog>

   <q-dialog v-model="modals.deletePatient" >
    <ModalDeletePatient
      v-if="modals.deletePatient"
      v-model="modals.deletePatient"
      :patientId="idtag"
    />
    </q-dialog>
    <q-table
    hide-pagination
    :hide-header="mobile"
      dense
      class="my-sticky-header-table col "
      style="min-height: 310px"
      :rows-per-page-options="[0]"
      :rows="storePatients.patients"
      :columns="columns"
      row-key="patientId"
      :filter="filter"
      :loading="storePatients.loading"
      :visible-columns="visibleColumns"
      flat
      no-data-label="No Patients."
      no-results-label="We didn't uncover any results"
      selection="single"
      v-model:selected="selected"
      wrap-cells
    >

      <template v-if="!mobile"  v-slot:top>
        <div>
          <q-btn
          v-if="$q.screen.gt.xs"
          :disable="storePatients.loading"
          @click.prevent="modals.addPatient=true"
          color="primary"
          icon="person_add"
          label="Patient"
        ></q-btn>

        </div>
        <q-btn
          v-if="$q.screen.gt.xs"
          class="q-ml-sm "
          color="primary"
          @click="modals.addAppointment=true"
          :disable="storePatients.loading"
          icon="watch_later"
          label="Appointment"
           />
             <q-btn
          v-if="$q.screen.gt.xs"
          class="q-ml-sm "
          color="primary"
          @click="modals.addPayment=true"
          :disable="storePatients.loading"
          icon="payments"
          label="Payment"
           />
          <q-space />
          <q-input class="q-ml-sm col" style="width: 150px"  outlined  maxlength="20" dense debounce="300" v-model="filter" label="Search">
           <template v-slot:append>
            <q-icon v-if="filter !== ''" name="close" @click="filter = ''" class="cursor-pointer" />
            <q-icon name="search" />
           </template>
          </q-input>
        <q-select
              v-model="visibleColumns"
              multiple
              outlined
              dense
              options-dense
              :display-value="$q.lang.table.columns"
              emit-value
              map-options
              :options="columns"
              option-value="name"
              style="max-width: 150px"
              class="q-ml-sm col"

            />

      </template>
  <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            style="min-width: 35px;"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:selected="props"   >
       <q-tr  :props="props"></q-tr></template>
    <template v-slot:body="props">
        <q-tr @click="props.selected=!props.selected,idtag=props.row.patientId,nametag=props.row.namef "  :props="props" >
          <q-td auto-width :class="{'bg-red-1' :props.row.offline , 'bg-green-1' :!props.row.offline} " key="index" :props="props">
     <div class="row">
     <div class="col q-mr-sm">
         <q-btn  size="7px"  :label="props.row.name" color="primary" :disable="storePatients.loadingAppointments" v-on:click.stop dense @click="props.selected=!props.selected,idtag=props.row.patientId,nametag=props.row.namef " :icon="props.selected ? 'expand_less' : 'expand_more'" />
     </div>
     <div class="col ">


     </div>
     </div>
          </q-td>
       <q-td auto-width :class="{'bg-red-1' :props.row.offline , 'bg-green-1' :!props.row.offline} " key="index" :props="props">
           <q-badge  transparent align="middle" color="grey-10">
      {{ props.row.index }}
      </q-badge>

          </q-td>
             <q-td key="namef" :props="props">
              <q-avatar v-if="!isArabic(props.row.namef)" class="avatar-name" font-size="15px" size="30px" color="green-3" text-color="white"> {{getInitials( props.row.namef) }}</q-avatar>
              <q-avatar v-if="isArabic(props.row.namef)" class="avatar-person" font-size="34px" size="30px" icon="person" color="green-3" text-color="white"/>
            {{ props.row.namef }}
          </q-td>
                 <q-td key="age" :props="props">
            {{ props.row.age  }}
          </q-td>

        </q-tr>

        <q-tr  :props="props" :key="`e_${props.row.index}`" class="q-virtual-scroll--with-prev tr-expand">
  <q-slide-transition>
          <q-td class="td-expand inset-shadow"  v-show="props.selected" colspan="100%">
       <q-slide-transition>
            <div v-show="props.selected" >
            <div :class="{'row reverse q-mt-lg q-mr-md' :$q.screen.gt.sm , 'row q-mt-lg ' :!$q.screen.gt.sm} " >

    <div :class="{'q-pl-md q-mb-lg col-12 col-sm-4 q-gutter-md' :$q.screen.gt.sm , 'q-mb-lg col-12 col-md-auto' :!$q.screen.gt.sm} " >
    <!-- Patient details -->
    <Patient  :patientId="props.row.patientId"/>
            </div>
           <div :class="{'col-12 col-sm-8' :$q.screen.gt.sm , ' col-12 ' :!$q.screen.gt.sm} ">
            <div class="q-gutter-y-md">
              <q-card>
              <q-card-section>
                gii
              </q-card-section>
            </q-card>

            </div>
            </div>
           </div>
              <q-card   style="min-height: 323px">
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
            <AppointmentsPatientView v-if="props.selected" :patientId="props.row.patientId"></AppointmentsPatientView>
            </q-tab-panel>
            <q-tab-panel style="padding: 0px;"  name="payments">
            <!-- Payments -->
                    <PaymentsPatientView v-if="props.selected" :patientId="props.row.patientId"></PaymentsPatientView>
            </q-tab-panel>
            <q-tab-panel style="padding: 0px;" name="invoices">
           <InvoicesPatientView @openPaymentModal="openPaymentModal" v-if="props.selected" :patientId="props.row.patientId"></InvoicesPatientView>
            </q-tab-panel>
          </q-tab-panels>

          </q-card>
         </div>

        </q-slide-transition>
          </q-td>
        </q-slide-transition>
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

     <template v-slot:loading>
        <q-inner-loading
          label="Please wait..."
          label-class="text-teal"
          label-style="font-size: 1.1em"
          showing
          color="primary" />
      </template>
    </q-table>

            <!-- fab on mobile view -->

          <div  v-if="$q.screen.gt.xs">
            </div>
            <div  v-else>
          <!-- <q-page-sticky
            position="bottom-right"
            :offset="fabPos">
            <q-fab
              icon="add"
              direction="up"
              color="primary"
              :disable="draggingFab||storePatients.loading"
              v-touch-pan.prevent.mouse="moveFab"
            >
              <q-fab-action color="primary" :disable="storePatients.loading"  @click="modals.addPatient=true" icon="person_add" />
              <q-fab-action color="primary" @click="modals.addAppointment=true" icon="watch_later" />
              <q-fab-action color="primary" @click="modals.addPayment=true" icon="payments" />
            </q-fab>
          </q-page-sticky> -->
          </div>
          </ion-content>
        </ion-page>

</template>

<script setup>
import {ref,reactive,computed} from 'vue'
import { useQuasar } from 'quasar'
import {useStorePatients} from 'stores/storePatients'
import { useWatchCharacters } from 'src/use/useWatchCharacters'
import ModalAddPatient from 'src/components/Patients/ModalAddPatient.vue'
import ModalDeletePatient from 'src/components/Patients/ModalDeletePatient.vue'
import Patient from 'src/components/Patients/Patient.vue'
import ModalAddPayment from 'src/components/PaymentsAndAppointments/ModalAddPayment.vue'
import AppointmentsPatientView from 'src/components/PaymentsAndAppointments/AppointmentsPatientView.vue'
import ModalAddAppointment from 'src/components/PaymentsAndAppointments/ModalAddAppointment.vue'
import PaymentsPatientView from 'src/components/PaymentsAndAppointments/PaymentsPatientView.vue'
import InvoicesPatientView from 'src/components/PaymentsAndAppointments/InvoicesPatientView.vue'
import { IonSearchbar, IonHeader, IonIcon , IonToolbar ,IonPage ,IonContent,modalController} from '@ionic/vue';
import { personAdd, people, card } from 'ionicons/icons';
import { Platform } from 'quasar'
import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'


/*
  store
*/

  const storePatients=useStorePatients()

/*
 quasar
*/
   const $q = useQuasar()

/*
  Patients ref
*/

 const newPatient =ref('')
 const addPatientRef=ref(null)

 const addPatient=()=> {
    storePatients.addPatient(newPatient.value)
     newPatient.value=''
     addEditPatientRef.value.focusTextarea()
 }
/*
 Table
*/
    const filter = ref('')
    const selected = ref([])
    const columns = [
      { required: true, name: 'index',label: '#',field: 'index',align: 'left',sortable: true,headerStyle: 'min-width: 1px',classes: 'index-class'},
      { name: 'offline',label: 'offline',field: 'offline',},
      { name: 'namef',classes: 'name-class', required: true, label: 'Patients Name',align: 'left',field: row => row.namef,format: val => `${val}`,sortable: true},
      { name: 'age',  label: 'Age', field: 'age', sortable: true },
      { name: 'lastappointment', label: 'Last Appointment', field: 'lastappointment' ,align: 'left' },
      { name: 'nextappointment', label: 'Next Appointment', field: 'nextappointment',align: 'left' },
      { name: 'phone', label: 'Mobile No.', field: 'phone' },
    ]


    const visibleColumns= ref(['age', 'MoneyRemain', 'LastAppointment', 'icon','index', 'NextAppointment', 'MobileNo', 'name' ])

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
 Fab
*/
   const fabPos = ref([ 18, 70 ])
   const draggingFab = ref(false)
   const onClick= ()=> {
        // console.log('Clicked on a fab action')
      }
   const moveFab= (ev)=> {
      draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

        fabPos.value = [
          fabPos.value[ 0 ] - ev.delta.x,
          fabPos.value[ 1 ] - ev.delta.y
        ]
      }


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
/*
 Modals
*/


 const modals = reactive({
  deletePatient:false,
  addPatient:false,
  addAppointment:false,
  addPayment:false

 })
 const tab=ref('payments')

 useWatchCharacters(newPatient)

 const openPaymentModal = async () => {
    const modal = await modalController.create({
      component: MobilePaymentModal,
      presentingElement:page.value.$el,
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }
  };
  const page = ref();
</script>


<style lang="sass">

.my-sticky-header-table
  /* height or max-height is important */
  max-height: 310px
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: rgb(193 244 205 / 93%)
  thead tr th
    position: sticky
    z-index: 1

  thead tr:first-child th
    top: 0
  /* this is when the loading indicator appears */
.q-table tbody td:after
    background: rgb(255 255 255 / 0%)
.q-table--dense .q-table tbody tr
    height: 50px
.q-table--dense .q-table th, .q-table--dense .q-table td
    padding: 1px 5px
.q-table--dense .q-table tbody .tr-expand
    height: 1px
    background-color: rgb(77 102 100 / 12%)
.q-table--dense .q-table td:last-child
    padding-right: 1%
    padding-left: 1%
.q-table--dense .q-table tbody td .td-expand
    height: 0px
    font-size: 15px
.q-table .td-expand:before
    background: transparent !important
.q-table thead, .q-table tr, .q-table th, .q-table td
    border-color: rgb(77 102 100 / 12%)
.q-table tbody td
    font-size: 14px
.q-inner-loading
    z-index: 20
.q-page-sticky--shrink
    z-index: 20
.offlinepatient
  thead tr:first-child th:first-child
    /* bg color is important for th; just specify one */
    background-color: #fff


  td:first-child
    background-color: #f5f5dc


  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 1

.q-scrollarea
  background: #f0eaea00

</style>
