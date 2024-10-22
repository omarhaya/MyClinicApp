import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '/src/js/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { useStorePatients } from './storePatients'
import { useStoreAppointments } from './storeAppointments'
import { useStorePayments } from './storePayments'
import { useStoreInvoices } from './storeInvoices'
import { useStoreWorks } from './storeWorks'
import { useStoreExpenses } from './storeExpenses'

let getDoctorsSnapshot = null
let getUserRoleSnapshot = null

export const useStoreAuth = defineStore('storeAuth', {
  state: () => {
    const storePayments = useStorePayments()
    const storePatients = useStorePatients()
    const storeAppointments = useStoreAppointments()
    const storeInvoices = useStoreInvoices()
    const storeWorks = useStoreWorks()
    const storeExpenses = useStoreExpenses()
    return {
      user: {},
      doctors: [],
      role: null,
      storePatients,
      storeAppointments,
      storePayments,
      storeInvoices,
      storeExpenses,
      storeWorks,
      errorMessageLogin: '',
      errorMessageRegister: '',
      loadingDoctors: false,
      loading: true, // Add loading state
      initialized: false, // Add an initialized flag
      loadingApp:null,
    }
  },

  actions: {
    async init() {
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const idTokenResult = await user.getIdTokenResult();
              this.user.doctor = idTokenResult.claims.doctor;
              this.user.admin = idTokenResult.claims.admin;
              this.user.adminId = idTokenResult.claims.adminId;
              this.user.uid = user.uid;
              this.user.email = user.email;

              const docRef = doc(db, 'users', user.uid);
              const docSnapshot = await onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                  this.role = doc.data().role;
                  this.loading = false; // Set loading to false after getting the role

                  // Wait for the loading to be finished before calling getDoctors
                  this.waitForLoading().then(() => {
                    if (this.role.clinicId !== '') {
                      this.getDoctors(this.role.clinicId);
                    } else {
                      this.getDoctors(user.uid);
                    }
                    // Initialize other stores that depend on authentication
                    this.storePatients.init(user.uid);
                    this.storeAppointments.init();
                    this.storePayments.init();
                    this.storeInvoices.init();
                    this.storeWorks.init();
                    this.storeExpenses.init();
                    this.initialized = true;
                    resolve();
                  });

                } else {
                  this.loading = false;
                  reject('User data not found');
                }
              });

            } catch (error) {
              this.loading = false;
              reject(error.message);
            }
          } else {
            this.user = {};
            this.loading = false;
            reject('User not logged in');
          }
        });
      });
    },

    waitForLoading() {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!this.loading) {
            resolve();
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    },

    registerUser(credentials) {
      this.loading=true
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
        .then((userCredential) => {
          const user = userCredential.user;
          this.errorMessageRegister = '';
          console.log(user, 'ss');
          this.router.push('/');
          this.loading=false
          return setDoc(doc(db, 'users', userCredential.user.uid), {
            practicename: credentials.practicename,
            doctors: {
              [userCredential.user.uid]: {
                doctorId: userCredential.user.uid,
                name: credentials.practicename,
              }
            }
          });
        }).catch((err) => {
          this.errorMessageRegister = err.message;
          console.log('err.message', err.message);
        });
        this.loading=false
    },

    getDoctors(clinicId) {
      // Set doctors array
      getDoctorsSnapshot = onSnapshot(doc(db, 'users', clinicId), (doc) => {
        const doctorsData = doc.data().doctors;
        // Check if doctorsData is an array
        if (Array.isArray(doctorsData)) {
          // If it's an array, use it directly
          this.processDoctorsData(doctorsData);
        } else if (doctorsData) {
          // If it's not an array but has data, convert it to an array
          let doctorsArray = Object.values(doctorsData);

          // Process the doctors array
          this.storePatients.getPatientsAll(doctorsArray);

          doctorsArray.forEach((doctor, index) => {
            doctor.class = 'split' + (index + 1);
            doctor.color = '#5a4d4dd4';
          });
          // Make the doctor with doctorId equal to user.uid first in the array
          const userUid = this.user.uid; // Assume user.uid is available in the context
          doctorsArray = doctorsArray.sort((a, b) => {
            if (a.doctorId === userUid) return -1;
            if (b.doctorId === userUid) return 1;
            return 0;
          });
          this.doctors = doctorsArray;
          console.log(doctorsData, 'sssz');
        } else {
          // If doctorsData is null or undefined
          this.doctors = []; // Assign an empty array or handle as needed
        }
      });
    },


    loginUser(credentials) {
      this.loading=true
      signInWithEmailAndPassword(auth, credentials.email, credentials.password)
        .then((userCredential) => {
          const user = userCredential.user;
          this.errorMessageLogin = '';
          this.router.push('/');
          this.loading=false
        }).catch((err) => {
          this.errorMessageLogin = err.message;
          console.log('err', err.message);
        });
    },

    logoutUser() {
      signOut(auth).then(() => {
        this.storePatients.clearPatients();
        this.storeAppointments.clearAppointments();
        this.storePayments.clearPayments();
        this.storeInvoices.clearInvoices();
        this.storeWorks.clearWorks();
        this.router.push('/');
        console.log('user signed out');
      }).catch((error) => {
        console.log(error.message);
      });
    },
  },

  getters: {
    isLoading: (state) => state.loading,
    isAuthenticated: (state) => !!state.user.uid,
  }
});
