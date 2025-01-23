import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,orderBy,setDoc,deleteDoc,doc,updateDoc,limit,getDocs,collectionGroup,writeBatch,deleteField
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import { uid } from 'uid'
import { getFunctions, httpsCallable } from "firebase/functions"
import { useStoreWorks } from './storeWorks'
import { useStorePayments } from './storePayments'
import { reactive,computed } from 'vue'
import {modalController, } from '@ionic/vue';
import { Platform } from 'quasar';
import { useStorePatients } from './storePatients'


let invoicesCollectionRef
let invoicesCollectionQuery
let getInvoicesSnapshot=null

export const useStoreInvoices = defineStore('storeInvoices', {

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
      invoiceData: [],
      currentInvoice:[],
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
      storePatients:useStorePatients(),
      limit:10,
      moreDataAvailable: true, // Flag to track if more data is available
      mobile,
      loadingInvoices:null,
      paymentsInvoice:[],
    }
  },

  actions:{
    init(){
      if(this.storeAuth.role.doctor&&this.storeAuth.role.clinicId!==''){
      invoicesCollectionRef = collection(db, 'users',this.storeAuth.role.clinicId,'invoices')
      }
      else {invoicesCollectionRef = collection(db, 'users',this.storeAuth.user.uid,'invoices')
     }
    //  this.updateInvoices()
   },
    TOGGLE_INVOICE(invoiceId) {
      if (!this.mobile){this.invoiceModal = !this.invoiceModal}
      if (invoiceId) {
        this.currentInvoiceArray=this.invoiceData.find(doc => doc.invoiceId === invoiceId)||this.patientInvoices.find(doc => doc.invoiceId === invoiceId)||this.currentInvoice
        console.log(this.invoiceData,'currentinvoice')
      }

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
        // Reference to the invoices collection
        const invoicesCollectionAllRef = collection(db, 'users', 'e1Q5Eg5McWZjGjmuZpDeJCC3bkB3', 'invoices');
        const invoicesCollectionAllQuery = query(invoicesCollectionAllRef);

        const snapshot = await getDocs(invoicesCollectionAllQuery);

        // Initialize a batch for writing to Firestore
        const batch = writeBatch(db);

        // Iterate through each invoice
        for (const doc of snapshot.docs) {
          const invoiceData = doc.data();

          if (invoiceData) {
            // Ensure workItemList is an array (or initialize it if undefined)
            const workItemList = Array.isArray(invoiceData.workItemList) ? invoiceData.workItemList : [];

            // Query the works collection to find works with a matching invoiceId
            const worksCollectionRef = collection(db, 'users', 'e1Q5Eg5McWZjGjmuZpDeJCC3bkB3', 'works');
            const worksQuery = query(worksCollectionRef, where('invoiceId', '==', invoiceData.invoiceId)); // Match invoiceId to the invoice doc ID
            const worksSnapshot = await getDocs(worksQuery);

            // Prepare the list of works to add to the invoice
            const newWorks = worksSnapshot.docs.map(workDoc => ({
              ...workDoc.data(),
              // workId: workDoc.id, // Use the correct ID field for the work document
            }));

            // Remove duplicates based on workId
            const uniqueWorks = [
              ...workItemList,
              ...newWorks.filter(newWork => !workItemList.some(existingWork => existingWork.workId === newWork.workId))
            ];

            // Prepare the updated invoice data
            const updatedData = {
              ...invoiceData,
              workItemList: newWorks,
            };

            // Get a reference to the invoice document and add the update operation to the batch
            const invoiceRef = doc.ref;
            batch.update(invoiceRef, updatedData);
          }
        }

        // Commit the batch update
        await batch.commit();
        console.log('Updated invoice data successfully');
      } catch (error) {
        console.error('Error updating invoice data:', error);
      }
    },
    SET_CURRENT_INVOICE(invoiceId) {
      this.loading = true;
      console.log('getting invoice');
      const q = query(invoicesCollectionRef, where('invoiceId', '==', invoiceId));

      getInvoicesSnapshot = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const invoice = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            workItemList: doc.data().workItemList || [],
            patientId: doc.data().patientId || '',
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            invoiceDraft: doc.data().invoiceDraft || '',
            deleted: doc.data().deleted,
            type:doc.data().type,
          };

          const paymentsPromise = new Promise((resolve) => {
            const paymentsCollectionRef = collection(
              invoicesCollectionRef,
              invoice.invoiceId,
              "payments"
            );

            this.unsubscribe = onSnapshot(query(paymentsCollectionRef), (querySnapshot) => {
              const payments = [];
              querySnapshot.forEach((doc) => {
                payments.push({
                  paymentId: doc.id,
                  paid: doc.data().paid,
                  date: doc.data().date,
                  workId: doc.data().workId || '',
                  currency: doc.data().currency,
                  dateUnix: doc.data().dateUnix,
                  category: doc.data().category,
                  type: doc.data().type,
                });
              });

              // Set works data before resolving
              const works = this.GET_CURRENT_INVOICE_WORKS(invoice, payments);
              invoice.works = works;
              // this.storeWorks.invoiceWorks[invoice.invoiceId] = works;
              this.storePayments.invoicePayments[invoice.invoiceId] = payments;

              // Update patient name
              const patient = this.storePatients.patients.find(patient => patient.patientId === invoice.patientId);
              invoice.patientName = patient ? patient.namef : "Unknown Client";

              resolve();
            });
          });

          // Wait for payments data to be processed
          paymentsPromise.then(() => {
            this.currentInvoice = invoice;
            console.log(this.currentInvoice, 'getting invoice');
            this.storePayments.loading = false;
            this.loading = false;
          });
        });
      });
    },
    TOGGLE_EDIT_INVOICE(){
      this.editInvoice = !this.editInvoice;
    },
    /*
    Actions
    */

    // async GET_INVOICES()  {
    //   console.log('LOADINGNEXT')
    //   this.loading=true
    //   // if (!this.moreDataAvailable) {
    //   //   // If no more data is available, stop fetching
    //   //   this.loading=false
    //   //   return
    //   // }
    //   const invoicesCollectionQuery = query(invoicesCollectionRef,orderBy("invoiceDateUnix","desc"),where("deletedDateUnix", "==", null),limit(10))
    //   getInvoicesSnapshot=onSnapshot(invoicesCollectionQuery, (querySnapshot) => {
    // const fbInvoices = []
    // querySnapshot.forEach((doc) => {
    //   const invoice = {
    //         docId: doc.id,
    //         invoiceId: doc.data().invoiceId,
    //         // workItemList: doc.data().workItemList,
    //         patientName: doc.data().patientName,
    //         patientId: doc.data().patientId,
    //         invoiceDateUnix: doc.data().invoiceDateUnix,
    //         invoiceDate: doc.data().invoiceDate,
    //         // paymentTerms: doc.data().paymentTerms,
    //         // paymentDueDateUnix: doc.data().paymentDueDateUnix,
    //         // paymentDueDate: doc.data().paymentDueDate,
    //         // productDescription: doc.data().productDescription,
    //         // paymentItemList: doc.data().paymentItemList,
    //         // invoiceTotal: doc.data().invoiceTotal,
    //         // invoicePending: doc.data().invoicePending,
    //         invoiceDraft: doc.data().invoiceDraft,
    //         // invoicePaid: doc.data().invoicePaid,
    //         deleted:doc.data().deleted,
    //       }
    //       fbInvoices.push(invoice)
    //    })

    //     // Fetch payments and works for each invoice
    //     fbInvoices.forEach(invoice=>{
    //       this.storePayments.getPaymentsForInvoice(invoice.invoiceId)
    //     }
    //     )
    //    this.invoiceData = fbInvoices

    //  })
    //  console.log(this.invoiceData,'invoiceData')
    //  this.loading=false

    // },
    async GET_INVOICE_FOR_PAYMENT(invoiceId) {
      const invoicesCollectionQuery = query(invoicesCollectionRef, where("invoiceId", "==", invoiceId));

      getInvoicesSnapshot = onSnapshot(invoicesCollectionQuery, (querySnapshot) => {
        const fbInvoices = [];
        const paymentPromises = [];

        querySnapshot.forEach((doc) => {
          const invoice = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            workItemList: doc.data().workItemList || [],
            patientName: doc.data().patientName || '',
            patientId: doc.data().patientId || '',
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            invoiceDraft: doc.data().invoiceDraft || '',
            deleted: doc.data().deleted,
            type:doc.data().type,
          };

          const paymentsPromise = new Promise((resolve) => {
            const paymentsCollectionRef = collection(
              invoicesCollectionRef,
              invoice.invoiceId,
              'payments'
            );

            onSnapshot(query(paymentsCollectionRef), (querySnapshot) => {
              const payments = [];
              querySnapshot.forEach((doc) => {
                payments.push({
                  paymentId: doc.id,
                  paid: doc.data().paid,
                  date: doc.data().date,
                  workId: doc.data().workId || '',
                  currency: doc.data().currency,
                  dateUnix: doc.data().dateUnix,
                  type: doc.data().type,
                  category: doc.data().category,
                });
              });

              // Set works data before resolving
              const works = this.GET_CURRENT_INVOICE_WORKS(invoice, payments);
              invoice.works = works;
              this.storeWorks.invoiceWorks[invoice.invoiceId] = works;
              this.paymentsInvoice[invoice.invoiceId] = invoice;
              resolve();
            });
          });

          paymentPromises.push(paymentsPromise);
          fbInvoices.push(invoice);
        });

        // Wait for all payment listeners to complete
        Promise.all(paymentPromises).then(() => {
          console.log('All payments and works processed');
          this.loading = false;
        });
      });
    },
    async SET_PATIENT_INVOICES(patientId, invoiceId) {
      try {
        this.loadingInvoices = true;

        const invoicesCollectionQuery = query(
          invoicesCollectionRef,
          where('patientId', '==', patientId),
          where('deletedDateUnix', '==', null),
          orderBy('invoiceDateUnix', 'desc')
        );

        const querySnapshot = await getDocs(invoicesCollectionQuery);
        const fbInvoices = [];
        const paymentPromises = [];

        querySnapshot.forEach((doc) => {
          const invoice = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            patientName: doc.data().patientName,
            patientId: doc.data().patientId,
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            invoiceDraft: doc.data().invoiceDraft,
            workItemList: doc.data().workItemList,
          };

          const paymentsPromise = new Promise((resolve) => {
            const paymentsCollectionRef = collection(
              invoicesCollectionRef,
              invoice.invoiceId,
              'payments'
            );

            onSnapshot(query(paymentsCollectionRef), (querySnapshot) => {
              const payments = [];
              querySnapshot.forEach((doc) => {
                payments.push({
                  paymentId: doc.id,
                  paid: doc.data().paid,
                  date: doc.data().date,
                  workId: doc.data().workId,
                  currency: doc.data().currency,
                  dateUnix: doc.data().dateUnix,
                  category: doc.data().category,
                  type: doc.data().type,
                });
              });

              // Set works data before resolving
              const works = this.GET_CURRENT_INVOICE_WORKS(invoice, payments);
              invoice.works = works;

              if (invoiceId && invoice.invoiceId === invoiceId) {
                this.storePayments.paymentInvoices = reactive([{
                  ...invoice,
                }]);
              }
              console.log(this.storePayments.paymentInvoices,'paymentto')

              resolve();
            });
          });

          paymentPromises.push(paymentsPromise);
          fbInvoices.push(invoice);
        });

        // Wait for all payment listeners to complete
        await Promise.all(paymentPromises);
        this.patientInvoices = fbInvoices;
        this.loadingInvoices = false;

      } catch (error) {
        console.error('Error in SET_PATIENT_INVOICES:', error);
        this.loadingInvoices = false;
      }
    },
//     async CALCULATE_WORKS(invoice, payments) {
//       const works = invoice.workItemList || [];
//       const currencies = [...new Set(works.map((item) => item.currency))];

//       // Calculate subtotals for each currency
//       const subTotals = currencies.map((currency) => {
//         const paid = payments.reduce((accumulator, item) => {
//           if (item.currency === currency) {
//             return accumulator + Number(item.paid || 0);
//           }
//           return accumulator;
//         }, 0);

//         const paymentDates = payments.map((payment) => Number(payment.dateUnix || 0));
//         const highestPaymentDate = Math.max(...paymentDates, 0);

//         const paymentDueDates = works.map((work) => Number(work.paymentDueDateUnix || 0));
//         const highestPaymentDueDate = Math.max(...paymentDueDates, 0);

//         const subTotal = works.reduce((accumulator, item) => {
//           if (item.currency === currency) {
//             let priceValue = 0;

//             if (typeof item.price === 'string') {
//               // If it's a string, sanitize it and convert to a number
//               priceValue = Number(item.price.replace(/,/g, '') || 0);
//             } else if (typeof item.price === 'number') {
//               // If it's already a number, use it directly
//               priceValue = item.price;
//             } else {
//               // If it's neither, default to 0
//               console.warn(`Unexpected price type for item:`, item);
//             }

//             return accumulator + priceValue;
//           }
//           return accumulator;
//         }, 0);

//         const totalDiscount = works.reduce((accumulator, item) => {
//           if (item.currency === currency) {
//             let discountValue = 0;

//             if (typeof item.discount === 'string') {
//               // If it's a string, sanitize it and convert to a number
//               discountValue = Number(item.discount.replace(/,/g, '') || 0);
//             } else if (typeof item.discount === 'number') {
//               // If it's already a number, use it directly
//               discountValue = item.discount;
//             } else {
//               // If it's neither, default to 0
//               console.warn(`Unexpected discount type for item:`, item);
//             }

//             return accumulator + discountValue;
//           }
//           return accumulator;
//         }, 0);
//         const totalAmount = subTotal - totalDiscount;
//         const dueAmount = totalAmount - paid;
//         const paidPercentage = totalAmount > 0 ? (paid / totalAmount) * 100 : 0;

//         return {
//           currency,
//           subTotal,
//           totalDiscount,
//           tax: 0,
//           totalAmount,
//           paid,
//           dueAmount,
//           paidPercentage,
//           highestPaymentDate,
//           highestPaymentDueDate,
//         };
//       });

//       // Calculate overall percentage and overdue status
//       const overallPercentage = subTotals.length > 0
//         ? (subTotals.reduce((acc, subtotal) => acc + subtotal.paidPercentage, 0) / subTotals.length).toFixed(1)
//         : 0;

//       const overDue = subTotals.some((subtotal) => {
//         const currentDate = new Date().getTime();
//         return subtotal.highestPaymentDueDate && currentDate > subtotal.highestPaymentDueDate;
//       });

//       // Add payment details to works
//       const worksWithDetails = works.map((work) => {
//         const allPaid = payments.reduce((accumulator, item) => {
//           if (item.workId === work.workId) {
//             return accumulator + Number(item.paid || 0);
//           }
//           return accumulator;
//         }, 0);

//       let price = 0;
// if (typeof work.price === 'string') {
//   price = Number(work.price.replace(/,/g, '') || 0);
// } else if (typeof work.price === 'number') {
//   price = work.price;
// } else {
//   console.warn(`Unexpected price type for work:`, work);
// }

// let discount = 0;
// if (typeof work.discount === 'string') {
//   discount = Number(work.discount.replace(/,/g, '') || 0);
// } else if (typeof work.discount === 'number') {
//   discount = work.discount;
// } else {
//   console.warn(`Unexpected discount type for work:`, work);
// }

// const total = price - discount;

// // Update work object
// work.price = price;
// work.discount = discount;
//         return {
//           ...work,
//           allPaid,
//           paidPercentage: total > 0 ? ((allPaid / total) * 100).toFixed(2) : 0,
//         };
//       });

//       const updatedWorks = worksWithDetails.map(work => {
//         if (parseInt(work.paidPercentage) !== 100) {
//           return { ...work, selected: true };
//         }
//         return work;
//       });

//       updatedWorks.subTotals = subTotals;
//       updatedWorks.overallPercentage = overallPercentage;
//       updatedWorks.overDue = overDue;
//       console.log(updatedWorks,'updatedWorks')
//       return updatedWorks;
//     },

    async GET_INVOICES_NEXT() {
      console.log('LOADINGNEXT')
      this.loading = true
      const invoicesCollectionQuery = query(
        invoicesCollectionRef,
        orderBy("invoiceDateUnix", "desc"),
        where("deletedDateUnix", "==", null),
        this.limit ? limit(this.limit) : undefined
      )

      getInvoicesSnapshot = onSnapshot(invoicesCollectionQuery, (querySnapshot) => {
        const fbInvoices = []

        // Track all payment listeners to ensure data is complete
        const paymentPromises = []

        querySnapshot.forEach((doc) => {
          const invoice = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            workItemList: doc.data().workItemList || [],
            patientName: doc.data().patientName || '',
            patientId: doc.data().patientId || '',
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            invoiceDraft: doc.data().invoiceDraft || '',
            deleted: doc.data().deleted,
            type:doc.data().type,
          }

          const paymentsPromise = new Promise((resolve) => {
            const paymentsCollectionRef = collection(
              invoicesCollectionRef,
              invoice.invoiceId,
              "payments"
            )

            onSnapshot(query(paymentsCollectionRef), (querySnapshot) => {
              const payments = []
              querySnapshot.forEach((doc) => {
                payments.push({
                  paymentId: doc.id,
                  paid: doc.data().paid,
                  date: doc.data().date,
                  workId: doc.data().workId || '',
                  currency: doc.data().currency,
                  dateUnix: doc.data().dateUnix,
                  category: doc.data().category,
                  type: doc.data().type,
                })
              })

              // Set works data before resolving
              invoice.works = this.GET_CURRENT_INVOICE_WORKS(invoice, payments)
              this.storePayments.invoicePayments[invoice.invoiceId] = payments
              resolve()
            })
          })

          paymentPromises.push(paymentsPromise)
          fbInvoices.push(invoice)
        })

        // Wait for all payment listeners to complete before updating invoiceData
        Promise.all(paymentPromises).then(() => {
          this.invoiceData = fbInvoices
          console.log(this.invoiceData, 'invoiceData')

          if (querySnapshot.size < this.limit) {
            this.moreDataAvailable = false
          } else {
            this.limit += 4
          }

          this.loading = false
        })
      })
    },
    async DELETE_INVOICE(docId,deletePayments) {
      try {
        console.log(docId, "deleting");
           if (deletePayments) {
        // Reference to the payments subcollection
        const paymentsSubCollectionRef = collection(
          invoicesCollectionRef,
          docId,
          "payments"
        )
        // Fetch all documents in the payments subcollection
        const paymentsSnapshot = await getDocs(paymentsSubCollectionRef);

        // Delete all documents in the payments subcollection
        const deletePromises = paymentsSnapshot.docs.map((paymentDoc) =>
          deleteDoc(paymentDoc.ref)
        );

        await Promise.all(deletePromises);
      }
        // Delete the invoice document
        await deleteDoc(doc(invoicesCollectionRef, docId));
        console.log(`Invoice ${docId} and its payments subcollection deleted.`);
      } catch (error) {
        console.error("Error deleting invoice and payments: ", error);
      }
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

        // Create a reference to the document with the specified invoiceId
        const invoiceDocRef = doc(invoicesCollectionRef, data.invoiceId);

        // Create the data object to be added to Firestore
        const invoiceData = {
          invoiceId: data.invoiceId,
          patientName: data.patientDetails.namef,
          patientId: data.patientDetails.patientId,
          invoiceDate: data.invoiceDate,
          invoiceDateUnix: data.invoiceDateUnix,
          // paymentItemList: this.paymentItemList,
          workItemList: this.workItemList,
          // invoicePending: data.invoicePending,
          invoiceDraft: data.invoiceDraft,
          deletedDateUnix: null,
          // invoicePaid: null,
          uid: this.storeAuth.user.uid,
        };

        // Set the document in Firestore with the specified docId
        const setDocPromise = setDoc(invoiceDocRef, invoiceData);

        // Set a timeout to check if the Firestore operation completes within a certain time
        const timeoutDuration = 5000; // Timeout duration in milliseconds (adjust as needed)
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(false), timeoutDuration);
        });

        // Wait for either the Firestore write operation or the timeout to complete
        const isOperationCompleted = await Promise.race([setDocPromise, timeoutPromise]);

        if (isOperationCompleted === false) {
          // If the timeout occurs and the operation hasn't completed, treat it as an error
          throw new Error('Timeout: Unable to add invoice');
        }

        // If the operation completes successfully or within the timeout, proceed to toggle the invoice
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        this.invoiceModal = false;
        this.CLEAR_DATA();
        this.moreDataAvailable = true; // If the invoice is added, set moreDataAvailable to true

      } catch (error) {
        console.error('Error adding invoice:', error);

        // Handle error here
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        this.invoiceModal = false; // Ensure TOGGLE_INVOICE is called even in offline scenarios
        this.CLEAR_DATA();
      }
    },
    async updateInvoice(data) {
      try {
        this.loadingModal = true;
           console.log(data,'data.docId')
           const plainWorkItemList = JSON.parse(JSON.stringify(data.workItemList));
        // Get a reference to the existing document using its invoiceId
        const invoiceDocRef = doc(invoicesCollectionRef, data.docId);

        // Prepare the update data object
        const updateData = {
          patientName: data.patientDetails.namef,
          patientId: data.patientDetails.patientId,
          invoiceDate: data.invoiceDate,
          invoiceDateUnix: data.invoiceDateUnix,
          invoiceDraft: data.invoiceDraft,
          deletedDateUnix: null,
          uid: this.storeAuth.user.uid,
          workItemList:plainWorkItemList,
        };

        // Set a timeout to check if the Firestore operation completes within a certain time
        const timeoutDuration = 5000; // Timeout duration in milliseconds (adjust as needed)
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(false), timeoutDuration);
        });

        // Perform the update operation
        const updateDocPromise = updateDoc(invoiceDocRef, updateData);

        // Wait for either the Firestore update operation or the timeout to complete
        const isOperationCompleted = await Promise.race([updateDocPromise, timeoutPromise]);

        if (isOperationCompleted === false) {
          // If the timeout occurs and the operation hasn't completed, treat it as an error
          throw new Error('Timeout: Unable to update invoice');
        }

        // If the operation completes successfully or within the timeout, proceed to toggle the invoice
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        this.invoiceModal = false;
        this.CLEAR_DATA();
        this.moreDataAvailable = true; // If the invoice is updated, set moreDataAvailable to true

      } catch (error) {
        console.error('Error updating invoice:', error);

        // Handle error here
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        this.invoiceModal = false; // Ensure TOGGLE_INVOICE is called even in offline scenarios
        this.CLEAR_DATA();
      }
    },
    clearInvoices(){
      this.invoiceData=[]
      console.log(this.invoiceData,'cleared')
      if (getInvoicesSnapshot) getInvoicesSnapshot() //unsubscribe from any active listener
    },
  },


  getters:{
    GET_CURRENT_INVOICE: (state)=>{
      return (invoiceId) =>{
        console.log(state.invoiceData.filter(invoice=> invoice.invoiceId===invoiceId)[0],'ssssZ')
       return state.invoiceData.filter(invoice=> invoice.invoiceId===invoiceId)[0]
      }
     },
     GET_CURRENT_INVOICE_WORKS: (state)=>{
      return (invoice,payments) =>{

        // const payments= state.storePayments.invoicePayments[invoice.invoiceId]||[]
        const works = invoice.workItemList || [];
        const currencies = [...new Set(works.map((item) => item.currency))];
        function formatPrice(value, currency) {
          const absoluteValue = Number( Math.abs(value).toLocaleString().replace(/,/g, '') || 0); // Format the absolute value
          const sign = value < 0 ? '-' : ''; // Determine the sign
          return {sign,absoluteValue,currency}; // Format: [sign] [price] [currency]
         }
        // Calculate subtotals for each currency
        const subTotals = currencies.map((currency) => {
          const paid = payments.reduce((accumulator, item) => {
            if (item.currency === currency) {
              if (item.currency === currency && (item.type === 'payment' || item.type === 'expense')) {
              return accumulator + Number(item.paid || 0);
            }
          }
            return accumulator;
          }, 0);

          const paymentDates = payments.map((payment) => Number(payment.dateUnix || 0));
          const highestPaymentDate = Math.max(...paymentDates, 0);

          const paymentDueDates = works.map((work) => Number(work.paymentDueDateUnix || 0));
          const highestPaymentDueDate = Math.max(...paymentDueDates, 0);

          const subTotal = works.reduce((accumulator, item) => {
            if (item.currency === currency) {
              let priceValue = 0;

              if (typeof item.price === 'string') {
                // If it's a string, sanitize it and convert to a number
                priceValue = Number(item.price.replace(/,/g, '') || 0);
              } else if (typeof item.price === 'number') {
                // If it's already a number, use it directly
                priceValue = item.price;
              } else {
                // If it's neither, default to 0
                console.warn(`Unexpected price type for item:`, item);
              }

              return accumulator + priceValue;
            }
            return accumulator;
          }, 0);

          const totalDiscount = works.reduce((accumulator, item) => {
            if (item.currency === currency) {
              let discountValue = 0;

              if (typeof item.discount === 'string') {
                // If it's a string, sanitize it and convert to a number
                discountValue = Number(item.discount.replace(/,/g, '') || 0);
              } else if (typeof item.discount === 'number') {
                // If it's already a number, use it directly
                discountValue = item.discount;
              } else {
                // If it's neither, default to 0
                console.warn(`Unexpected discount type for item:`, item);
              }

              return accumulator + discountValue;
            }
            return accumulator;
          }, 0);
          const totalAmount = subTotal - totalDiscount;
          const dueAmount = totalAmount - paid;
          const paidPercentage = totalAmount !== 0 ? (paid / totalAmount) * 100 : 0;

          return {
            currency,
            subTotal: computed(() => formatPrice(subTotal, currency)).value,
            totalDiscount: computed(() => formatPrice(totalDiscount, currency)).value,
            tax: computed(() => formatPrice(0, currency)).value,
            totalAmount: computed(() => formatPrice(totalAmount, currency)).value,
            paid: computed(() => formatPrice(paid, currency)).value,
            dueAmount: computed(() => formatPrice(dueAmount, currency)).value,
            paidPercentage,
            highestPaymentDate,
            highestPaymentDueDate,
          };
        });


        // Calculate overall percentage and overdue status
        const overallPercentage = subTotals.length > 0
        ? (
            subTotals.reduce(
              (acc, subtotal) => acc + subtotal.paidPercentage,
              0
            ) / subTotals.length
          ).toFixed(1)
        : 0;

        const overDue = subTotals.some((subtotal) => {
          const currentDate = new Date().getTime();
          return subtotal.highestPaymentDueDate && currentDate > subtotal.highestPaymentDueDate;
        });

        // Add payment details to works
        const worksWithDetails = works.map((work) => {
          const allPaid = payments.reduce((accumulator, item) => {
            if (item.workId === work.workId && (item.type === 'payment' || item.type === 'expense')) {
              return accumulator + Number(item.paid || 0);
            }
            return accumulator;
          }, 0);

          let price = 0;
          if (typeof work.price === 'string') {
            price = Number(work.price.replace(/,/g, '') || 0);
          } else if (typeof work.price === 'number') {
            price = work.price;
          } else {
            console.warn(`Unexpected price type for work:`, work);
          }

          // Calculate total discount from payments
          const discount = payments.reduce((accumulator, item) => {
            if (item.workId === work.workId && item.category === 'Discount') {
              return accumulator + Number(item.paid || 0);
            }
            return accumulator;
          }, 0);

          // Update work object
          work.price = price;
          work.discount = discount; // Update the discount with calculated value

          const total = price - discount;

          return {
            ...work,
            allPaid,
            formattedAllPaid: formatPrice(allPaid, work.currency),
            paidPercentage: total !== 0 ? ((allPaid / total) * 100).toFixed(2) : 0,
            formattedPrice: formatPrice(price, work.currency), // Add formatted price
          };
        });
              // Function to handle doctor label modifications
        function manipulateRepeatedDoctorLabels(arr) {
          const copiedArray = JSON.parse(JSON.stringify(arr)); // Deep copy to avoid mutation
          const doctorLabels = {};

          copiedArray.forEach((obj, index) => {
            const doctorLabel = obj.doctor.name;
            if (!doctorLabels[doctorLabel]) {
              doctorLabels[doctorLabel] = index; // Store index of the last occurrence
            } else {
              doctorLabels[doctorLabel] = index; // Update index for repeated doctor.label
            }
          });

          copiedArray.forEach((obj, index) => {
            const doctorLabel = obj.doctor.name;
            if (index !== doctorLabels[doctorLabel]) {
              obj.doctor.name = ''; // Clear label for non-last occurrences
            }
          });

          return copiedArray;
        }

        const modifiedWorks = manipulateRepeatedDoctorLabels(worksWithDetails);

        const updatedWorks = modifiedWorks.map(work => {
          if (parseInt(work.paidPercentage) !== 100&&!state.storePayments.editPayment) {

            return { ...work, selected: true };
          }
          else if (state.storePayments.editPayment&&work.workId==state.storePayments.currentPaymentArray.workId) {
            return { ...work, selected: true };
          }
          return work;
        });



        updatedWorks.subTotals = subTotals;
        updatedWorks.overallPercentage = overallPercentage;
        updatedWorks.overDue = overDue;
        console.log(updatedWorks,'updatedWorks')
        return updatedWorks;

      }
     },
     GET_PATIENT_INVOICES: (state)=>{
      return (patientId) =>{
       const patientInvoices=state.patientInvoices.filter(invoice=> invoice.patientId===patientId)
       return patientInvoices
      }
     },
  }

})

