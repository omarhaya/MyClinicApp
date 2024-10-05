import { defineStore } from 'pinia'
import { getFirestore, deleteField,
  collection, onSnapshot,doc,
  setDoc,deleteDoc,updateDoc,
  query,orderBy,collectionGroup, where,getDocs,writeBatch
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import { getFunctions, httpsCallable } from "firebase/functions"

let patientsCollectionRef
let patientsCollectionQuery
let getPatientsSnapshot=null


export const useStorePatients = defineStore('storePatients', {
  state: () => {
    return {
       patients:[],
       loading:false,
       loadingAppointments:false,
       doctors:[],
       storeAuth:useStoreAuth(),
       addPatientModal:false,

    }
  },

  actions:{
      init(){
         const storeAuth=useStoreAuth()
         patientsCollectionRef = collection(db, 'users',storeAuth.user.uid,'patients')
         patientsCollectionQuery = query(patientsCollectionRef, orderBy('dateUnix', 'desc'))
        //  this.getPatients()
      },
      async getPatients() {
        this.loading=true
          getPatientsSnapshot=onSnapshot(patientsCollectionQuery, (querySnapshot) => {
          const patients=[]
          querySnapshot.forEach((doc) => {
          let patient={
            patientId:doc.id,
            details:doc.data().details,
            dateUnix:doc.data().dateUnix,
            namef:doc.data().namef,
            age:doc.data().age,
            gender:doc.data().gender,
            phone:doc.data().phone,
          }
          patients.push(patient)
          })
          this.patients=patients
       //indexing
          this.patients.forEach((patient, index) => {
          patient.index = this.patients.length - index})
       this.loading=false
        },error=>{
          console.log('error',error.message)
      })
      console.log(this.patients,'PA')
     },
    //  async updatePatientsIdToPatientId(doctors) {
    //   try {
    //     const doctorsIds = doctors.map(doctor => doctor.doctorId);

    //     const patientsCollectionAllRef = collectionGroup(db, 'patients');
    //     const patientsCollectionAllQuery = query(patientsCollectionAllRef, where('uid', 'in', doctorsIds), orderBy('date', 'desc'));

    //     const snapshot = await getDocs(patientsCollectionAllQuery);

    //     const batch =  writeBatch(db) // Use the batch function from Firestore

    //     snapshot.forEach(doc => {
    //       const patientData = doc.data();

    //       if (patientData) {
    //         const updatedData = {
    //           ...patientData,
    //           // id: patientData.id,
    //           patient: deleteField() // Remove the 'id' field
    //         };

    //         const patientRef = doc.ref;
    //         batch.update(patientRef, updatedData);
    //       }
    //     });

    //     await batch.commit();
    //     console.log('Updated patient IDs successfully');
    //   } catch (error) {
    //     console.error('Error updating patient IDs:', error);
    //   }
    // },


      async getPatientsAll(doctors) {
        this.loading=true
        const doctorsIds=doctors.map(doctor => doctor.doctorId)
        console.log(doctors,'doctorsIds')
        const patientsCollectionAllRef = collectionGroup(db, 'patients')
        const patientsCollectionAllQuery = query(patientsCollectionAllRef, where('uid', 'in', doctorsIds), orderBy('dateUnix', 'desc'))

          getPatientsSnapshot=onSnapshot(patientsCollectionAllQuery, async (querySnapshot) => {
          const patients=[]
          querySnapshot.forEach((doc) => {
          let patient={
            patientId:doc.id,
            details:doc.data().details,
            dateUnix:doc.data().dateUnix,
            namef:doc.data().namef,
            age:doc.data().age,
            gender:doc.data().gender,
            phone:doc.data().phone
          }
          patients.push(patient)
          })
          this.patients=patients
          console.log(patients,'hello')

             //indexing
             this.patients.forEach((patient, index) => {
              patient.index = this.patients.length - index})
              // update Patients Array
              // await this.updatePatientsIdToPatientId(doctors);
        },error=>{
          console.log('error',error.message)
      })
      this.loading=false
   },

     clearPatients(){
       this.patients=[]
       console.log(this.patients,'cleared')
       if (getPatientsSnapshot) getPatientsSnapshot() //unsubscribe from any active listener
     },
      async addPatient (newPatientDetails) {
        let currentDate = new Date().getTime(),
        dateUnix = currentDate.toString()
      await setDoc(doc(patientsCollectionRef, newPatientDetails.patientId), {
        namef: newPatientDetails.namef,
        age: newPatientDetails.age,
        gender: newPatientDetails.gender,
        phone: newPatientDetails.phone,
        patientId:newPatientDetails.patientId,
        details:'wewew',
        dateUnix,
        uid:this.storeAuth.user.uid,
      })
     },


      async deletePatient(idToDelete) {
        await deleteDoc(doc(patientsCollectionRef, idToDelete))
        //  this.patients= this.patients.filter(patient=>{return patient.id !== idToDelete})
     },
     async getPatientsID(){
      const storeAuth=useStoreAuth()
      const functions = getFunctions()
      const uid = storeAuth.user.uid
      const getPatientsFunction=httpsCallable(functions,'getPatients_v1')
      getPatientsFunction({uid:uid})
      .then((result)=>{
        console.log('result',result)
      })
     },

      async updatePatient(patientId,Patient){
        await updateDoc(doc(patientsCollectionRef, patientId), {
          namef:Patient.namef,
          age:Patient.age,
          phone:Patient.phone,
          gender:Patient.gender,
          updatedDate:Date.now()
        })
      // let index = this.patients.findIndex(patient=>  patient.id === id)
      // this.patients[index].details = details
     },

  },


  getters:{
    getPatientNameF: (state)=>{
     return (patientId) =>{
      return state.patients.filter(patient=> patient.patientId===patientId)[0].namef

     }
    },
    getPatient: (state) => {
      return (patientId) => {
        if (state.loading) {
          console.log('Loading patients, please wait...');
          return null; // Return null or a placeholder value while loading
        }
        console.log(state.patients, 'state.patients.filter(patient=> patient.patientId===patientId)[0]');
        return state.patients.filter((patient) => patient.patientId === patientId)[0];
      };
    },
    totalPatientsCount:(state) => {
        return state.patients.length
    },
    totalCharacterCount:(state) =>{
      let count = 0
      state.patients.forEach(patient =>{
        count += patient.details.length
      })
      return count
    }

  }

})

