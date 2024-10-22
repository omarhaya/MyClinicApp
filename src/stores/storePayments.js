import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,orderBy,addDoc,updateDoc,writeBatch,getDocs,collectionGroup,deleteField,deleteDoc,doc,
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
import {useDynamicSort} from 'src/use/useDynamicSort'
import { useStoreWorks } from './storeWorks'
import {modalController, } from '@ionic/vue';
import { currency } from 'maz-ui'
import { computed } from 'vue'
import { Platform } from 'quasar';

let paymentsCollectionRef
let paymentsCollectionQuery
let getPaymentsSnapshot=null

export const useStorePayments= defineStore('storePayments', {
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
    })
    return {
       loadingModal:false,
       invoicePayments:[],
       patient:null,
       appointmentDate:null,
       paymentInvoices:null,
       payments:[],
       dayPayments:[],
       editPayment: null,
       paymentModal: null,
       selectedDate:today(),
       storeWorks:useStoreWorks(),
       storeAuth:useStoreAuth(),
       loading:null,
       currentPaymentArray:[],
       mobile,
       loadingPayments:null,
    }
  },

  actions:{
    init(){
      if(this.storeAuth.role.doctor&&this.storeAuth.role.clinicId!==''){
        paymentsCollectionRef = collection(db, 'users',this.storeAuth.role.clinicId,'payments')
        }
        else {paymentsCollectionRef = collection(db, 'users',this.storeAuth.user.uid,'payments')}
   },
   TOGGLE_PAYMENT(paymentId) {
    if (!this.mobile){this.paymentModal = !this.paymentModal}
    if (paymentId) {
      // Search in all dayPayments by iterating over each date
    this.currentPaymentArray = Object.keys(this.dayPayments).reduce((acc, date) => {
      const foundPayment = this.dayPayments[date].find(payment => payment.paymentId === paymentId);
      return foundPayment ? foundPayment : acc;  // If found, return it, otherwise keep searching
    }, null);

    // If payment is not found in dayPayments, search in invoicePayments
    if (!this.currentPaymentArray) {
      this.currentPaymentArray = this.invoicePayments.find(doc => doc.paymentId === paymentId);
    }

    // If payment is not found in invoicePayments, search in payments
    if (!this.currentPaymentArray) {
      this.currentPaymentArray = Object.keys(this.payments).reduce((acc, patientId) => {
        const foundPayment = this.payments[patientId].find(payment => payment.paymentId === paymentId);
        return foundPayment ? foundPayment : acc;  // If found, return it, otherwise keep searching
      }, null);
    }

    // If no payment is found in any of the sources, you can handle adding a new payment or return null.
    if (!this.currentPaymentArray) {
      console.log("Payment not found in dayPayments, invoicePayments, or payments.");
      // Optionally, handle the case where no payment is found, e.g., add a new payment
    }
      // this.currentPaymentArray.workItemList=this.storeWorks.invoiceWorks[invoiceId]
      console.log(this.currentPaymentArray,'currentPayment')
    }
  },
  CLEAR_DATA(){
    this.paymentInvoices=[]
    this.patient=null
    this.editPayment=null
  },
  async updatePayments() {
    try {
      // const doctorsIds = doctors.map(doctor => doctor.doctorId);
      const paymentsCollectionAllRef = collectionGroup(db, 'payments');
      const paymentsCollectionAllQuery = query(paymentsCollectionAllRef, );
      const snapshot = await getDocs(paymentsCollectionAllQuery);

      const batch =  writeBatch(db) // Use the batch function from Firestore

      snapshot.forEach(doc => {
        const paymentData = doc.data();

        if (paymentData) {
          const updatedData = {
            ...paymentData,
            patientId:paymentData.clientId,
            // patientDetails:paymentData.clientDetails,
            // id: patientData.id,
            clientId: deleteField(), // Remove the 'id' field
            // clientDetails: deleteField() // Remove the 'id' field
          };
          const paymentRef = doc.ref;
          batch.update(paymentRef, updatedData);
        }
      });

      await batch.commit();
      console.log('Updated invoice data successfully');
    } catch (error) {
      console.error('Error updating invoice data:', error);
    }
  },async getPaymentsForInvoice(invoiceId) {
    try {
      this.loading = true; // Set loading state to true when data fetching begins
      console.log(this.loading, 'paymentsloading');


      const paymentsQuery = query(paymentsCollectionRef, where('invoiceId', '==', invoiceId));

      // Set up a real-time listener for payments
      this.unsubscribe = onSnapshot(paymentsQuery, (querySnapshot) => {
        const payments = [];

        querySnapshot.forEach((doc) => {
          let payment = {
            paymentId: doc.id,
            paid: doc.data().paid,
            date: doc.data().date,
            workId: doc.data().workId,
            currency: doc.data().currency,
            dateUnix: doc.data().dateUnix,
          };
          payments.push(payment);
        });

        this.invoicePayments[invoiceId] = payments;
        console.log(this.invoicePayments[invoiceId], 'Updated payments');

        // Optionally call other methods here if needed
        this.storeWorks.getWorksForInvoice(invoiceId);

        this.loading = false; // Clear loading state after data is fetched
      }, (error) => {
        console.error("Error listening for payments:", error);
        this.loading = false; // Clear loading state if an error occurs
      });

      // Clean up the listener if needed (for example, in component unmount)
      // this.unsubscribe = null;
    } catch (error) {
      console.error("Error fetching payments:", error);
      this.loading = false; // Clear loading state if an error occurs
    }
  },
  async deletePayment(paymentId) {
    try {
      await deleteDoc(doc(paymentsCollectionRef, paymentId));
      console.log('Payment successfully deleted');
    } catch (error) {
      console.error('Error deleting payment:', error);
      // Handle error here
    }
  },
  async getdayPayments(date) {
    this.loading=true
    console.log(date,paymentsCollectionRef,'getdaypayments')
   const paymentsCollectionQuery = query(paymentsCollectionRef,where("date", "==", date));
   getPaymentsSnapshot=onSnapshot(paymentsCollectionQuery, (querySnapshot) => {
     const payments=[]
     querySnapshot.forEach((doc) => {
     let payment={
       paymentId:doc.id,
       invoiceId:doc.data().invoiceId,
       paid:doc.data().paid,
       dateUnix:doc.data().dateUnix,
       workId:doc.data().workId,
       patientId:doc.data().patientId,
       currency:doc.data().currency,
     }
     this.getPaymentsForInvoice(payment.invoiceId)
     this.storeWorks.getWork(payment.workId)
     payments.push(payment)
     })
     this.dayPayments[date]=payments
 })
 this.loading=false

},
async getIntervalPayments(startDate, endDate) {
  const startDateUnix = Math.floor(new Date(startDate).getTime() / 1000).toString();
  // Adjust endDate to be one day after the provided endDate
  let endDateObject = new Date(endDate);
  endDateObject.setDate(endDateObject.getDate() + 1); // Adding one day
  const endDateUnix = Math.floor(endDateObject.getTime() / 1000).toString();

  this.loading = true;

  const paymentsCollectionQuery = query(
    paymentsCollectionRef,
    where('dateUnix', '>=', startDateUnix),
    where('dateUnix', '<', endDateUnix) // Use '<' to include until the day before the next day
  );

  getPaymentsSnapshot = onSnapshot(paymentsCollectionQuery, (querySnapshot) => {
    const payments = [];
    querySnapshot.forEach((doc) => {
      let payment = {
        paymentId: doc.id,
        invoiceId: doc.data().invoiceId,
        paid: doc.data().paid,
        dateUnix: doc.data().dateUnix,
        workId: doc.data().workId,
        currency: doc.data().currency,
        pateintId:doc.data().patientId,
      };

      //  this.getPaymentsForInvoice(payment.invoiceId)
      //  this.storeWorks.getWork(payment.workId)
      payments.push(payment);
    });
    console.log(payments, 'intervalpayments!!');
    this.dayPayments[this.selectedDate] = payments;
  });
  this.loading = false;
},
async getPayments(patientId) {
  this.loadingPayments=true
 const paymentsCollectionQuery = query(paymentsCollectionRef,where("patientId", "==", patientId),orderBy('dateUnix','desc'));
 getPaymentsSnapshot=onSnapshot(paymentsCollectionQuery, (querySnapshot) => {
   const payments=[]
   querySnapshot.forEach((doc) => {
   let payment={
     paymentId:doc.id,
     invoiceId:doc.data().invoiceId,
     paid:doc.data().paid,
     dateUnix:doc.data().dateUnix,
     workId:doc.data().workId,
     patientId:doc.data().patientId,
   }
   this.getPaymentsForInvoice(payment.invoiceId)
   this.storeWorks.getWork(payment.workId)
   payments.push(payment)
   })
   this.payments[patientId]=payments
   console.log(this.payments[patientId],'paymentssss')
})
this.loadingPayments=false
},
    async addPayment (work) {
      try {
        this.loadingModal = true
        let paid = work.paymentItemList.paid.replace(/\,/g,'') || 0
        let currentDate = new Date().getTime(),
        dateUnix = currentDate.toString()
        let date=today()
        const addDocPromise = addDoc(paymentsCollectionRef, {
          paid,
          currency:work.currency,
          invoiceId:work.invoiceId,
          workId:work.workId,
          dateUnix,
          date,
          doctorId:work.doctor.doctorId,
          patientId:work.patientDetails.patientId,
          uid:this.storeAuth.user.uid,
        })
        // Set a timeout to check if the Firestore operation completes within a certain time
        const timeoutDuration = 5000; // Timeout duration in milliseconds (adjust as needed)
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(false), timeoutDuration);
        });

        // Wait for either the Firestore write operation or the timeout to complete
        const isOperationCompleted = await Promise.race([addDocPromise, timeoutPromise]);

        if (isOperationCompleted === false) {
          // If the timeout occurs and the operation hasn't completed, treat it as an error
          throw new Error('Timeout: Unable to add invoice');
        }

        // If the operation completes successfully or within the timeout, proceed to toggle the payment
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        if(this.paymentModal)  this.TOGGLE_PAYMENT();
        this.moreDataAvailable = true; // If the payment is added, set moreDataAvailable to true

      } catch (error) {
        console.error('Error adding invoice:', error);

        // Handle error here
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        if(this.paymentModal)  this.TOGGLE_PAYMENT(); // Ensure TOGGLE_PAYMENT is called even in offline scenarios

      }
    },
    async updatePayment (work) {
      try {
        this.loadingModal = true;

        // Format the payment amount (removing commas)
        let paid = work.paymentItemList.paid.replace(/\,/g,'') || 0;
        let currentDate = new Date().getTime(),
        updatedDateUnix = currentDate.toString();

        // Create a document reference for the paymentId
        const paymentDocRef = doc(paymentsCollectionRef, this.currentPaymentArray.paymentId); // Refers to existing payment

        // Update the payment document with new data
        const updateDocPromise = updateDoc(paymentDocRef, {
          paid,
          currency: work.currency,
          invoiceId: work.invoiceId,
          workId: work.workId,
          updatedDateUnix,
          doctorId: work.doctor.doctorId,
          patientId: work.patientDetails.patientId,
          updatedUid: this.storeAuth.user.uid,
        });

        // Set a timeout to check if the Firestore operation completes within a certain time
        const timeoutDuration = 5000; // Timeout duration in milliseconds (adjust as needed)
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(false), timeoutDuration);
        });

        // Wait for either the Firestore write operation or the timeout to complete
        const isOperationCompleted = await Promise.race([updateDocPromise, timeoutPromise]);

        if (isOperationCompleted === false) {
          // If the timeout occurs and the operation hasn't completed, treat it as an error
          throw new Error('Timeout: Unable to update payment');
        }

        // If the operation completes successfully or within the timeout, proceed to toggle the payment
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        if (this.paymentModal) this.TOGGLE_PAYMENT();
        this.moreDataAvailable = true; // Update this flag as needed

      } catch (error) {
        console.error('Error updating payment:', error);

        // Handle error here
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        if (this.paymentModal) this.TOGGLE_PAYMENT(); // Ensure TOGGLE_PAYMENT is called even in error scenarios
      }
    },
    clearPayments(){
      this.payments=[]
      this.invoicePayments=[]
      console.log( this.payments,this.invoicePayments,'cleared')
      if (getPaymentsSnapshot) getPaymentsSnapshot() //unsubscribe from any active listener
    },

    // async deletePayment(idToDelete) {

    //   console.log(idToDelete)
    //   await deleteDoc(doc(paymentsCollectionRef, idToDelete))

    // },
    // async updatePayment(id,payment){
    //   await updateDoc(doc(paymentsCollectionRef, id), {
    //     namef:payment.namef,
    //     age:payment.age,
    //     phone:payment.phone,
    //     gender:payment.gender,
    //     updatedDate:Date.now()
    //   })
    // },
    // async completePayment(payment){
    //   await updateDoc(doc(paymentsCollectionRef, payment.id), {
    //     completed:!payment.completed,
    //   })
    // },
    // async dropPayment(payment){
    //   await updateDoc(doc(paymentsCollectionRef, payment.id), {
    //     time:payment.time,
    //     doctor:payment.doctor,
    //   })
    // }
  },
  getters:{

    }

})

