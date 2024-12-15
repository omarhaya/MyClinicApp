<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-segment class="segments" :value="segment" @ionChange="updateSegment">
          <ion-segment-button class="segment" value="all">All</ion-segment-button>
          <ion-segment-button class="segment" value="favorites">Favorites</ion-segment-button>
        </ion-segment>

        <ion-buttons slot="end">
          <ion-button @click="presentFilter">
            <ion-icon slot="icon-only" :icon="options"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-content"  :fullscreen="true">
      <q-dialog v-model="modals.addPatient" persistent >
      <ModalAddPatient
      v-if="modals.addPatient"
      v-model="modals.addPatient"
       />
     </q-dialog>



         <q-dialog v-model="modals.addAppointment" persistent >
      <appointmentModal
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
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Patients</ion-title>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar
            v-model="queryText"
            :debounce="500"
            @ionInput="updateSearchTerm($event)"
             @keyup.enter="dissmissKeyboard"
            placeholder="Search"
          ></ion-searchbar>
        </ion-toolbar>
      </ion-header>
      <ion-searchbar
            v-if="!mobile"
            v-model="queryText"
            :debounce="500"
            @ionInput="updateSearchTerm($event)"
            placeholder="Search"
          ></ion-searchbar>
      <ion-list v-show="allGroupedComputed?.length > 0" >
        <ion-item-group v-for="group in allGroupedComputed"   >
          <ion-item-divider sticky>
            <ion-label class="q-pl-lg">{{group.letter}}</ion-label>
          </ion-item-divider>

          <ion-item-sliding
          v-for="patient in group.patients"
          >
            <ion-item @click="$router.push(`/Patients/${patient.patientId}`)" button >
              <q-item-section  avatar>
              <q-avatar v-if="!isArabic(patient.namef)" class="avatar-name" size="45px" font-size="20px" color="green-3" text-color="white"> {{getInitials( patient.namef) }} </q-avatar>
              <q-avatar v-if="isArabic(patient.namef)" class="avatar-person" font-size="55px" size="45px" color="green-3" text-color="white" icon="person"/>
               </q-item-section>

              <ion-label :style="getLabelStyle('primary')" >
                <h2>{{patient.namef}}</h2>
                <p>
                  Age: {{patient.age}}
                </p>
              </ion-label>
              <h6 class="q-pl-md" style="min-width:40px;">#{{patient.index}}</h6>
            </ion-item>
            <ion-item-options>
              <!-- <ion-item-option
                color="favorite"
                @click="addFavorite($event, )"

                >Favorite</ion-item-option
              > -->
              <ion-item-option
                color="danger"
                @click="showActions($event,  'Remove Favorite')"

                >Remove</ion-item-option
              >
            </ion-item-options>
          </ion-item-sliding>
        </ion-item-group>
      </ion-list>

      <ion-list-header v-show="allGrouped?.length === 0"
        >No Sessions Found</ion-list-header
      >
      <ion-fab slot="fixed" vertical="bottom" horizontal="end" ref="fab">
        <ion-fab-button  @click="AddPatientModal">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>

      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<style scoped></style>

<script setup >
import { ref, onMounted, watch, computed,reactive } from "vue";
import { dateFormat } from "src/filters/dateFormat";

import {
  IonPage,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonContent,
  IonList,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonListHeader,
  IonFab,
  IonFabButton,
  IonFabList,
  alertController,
  modalController,
  loadingController,
  menuController,
  IonRouterOutlet,
} from "@ionic/vue";
import {
  addOutline,
  logoVenmo,
  logoGoogle,
  logoTwitter,
  logoFacebook,
  options,
} from "ionicons/icons";
import { useIonRouter } from "@ionic/vue";
import { useStorePatients } from "src/stores/storePatients";
import appointmentModal from "src/components/appointmentModal.vue";
import ModalAddPatient from "src/components/Patients/ModalAddPatient.vue";
import ModalDeletePatient from "src/components/Patients/ModalDeletePatient.vue";
import { Platform } from "quasar";
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';

const storePatients=useStorePatients()
const segment = ref("all");
const queryText = ref("");
const fab = ref(null);
const fabButton = ref(null);
const fabList = ref(null);
const store = ref('hi')
const ionRouter = useIonRouter();
async function dissmissKeyboard (){
  await Haptics.impact({ style: ImpactStyle.Light });
  Keyboard.hide();
}

const AddPatientModal= async() =>{
  await Haptics.impact({ style: ImpactStyle.Light });
  modals.addPatient=true

}
const showActions = async () => {
  console.log('show action sheet')
  const result = await ActionSheet.showActions({
    title: 'Photo Options',
    message: 'Select an option to perform',
    options: [
      {
        title: 'Upload',
      },
      {
        title: 'Share',
      },
      {
        title: 'Remove',
        style: ActionSheetButtonStyle.Destructive,
      },
    ],
  });

  console.log('Action Sheet result:', result);
};
const allGroupedRef = ref([]);
const groupedByFirstLetter = () => {
  const patients = storePatients.patients;

  // Remove leading spaces and group patients by the first letter of their names
  const groups = patients.reduce((acc, patient) => {
    const name = patient.namef.trim(); // Remove leading and trailing spaces
    const firstLetter = name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(patient);
    return acc;
  }, {});

  // Sort groups alphabetically by first letter
  const sortedGroups = Object.keys(groups).sort().map(letter => {
    // Sort patients within each group alphabetically by each character in their names
    const sortedPatients = groups[letter].sort((a, b) => {
      for (let i = 0; i < Math.min(a.namef.length, b.namef.length); i++) {
        if (a.namef[i] !== b.namef[i]) {
          return a.namef[i].localeCompare(b.namef[i]);
        }
      }
      // If names are identical up to the shortest name's length, the longer name comes first
      return a.namef.length - b.namef.length;
    });

    return {
      letter,
      patients: sortedPatients
    };
  });

  return sortedGroups;
};
const allGrouped = computed(() => {
  if (segment.value === "all") {
    return groupedByFirstLetter();
  } else {
    // Implement grouping for favorite patients if needed
    return [];
  }
});


const allGroupedComputed = computed(() => {
  console.log(allGroupedRef.value,'allGroupedRef.value;')
  return allGroupedRef.value;
});

const groupedByStartTime = () => {

};





const modals = reactive({
  deletePatient:false,
  addPatient:false,
  addAppointment:false,
  addPayment:false

 })

const getLabelStyle = (track) => {
  let colorVar = track === "Ionic" ? "primary" : track.toLowerCase();
  return {
    // borderRight: `2px solid var(--ion-color-${colorVar})`,
    paddingLeft: "10px",
    marginTop:"10px",
    marginBottom:"10px"
  };
};

const addFavorite = async (event, session) => {

};

// const removeFavorite = async (event, session, title) => {
//   const alert = await alertController.create({
//     header: title,
//     message: "Would you like to remove this session from your favorites?",
//     buttons: [
//       {
//         text: "Cancel",
//         handler: () => {
//           const slidingItem = event.target.closest("ion-item-sliding");
//           slidingItem.close();
//         },
//       },
//       {
//         text: "Remove",
//         handler: () => {
//           store.dispatch("removeFavorite", session.id);

//           const slidingItem = event.target.closest("ion-item-sliding");
//           slidingItem.close();
//         },
//       },
//     ],
//   });
//   await alert.present();
// };

const goToSessionDetail = (session) => {
  ionRouter.push({
    name: "session-detail",
    params: { sessionId: session.id.toString() },
  });
};

const presentFilter = async () => {

};

const updateSegment = (e) => {
  segment.value = e.detail.value;
};

const updateSearchTerm = (e) => {
  queryText.value = e.target.value.trim(); // Trim any leading or trailing spaces
  // If queryText is empty, show all patients, otherwise filter patients by name
  allGroupedRef.value = queryText.value === '' ? allGrouped.value : filterPatientsByName(queryText.value);
};

const filterPatientsByName = (query) => {
  const filteredGroups = allGrouped.value.map(group => ({
    letter: group.letter,
    patients: group.patients.filter(patient => patient.namef.toLowerCase().includes(query.toLowerCase()))
  }));
  return filteredGroups.filter(group => group.patients.length > 0); // Remove groups with no matching patients
};

const openSocial = async (network) => {
  if (fab.value) {
    const loading = await loadingController.create({
      message: `Posting to ${network}`,
      duration: (Math.random() * 1000 + 500),
    });
    await loading.present();
    await loading.onWillDismiss();
    fab.value.close();
  }
};

const checkAndLoadData = async () => {
  if (allGroupedRef.value.length === 0) {
     allGroupedRef.value=allGrouped.value
  }
};
watch(allGrouped, (newValue) => {
  allGroupedRef.value = newValue
});

onMounted(() => {
  menuController.enable(true);
  checkAndLoadData();
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
const isArabic=(value) =>{
            return /[\u0600-\u06FF]/.test(value)
       }
function getInitials(name) {
          const nameParts = name.split(' ');
          const firstName = nameParts[0].charAt(0).toUpperCase();
          const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          return `${firstName}${lastName}`;
       }
</script>

<style lang="scss" scoped >
// ion-content {
//   --offset-top: 0px !important;
//   --offset-bottom: 0px !important;
// }


.sc-ion-label-md-s h3 ,h6 {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    line-height: none;
}
.sc-ion-label-md-s p {
    margin-bottom: 0px;
}
.segment {
    margin-top: 2px !important;
    margin-bottom: 2px !important;
}
.segments {
  margin-top: 4px !important;
  margin-bottom: 4px !important;
  margin-right: auto !important;
  margin-left: auto !important;
  align-items: center;
  justify-content: center; /* Horizontally center the items */
}
.ion-content::part(scroll) {
--offset-top: 0px !important;
--offset-bottom: 0px !important;
}
</style>
