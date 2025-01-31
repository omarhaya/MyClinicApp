import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '/src/js/firebase'
import { doc, setDoc, onSnapshot,updateDoc } from 'firebase/firestore'
import { useStorePatients } from './storePatients'
import { useStoreAppointments } from './storeAppointments'
import { useStorePayments } from './storePayments'
import { useStoreInvoices } from './storeInvoices'
import { useStoreWorks } from './storeWorks'
import { useStoreSettings } from './storeSettings'

let getStaffSnapshot = null
let getUserRoleSnapshot = null

export const useStoreAuth = defineStore('storeAuth', {
  state: () => {
    const storePayments = useStorePayments()
    const storePatients = useStorePatients()
    const storeAppointments = useStoreAppointments()
    const storeInvoices = useStoreInvoices()
    const storeWorks = useStoreWorks()
    const storeSettings=useStoreSettings()
    return {
      user: {},
      doctors: [],
      role: null,
      storePatients,
      storeAppointments,
      storePayments,
      storeInvoices,
      storeSettings,
      storeWorks,
      errorMessageLogin: '',
      errorMessageRegister: '',
      loadingStaff: false,
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
              onSnapshot(docRef, async (doc) => {
                if (doc.exists()) {
                  this.role = doc.data().role;
                  this.loading = false;

                  await this.waitForLoading();
                  const clinicId = this.role.clinicId || user.uid;
                  this.getStaff(clinicId);

                  // Initialize dependent stores
                  try {
                    await Promise.all([
                      this.storePatients.init(user.uid),
                      this.storeAppointments.init(),
                      this.storePayments.init(),
                      this.storeInvoices.init(),
                      this.storeWorks.init(),
                      this.storeSettings.init(),
                    ]);
                    await this.storeSettings.getSettings();
                    this.initialized = true;
                    resolve();
                  } catch (error) {
                    console.error('Error initializing stores:', error);
                    reject(error);
                  }
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
            staff: {
              [userCredential.user.uid]: {
                staffId: userCredential.user.uid,
                name: credentials.practicename,
                role: 'admin',
                permissions:[
                  "Delete Patients","Delete Appointments","Delete Records","Delete Invoices","Edit Patients" ,"Edit Invoices","Edit Records" ,"Edit Appointments","Add Patients","Add Appointments","Add Records","Add Invoices","Add Transactions","Edit Transactions","Delete Transactions"]
              }
            }
          });
        }).catch((err) => {
          this.errorMessageRegister = err.message;
          console.log('err.message', err.message);
        });
        this.loading=false
    },

    getStaff(clinicId) {
      // Set doctors array
      getStaffSnapshot = onSnapshot(doc(db, 'users', clinicId), (doc) => {
        const doctorsData = doc.data().staff;
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
            if (doctor.userId === this.role.clinicId) {
              doctor.role = 'admin';
            }
            // doctor.permissions=['Add Patients','Delete Patients','Edit Patients', 'Prescribe Treatments', 'Access Records','Add Patients', 'Delete Appointments','Edit Appointments', 'View Records', 'Perform Procedures', 'Edit Records', 'Add Appointments', 'Answer Calls','Add Invoices','Delete Invoices','Edit Invoices','Add Transactions','Delete Transactions','Edit Transactions'];
          });
  //         { id: 'S001', name: 'Alice Smith', role: 'Doctor', permissions: ['View Patients', 'Prescribe Treatments', 'Access Records'] },
  // { id: 'S002', name: 'John Doe', role: 'Doctor', permissions: ['Manage Appointments', 'View Records'] },
  // { id: 'S003', name: 'Emily Davis', role: 'Nurse', permissions: ['Perform Procedures', 'Edit Records'] },
  // { id: 'S004', name: 'Michael Brown', role: 'Receptionist', permissions: ['Schedule Appointments', 'Answer Calls'] },
          // Make the doctor with doctorId equal to user.uid first in the array
          const userUid = this.user.uid; // Assume user.uid is available in the context
          doctorsArray = doctorsArray.sort((a, b) => {
            if (a.userId === userUid) return -1;
            if (b.userId === userUid) return 1;
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
        this.router.push('/auth');
        console.log('user signed out');
      }).catch((error) => {
        console.log(error.message);
      });
    },
    async updateStaff(staff) {
      console.log('staff', staff);
      try {
        const staffUpdate = {};
        staffUpdate[`doctors.${staff.doctorId}`] = staff; // Correctly target only the specific doctor

        await updateDoc(doc(db, "users", this.role.clinicId), staffUpdate);
        console.log(`Updated staff ${staff.doctorId} successfully`);
      } catch (error) {
        console.error("Error updating staff:", error);
      }
    },
  },

  getters: {
    isLoading: (state) => state.loading,
    isAuthenticated: (state) => !!state.user.uid,
  }
});
