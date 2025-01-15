import { defineStore } from 'pinia';
import {
  collection, onSnapshot, doc, getDoc, updateDoc,
} from 'firebase/firestore';
import { db } from '/src/js/firebase';
import { useStoreAuth } from './storeAuth';
import { Platform, useQuasar } from 'quasar';
import { today } from '@quasar/quasar-ui-qcalendar/src/index.js';
import { computed } from 'vue';
import { useTheme } from 'vuetify'

let settingsCollectionRef;

export const useStoreSettings = defineStore('storeSettings', {
  state: () => {
    const mobile = computed(() => {
      if (Platform.is.desktop) return false;
      if (Platform.is.mobile) return true;
      return false;
    })
     const $q = useQuasar()
     const theme = useTheme()
    return {
      selectedDate: today(),
      $q,
      theme,
      storeAuth: useStoreAuth(),
      loading: false,
      appearance: {
        theme: 'system', // Default theme
        fontContext: 'system',
        miniState: true,
      },
      // darkMode: computed({
      //   get() {
      //     return $q.dark.isActive
      //   },
      //   set(value) {
      //     $q.dark.set(value)
      //     document.body.classList.toggle('dark', value)
      //     document.body.classList.toggle('ion-dark', value)
      //     theme.global.name.value = value ? 'dark' : 'light'
      //   }
      // }),
      userSettings: [], // To store the document data
    };
  },

  actions: {
    init() {
      settingsCollectionRef = collection(db, 'users');
    },

    async getSettings(userId) {
      this.loading = true;

      try {
        const userDocRef = doc(settingsCollectionRef, this.storeAuth.user.uid);

        // Fetch the initial data
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          this.userSettings = userData || [];
          this.appearance = userData.appearance || this.appearance;
        } else {
          console.log('Document does not exist!');
          this.userSettings = null;
        }

        // Start listening for live updates
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data();
            this.userSettings = userData || [];
            this.appearance = userData.appearance || this.appearance;
          } else {
            console.log('Document does not exist (real-time)!');
            this.userSettings = null;
          }
        });

        // Save the unsubscribe function
        this.unsubscribe = unsubscribe;
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        this.loading = false;
      }
    },

    // Cleanup function to stop listening to changes
    stopListening() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    async setTheme(theme) {
      try {
        this.loading=true
        this.appearance.theme = theme; // Update the local state
        const userDocRef = doc(settingsCollectionRef, this.storeAuth.user.uid);

        // Update Firestore with the new theme
        await updateDoc(userDocRef, {
          'appearance.theme': theme,
        });
      } catch (error) {
        console.error('Error setting theme:', error);
      }
      this.loading=false
    },
    async setFontContext(fontContext) {
      try {
        this.loading=true
        this.appearance.fontContext = fontContext; // Update the local state
        const userDocRef = doc(settingsCollectionRef, this.storeAuth.user.uid);

        // Update Firestore with the new font context
        await updateDoc(userDocRef, {
          'appearance.fontContext': fontContext,
        });
      } catch (error) {
        console.error('Error setting font context:', error);
      }
      this.loading=false
    },
  },
});
