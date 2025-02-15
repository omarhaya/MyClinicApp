import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,orderBy,addDoc,deleteDoc,doc,updateDoc,limit,getDocs,collectionGroup,writeBatch,deleteField
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import { uid } from 'uid'
import { getFunctions, httpsCallable } from "firebase/functions"
import { useStoreWorks } from './storeWorks'
import { useStorePayments } from './storePayments'
import { reactive } from 'vue'
import {modalController, } from '@ionic/vue';

let invoicesCollectionRef
let invoicesCollectionQuery
let getInvoicesSnapshot=null

export const useStoreInvoices = defineStore('storeInvoices', {
  state: () => {
    return {
      invoiceData: [],
      patientInvoices:[],
      invoiceModal: null,
      teethModals:[],
      modalActive: null,
      loadingModal:null,
      currentInvoiceArray: null,
      editInvoice: null,
      paymentItemList:[],
      workItemList:[],
      loading:null,
      currencies:['IQD','$'],
      storeWorks:useStoreWorks(),
      storePayments:useStorePayments(),
      storeAuth:useStoreAuth(),
      limit:10,
      moreDataAvailable: true // Flag to track if more data is available
    }
  },

  actions:{
    init(){
      if(this.storeAuth.role.doctor&&this.storeAuth.role.clinicId!==''){
      invoicesCollectionRef = collection(db, 'users',this.storeAuth.role.clinicId,'invoices')
      }
      else {invoicesCollectionRef = collection(db, 'users',this.storeAuth.user.uid,'invoices')
     }
   },
    TOGGLE_INVOICE() {
      this.invoiceModal = !this.invoiceModal
    },
    CLEAR_DATA(){
      this.paymentItemList=[]
      this.workItemList=[]
      this.editInvoice=false
    },
    TOGGLE_TEETHSELECTION(index) {
      this.teethModals[index] = !this.teethModals[index];
      console.log(this.workItemList,'iiiiiiii')
    },
    SET_INVOICE_DATA(payload) {
      this.invoiceData.push(payload)
    },
    INVOICES_LOADED() {
      this.invoicesLoaded = true
    },
    // SET_PATIENT_INVOICES(clientId){
    //   console.log(clientId,'clientId')
    //  this.patientInvoices=this.GET_PATIENT_INVOICES(clientId)

    //  },
    async updateInvoices() {
      try {
        // const doctorsIds = doctors.map(doctor => doctor.doctorId);
        const invoicesCollectionAllRef = collectionGroup(db, 'invoices');
        const invoicesCollectionAllQuery = query(invoicesCollectionAllRef, );

        const snapshot = await getDocs(invoicesCollectionAllQuery);

        const batch =  writeBatch(db) // Use the batch function from Firestore

        snapshot.forEach(doc => {
          const invoiceData = doc.data();

          if (invoiceData) {
            const updatedData = {
              ...invoiceData,
              deletedDateUnix:null,
              // patientName:invoiceData.clientName,
              // // id: patientData.id,
              // clientId: deleteField(), // Remove the 'id' field
              // clientName: deleteField() // Remove the 'id' field
              deleted:deleteField()
            };
            const invoiceRef = doc.ref;
            batch.update(invoiceRef, updatedData);
          }
        });

        await batch.commit();
        console.log('Updated invoice data successfully');
      } catch (error) {
        console.error('Error updating invoice data:', error);
      }
    },
    SET_CURRENT_INVOICE(invoiceId) {
      this.loading=true
      const q =  query(invoicesCollectionRef,where('invoiceId' ,'==',invoiceId))
    onSnapshot(q, (querySnapshot)  => {
    querySnapshot.forEach((doc) => {
      const invoice = {
            invoiceId: doc.data().invoiceId,
            patientName: doc.data().patientName,
            patientId: doc.data().patientId,
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            invoiceDraft: doc.data().invoiceDraft,
          }
          this.invoiceData[invoiceId]=invoice
          this.storePayments.getPaymentsForInvoice(invoiceId)
       })
     })
     this.loading=false
    },
    TOGGLE_EDIT_INVOICE(){
      this.editInvoice = !this.editInvoice;
    },
    /*
    Actions
    */

    async GET_INVOICES()  {
      console.log('LOADING hii')
      this.loading=true
      const invoicesCollectionQuery =  query(invoicesCollectionRef,orderBy("invoiceDateUnix","desc"),this.limit ? limit(this.limit) : undefined)
      getInvoicesSnapshot=onSnapshot(invoicesCollectionQuery, (querySnapshot) => {
    const fbInvoices = []
    querySnapshot.forEach((doc) => {
      const invoice = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            // workItemList: doc.data().workItemList,
            patientName: doc.data().patientName,
            patientId: doc.data().patientId,
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            // paymentTerms: doc.data().paymentTerms,
            // paymentDueDateUnix: doc.data().paymentDueDateUnix,
            // paymentDueDate: doc.data().paymentDueDate,
            // productDescription: doc.data().productDescription,
            // paymentItemList: doc.data().paymentItemList,
            // invoiceTotal: doc.data().invoiceTotal,
            // invoicePending: doc.data().invoicePending,
            invoiceDraft: doc.data().invoiceDraft,
            // invoicePaid: doc.data().invoicePaid,
          }
          fbInvoices.push(invoice)
       })
      //  if (querySnapshot.size < this.limit) {
      //   // If the number of retrieved documents is less than the requested limit,
      //   // it means no more data is available
      //   this.moreDataAvailable = false;
      // } else {
      //   this.limit += 2; // Increase the limit for the next query
      // }
        // Fetch payments and works for each invoice
        fbInvoices.forEach(invoice=>{
          this.storePayments.getPaymentsForInvoice(invoice.invoiceId)
        }
        )
       this.invoiceData = fbInvoices
       console.log(this.invoiceData,'LOADED')
     })
     this.loading=false

    },
    async SET_PATIENT_INVOICES(patientId, invoiceId) {
      try {
        this.loading = true; // Set loading state to true when data fetching begins
        console.log(this.loading, 'loading');

        const invoicesCollectionQuery = query(invoicesCollectionRef, where('patientId', '==', patientId), where("deletedDateUnix", "==", null), orderBy('invoiceDateUnix', 'desc'));

        // Await for the snapshot to get data
        const querySnapshot = await getDocs(invoicesCollectionQuery);

        const fbInvoices = [];
        querySnapshot.forEach((doc) => {
          const invoice = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            patientName: doc.data().patientName,
            patientId: doc.data().patientId,
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            invoiceDraft: doc.data().invoiceDraft,
          };
          fbInvoices.push(invoice);
        });
        // Fetch payments and works for each invoice
        for (const invoice of fbInvoices) {
          await this.storePayments.getPaymentsForInvoice(invoice.invoiceId);
        }

        this.patientInvoices = fbInvoices;
        console.log(this.patientInvoices, 'fetched invoices');

        // Update payment invoices if invoiceId is provided
        if (invoiceId) {
          console.log(invoiceId, 'invoiceId provided');
          const paymentsInvoices = this.GET_PATIENT_INVOICES(patientId).filter(invoice => invoice.invoiceId === invoiceId);

          const updatedPaymentInvoices = paymentsInvoices.map(paymentInvoice => {
            const updatedWorks = paymentInvoice.works.map(work => {
              if (parseInt(work.paidPercentage) !== 100) {
                return { ...work, selected: true };
              }
              return work;
            });
            return { ...paymentInvoice, works: updatedWorks };
          });

          this.storePayments.paymentInvoices = reactive(updatedPaymentInvoices);
        }

        this.loading = false; // Clear loading state when data fetching completes
        console.log(this.loading, 'loading');
      } catch (error) {
        console.error("Error fetching invoices:", error);
        this.loading = true; // Clear loading state if an error occurs
      }
    },
    async GET_INVOICES_NEXT()  {

      console.log('LOADINGNEXT')
      this.loading=true
      // if (!this.moreDataAvailable) {
      //   // If no more data is available, stop fetching
      //   this.loading=false
      //   return
      // }
      const invoicesCollectionQuery = query(invoicesCollectionRef,orderBy("invoiceDateUnix","desc"),where("deletedDateUnix", "==", null),this.limit ? limit(this.limit) : undefined)
      getInvoicesSnapshot=onSnapshot(invoicesCollectionQuery, (querySnapshot) => {
    const fbInvoices = []
    querySnapshot.forEach((doc) => {
      const invoice = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            // workItemList: doc.data().workItemList,
            patientName: doc.data().patientName,
            patientId: doc.data().patientId,
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            // paymentTerms: doc.data().paymentTerms,
            // paymentDueDateUnix: doc.data().paymentDueDateUnix,
            // paymentDueDate: doc.data().paymentDueDate,
            // productDescription: doc.data().productDescription,
            // paymentItemList: doc.data().paymentItemList,
            // invoiceTotal: doc.data().invoiceTotal,
            // invoicePending: doc.data().invoicePending,
            invoiceDraft: doc.data().invoiceDraft,
            // invoicePaid: doc.data().invoicePaid,
            deleted:doc.data().deleted,
          }
          fbInvoices.push(invoice)
       })
       if (querySnapshot.size < this.limit) {
        // If the number of retrieved documents is less than the requested limit,
        // it means no more data is available
        this.moreDataAvailable = false;
      } else {
        this.limit += 4; // Increase the limit for the next query
      }
        // Fetch payments and works for each invoice
        fbInvoices.forEach(invoice=>{
          this.storePayments.getPaymentsForInvoice(invoice.invoiceId)
        }
        )
       this.invoiceData = fbInvoices

     })
     console.log(this.invoiceData,'invoiceData')
     this.loading=false
    },
    async DELETE_INVOICE(docId) {
      console.log(docId,'deleting')
      await updateDoc(doc(invoicesCollectionRef, docId), {
        // invoicePaid: false,
        // invoicePending: true,
        deleted: true,
        deletedDateUnix:Date.now(),
      })
      // await deleteDoc(doc(invoicesCollectionRef, docId))
    },
    // async UPDATE_STATUS_TO_PAID(docId) {
    //   await updateDoc(doc(invoicesCollectionRef, docId), {
    //     invoicePaid: true,
    //     invoicePending: false,
    //     invoiceDraft: false,
    //   })
    // },
    async UPDATE_STATUS_TO_PENDING(docId) {
      await updateDoc(doc(invoicesCollectionRef, docId), {
        // invoicePaid: false,
        // invoicePending: true,
        invoiceDraft: false,
      })
    },

    // Add Invoice
    // async addInvoice (data) {
    //   this.loading=true

    // return new Promise((res, rej) => {
    //   try {
    //     // Capture the document, which will be a promise when the document gets written to the backend
    //     const document =    addDoc(invoicesCollectionRef, {
    //       invoiceId: data.invoiceId,
    //       clientName: data.clientDetails.namef,
    //       clientId:data.clientDetails.id,
    //       invoiceDate: data.invoiceDate,
    //       invoiceDateUnix: data.invoiceDateUnix,
    //       // paymentItemList: this.paymentItemList,
    //       // workItemList:this.workItemList,
    //       // invoicePending: data.invoicePending,
    //       invoiceDraft: data.invoiceDraft,
    //       // invoicePaid: null,
    //       uid:this.storeAuth.user.uid,
    //     })

    //     // Capture the snapshot, which will fire when the document gets written to the cache
    //     const unsubscribe = onSnapshot(invoicesCollectionRef, () => {
    //       // Unsubscribe from the snapshot so it doesn't continue to fire
    //       unsubscribe();
    //       // Resolve the promise with an object with the document (so `await`ing the promise won't also `await` the backend write)
    //       res({ document });
    //     });
    //   } catch (e) {
    //     // Reject if there's an error
    //     rej(e);
    //   }
    // });
    // this.loading=false
    // this.TOGGLE_INVOICE()
    // this.moreDataAvailable=true
    // return new Promise((resolve, reject) => {
    //   try {
    //     // Emulate adding the document to Firestore
    //     const addDocPromise = new Promise((res) => {
    //       // Simulate a delay to emulate Firestore write
    //       setTimeout(async () => {
    //         // Emulate adding the document (for demonstration purposes, this is where you'd usually use addDoc)
    //         // Replace this section with your actual Firestore addDoc logic
    //         // const document = await addDoc(r, v);

    //         // Simulating the document being added to the backend
    //         const document = { data: v }; // Simulated document data after write

    //         // Resolve the addDocPromise with the added document (simulated)
    //         res(document);
    //       }, 1000); // Simulated delay of 1 second for write
    //     });

    //     const unsubscribe = onSnapshot(q, () => {
    //       unsubscribe();
    //       addDocPromise.then((document) => {
    //         // Resolve the main promise with the added document
    //         resolve({ document });
    //       });
    //     });
    //   } catch (error) {
    //     reject(error);
    //   }
    // });
    // },
    async addInvoice(data) {
      try {
        this.loadingModal = true;
        const addDocPromise = addDoc(invoicesCollectionRef, {
          invoiceId: data.invoiceId,
          patientName: data.patientDetails.namef,
          patientId:data.patientDetails.patientId,
          invoiceDate: data.invoiceDate,
          invoiceDateUnix: data.invoiceDateUnix,
          // paymentItemList: this.paymentItemList,
          // workItemList:this.workItemList,
          // invoicePending: data.invoicePending,
          invoiceDraft: data.invoiceDraft,
          deletedDateUnix:null,
          // invoicePaid: null,
          uid:this.storeAuth.user.uid,
        });

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

        // If the operation completes successfully or within the timeout, proceed to toggle the invoice
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        this.invoiceModal=false;
        this.CLEAR_DATA()
        this.moreDataAvailable = true; // If the invoice is added, set moreDataAvailable to true

      } catch (error) {
        console.error('Error adding invoice:', error);

        // Handle error here
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        this.invoiceModal=false; // Ensure TOGGLE_INVOICE is called even in offline scenarios
        this.CLEAR_DATA()

      }
    },
    async updateInvoice(data){
      this.loading=true
      await updateDoc(doc(invoicesCollectionRef, data.docId), {
        // invoiceId: uid(6),
        typeOfWork: data.work.workType,
        billerCity: data.billerCity,
        billerZipCode: data.billerZipCode,
        billerCountry: data.billerCountry,
        clientName: data.clientDetails.namef,
        clientId:data.clientDetails.id,
        clientEmail: data.clientEmail,
        clientCity: data.clientCity,
        clientCountry: data.clientCountry,
        invoiceDate: data.invoiceDate,
        invoiceDateUnix: data.invoiceDateUnix,
        paymentTerms: data.paymentTerms,
        paymentDueDate: data.paymentDueDate,
        paymentDueDateUnix: data.paymentDueDateUnix,
        productDescription: data.productDescription,
        paymentItemList: this.paymentItemList,
        invoiceTotal: data.invoiceTotal,
        workDescription: data.workDescription,
        doctorTreated: data.doctorTreated,
        updatedDateUnix:Date.now(),
        updatedDate: invoiceDate.value = new Date().toLocaleDateString("en-us", { year: "numeric", month: "short", day: "numeric" })
      })
      this.loading=false
      this.TOGGLE_INVOICE()
    },
    clearInvoices(){
      this.invoiceData=[]
      console.log(this.invoiceData,'cleared')
      if (getInvoicesSnapshot) getInvoicesSnapshot() //unsubscribe from any active listener
    },
  },


  getters:{
    GET_CURRENT_INVOICE: (state)=>{
      return (patientId) =>{
       return state.invoiceData.filter(invoice=> invoice.invoiceId===patientId)[0]
      }
     },
     GET_PATIENT_INVOICES: (state)=>{
      return (patientId) =>{
       const patientInvoices=state.patientInvoices.filter(invoice=> invoice.patientId===patientId)

       patientInvoices.forEach(patientInvoice=>{patientInvoice.works=state.storeWorks.invoiceWorks[patientInvoice.invoiceId]
        console.log(patientInvoice.works,'XXXX')
      })
       return patientInvoices
      }
     },
  }

})

