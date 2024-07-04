import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut} from 'firebase/auth'
import {auth,db} from '/src/js/firebase'
import {doc, setDoc,onSnapshot,query,collection,orderBy} from 'firebase/firestore'
import { getFunctions, httpsCallable } from "firebase/functions"
import { useStorePatients } from './storePatients'
import { useStoreAppointments } from './storeAppointments'
import { useStorePayments } from './storePayments'
import { useStoreInvoices } from './storeInvoices'
import { useStoreWorks } from './storeWorks'
import { ref,computed } from 'vue'

let getDoctorsSnapshot=null
let getUserRoleSnapshot=null

export const useStoreSettings = defineStore('storeSettings', {
  state: () => {
    const storePayments=useStorePayments()
    const storePatients=useStorePatients()
    const storeAppointments=useStoreAppointments()
    const storeInvoices=useStoreInvoices()
    const storeWorks=useStoreWorks()
    const miniState=ref(true)
    return {
      user:{},
      doctors:[],
      role:null,
      storePatients,
      storeAppointments,
      storePayments,
      storeInvoices,
      storeWorks,
      errorMessageLogin:'',
      errorMessageRegister:'',
      loadingDoctors:false,
      toolbarHidden:false,
      miniState,
    }
  },

  actions:{
    async init(){

      onAuthStateChanged(auth, (user) => {
        if (user) {
          user.getIdTokenResult().then(idTokenResult=>{
            console.log(idTokenResult.claims)
          this.user.doctor=idTokenResult.claims.doctor
          this.user.admin=idTokenResult.claims.admin
          this.user.adminId=idTokenResult.claims.adminId
          })
          this.user.uid=user.uid
          this.user.email=user.email
          getUserRoleSnapshot = onSnapshot(doc(db, 'users',user.uid), (doc) => {
            this.role=doc.data().role
            if(this.role.clinicId!==''){
              this.getDoctors(this.role.clinicId)
              console.log('!')
            }
             else{
              this.getDoctors(user.uid)

            }
            this.storePatients.init(user.uid)
            this.storeAppointments.init()
            this.storePayments.init()
            this.storeInvoices.init()
            this.storeWorks.init()
            this.router.push('/')
        })
          // this.user.adminId='Nqld8kVPnWXiVhKdishckTEM78G3'

          // this.storePayments.updatePayments()
          // this.storeWorks.updateWorks()
          // this.storeInvoices.updateInvoices()
          // setDoc(doc(db,'users', user.uid), {lasttimelogin:new Date()})
        } else {
          this.user={}
          this.router.replace('/auth')
        }
      })
     },
     registerUser(credentials){
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const user = userCredential.user
        this.errorMessageRegister=''
        console.log(user,'ss')
        return setDoc(doc(db,'users', userCredential.user.uid), {
          practicename:credentials.practicename,
          doctors:{
            [userCredential.user.uid]:{
              doctorId:userCredential.user.uid,
              name:credentials.practicename,
            }
          }
        })

      }).catch((err) => {
        this.errorMessageRegister=err.message
        console.log('err.message',err.message)
      })
      //Make user an Admin
        // const functions = getFunctions()
        // const addAdminRole = httpsCallable(functions, 'addAdminRole')
        // addAdminRole({ email:credentials.email })
        //  .then((result) => {
        //   console.log(result,'result')
        //  })
    },
    getDoctors(clinicId) {
      // Set doctors array
      getDoctorsSnapshot = onSnapshot(doc(db, 'users', clinicId), (doc) => {
        const doctorsData = doc.data().doctors
        // Check if doctorsData is an array
        if (Array.isArray(doctorsData)) {
          // If it's an array, use it directly
          this.processDoctorsData(doctorsData)
        } else if (doctorsData) {
          // If it's not an array but has data, convert it to an array
          const doctorsArray = Object.values(doctorsData)

          // Process the doctors array
          this.storePatients.getPatientsAll(doctorsArray)

          doctorsArray.forEach((doctor, index) => {
            doctor.class = 'split' + (index + 1)
            doctor.color = '#5a4d4dd4'
          })

          this.doctors = doctorsArray;
          console.log(doctorsData, 'sssz');
        } else {
          // If doctorsData is null or undefined
          this.doctors = [] // Assign an empty array or handle as needed
        }
      });
    },
    loginUser(credentials){
      signInWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const user = userCredential.user
        this.errorMessageLogin=''
        //console.log('user',user)
      }).catch((err) => {
        this.errorMessageLogin=err.message
       console.log('err',err.message)
      })
    },
    logoutUser(){
      signOut(auth).then(() => {
        this.storePatients.clearPatients()
        this.storeAppointments.clearAppointments()
        this.storePayments.clearPayments()
        this.storeInvoices.clearInvoices()
        this.storeWorks.clearWorks()
       console.log('user singed out')
      }).catch((error) => {
   //   console.log(error.message)
      })
    }
  }
})

