import { defineStore } from 'pinia';
import {
  collection, onSnapshot, doc, getDoc,
} from 'firebase/firestore';
import { db } from '/src/js/firebase';
import { useStoreAuth } from './storeAuth';
import { Platform } from 'quasar';
import { today } from '@quasar/quasar-ui-qcalendar/src/index.js';
import { computed } from 'vue';

let settingsCollectionRef;

export const useStoreSettings = defineStore('storeSettings', {
  state: () => {
    const mobile = computed(() => {
      if (Platform.is.desktop) {
        return false;
      }
      if (Platform.is.mobile) {
        return true;
      }
      // Default to false if neither
      return false;
    });
    return {
      selectedDate: today(),
      storeAuth: useStoreAuth(),
      loading: null,
      userSettings: null, // To store the document data
      miniState:true,
    };
  },

  actions: {
    init() {
      settingsCollectionRef = collection(db, 'users');
    },

    async getSettings(userId) {
      this.loading = true;

      try {
        // Reference the document with the specific ID
        const userDocRef = doc(settingsCollectionRef, this.storeAuth.user.uid);

        // Listen for real-time updates
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            console.log('Live Document data:', docSnapshot.data());
            const userData = docSnapshot.data()
            this.miniState=userData.miniState
            this.userSettings = userData; // Update the store with the data
          } else {
            console.log('Document does not exist!');
            this.userSettings = null;
          }
        });

        // Save the unsubscribe function if needed
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
    async updateConversionRate() {
      const userDocRef = doc(settingsCollectionRef, this.storeAuth.user.uid);
      await updateDoc(userDocRef, {
        [`currencies.${newCurrency}`]: {
          rateToMain: conversionRate,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      });
     }
  },

  getters: {},
});
