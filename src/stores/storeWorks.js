import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,doc,setDoc,writeBatch,getDocs,collectionGroup,updateDoc,deleteDoc
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import { useStorePayments } from './storePayments'
import dayjs from 'dayjs'

let worksCollectionRef
let worksCollectionQuery
let getWorksSnapshot=null

export const useStoreWorks = defineStore('storeWorks', {
  state: () => {
    return {
      invoiceWorks: [],
      paymentsWorks:[],
      worksLoaded: null,
      workItemList:[],
      loading:null,
      storeAuth:useStoreAuth(),
      storePayments:useStorePayments(),
      totalPriceThisMonth: 0,
    }
  },

  actions:{
    init(){
      if(this.storeAuth.role.doctor&&this.storeAuth.role.clinicId!==''){
        worksCollectionRef = collection(db, 'users',this.storeAuth.role.clinicId,'works')
        }
        else {worksCollectionRef = collection(db, 'users',this.storeAuth.user.uid,'works') }
        // this.updateWorksDocIds()
   },
   async  updateWorksDocIds() {
    try {


      // Reference to the works collection
      const worksCollectionRef = collection(db, 'users', 'e1Q5Eg5McWZjGjmuZpDeJCC3bkB3', 'works');
      const worksCollectionQuery = query(worksCollectionRef);

      // Fetch the snapshot of all works
      const snapshot = await getDocs(worksCollectionQuery);

      // Initialize a batch for batch updates
      const batch = writeBatch(db);

      // Iterate over each work document
      for (const docSnapshot of snapshot.docs) {
        const workData = docSnapshot.data();

        if (workData && workData.workId && workData.workId !== docSnapshot.id) {
          // Construct the new document reference with the workId
          const newWorkRef = doc(db, 'users', 'e1Q5Eg5McWZjGjmuZpDeJCC3bkB3', 'works', workData.workId);

          // Prepare the data for updating
          const updatedData = {
            ...workData,
            // Add any necessary modifications to the data here
          };

          // Add the update operation to the batch
          batch.set(newWorkRef, updatedData);  // Set the new document with updated workId
          batch.delete(docSnapshot.ref); // Delete the old document
        }
      }

      // Commit the batch update
      await batch.commit();
      console.log('Updated works document IDs successfully');
    } catch (error) {
      console.error('Error updating works document IDs:', error);
    }
  },
    // Add Work
    async addWork(work) {
      this.loading = true;

      // Create the work object
      const newWork = {
        color: work.color,
        description: work.description,
        price: work.price.replace(/\,/g, ''),
        currency: work.currency,
        discount: work.discount.replace(/\,/g, ''),
        doctor: work.doctor,
        workId: work.workId,
        invoiceId: work.invoiceId,
        label: work.label,
        paymentDueDateUnix: work.paymentDueDateUnix,
        paymentTerms: work.paymentTerms,
        patientDetails: work.patientDetails,
        teeth: work.teeth,
        uid: this.storeAuth.user.uid,
        dateUnix:work.dateUnix
      };

      // Update the local state immediately
      if (!this.invoiceWorks[work.invoiceId]) {
        this.invoiceWorks[work.invoiceId] = [];
      }
      this.invoiceWorks[work.invoiceId].push({
        ...newWork,
        docId: null, // You can update this when online and get the actual doc ID
      });

      try {
        // Add to Firestore with the workId as the doc ID
        const workRef = doc(worksCollectionRef, work.workId); // Use workId as the document ID
        await setDoc(workRef, newWork); // Set the document with the new work data

        console.log(newWork, 'work!!!');

        // Update the docId in local state with the actual doc ID (workId)
        const addedWork = this.invoiceWorks[work.invoiceId].find(item => item.workId === work.workId);
        if (addedWork) {
          addedWork.docId = work.workId; // Set docId to workId
        }
      } catch (error) {
        console.error('Error adding work:', error);
        // Handle error appropriately
      } finally {
        this.loading = false;
      }
    },
   // Action to listen for real-time updates and calculate the total price for works this month
   fetchMonthWorksPrice(currentMonthStart,currentMonthEnd) {

    const q = query(
      worksCollectionRef,
      where('dateUnix', '>=', currentMonthStart),
      where('dateUnix', '<=', currentMonthEnd), // Works after the start of this month
      // Works before the end of this month
    );
    // Set up the real-time listener using onSnapshot
    onSnapshot(q, (querySnapshot) => {
      let totalPrice = 0;

      querySnapshot.forEach((doc) => {

        const work = doc.data();
        const price = parseInt(doc.data().price)
        totalPrice += price|| 0; // Accumulate the price for each work
      });

      // Update the state with the new total price
      this.totalPriceThisMonth = totalPrice;
      console.log(this.totalPriceThisMonth,'doc!')
    });

     },
     // Update Work
     async updateWork (work) {
      this.loading=true

        // Get a reference to the existing document using its invoiceId
        const workDocRef = doc(worksCollectionRef, work.docId);
    await updateDoc(workDocRef, {
         color:work.color,
         description:work.description,
         price:work.price.replace(/\,/g,''),
         currency:work.currency,
         discount:work.discount.replace(/\,/g,''),
         doctor:work.doctor,
         workId:work.workId,
         invoiceId:work.invoiceId,
         label:work.label,
         paymentDueDateUnix:work.paymentDueDateUnix,
         paymentTerms:work.paymentTerms,
         patientDetails:work.patientDetails,
         teeth:work.teeth,
         uidUpdated:this.storeAuth.user.uid,
    })
    this.loading=false
    },
    async deleteWork (workId) {
      this.loading=true
      console.log('delettting')
      try {
        console.log('delettting1')
        await deleteDoc(doc(worksCollectionRef, workId));
        console.log('Payment successfully deleted');
        this.loading=false
      } catch (error) {
        console.error('Error deleting payment:', error);
        this.loading=false
        // Handle error here
      }
    },
    async getWorksForInvoice(invoiceId) {
      this.loading=true
      console.log('loading works for invoices')
     const worksCollectionQuery = query(worksCollectionRef, where('invoiceId', '==', invoiceId));
     getWorksSnapshot=onSnapshot(worksCollectionQuery, (querySnapshot) => {
       const works=[]
       querySnapshot.forEach((doc) => {
       let work={
         docId: doc.id,
         workId:doc.data().workId,
         color:doc.data().color,
         description:doc.data().description,
         price:doc.data().price,
         currency:doc.data().currency,
         discount:doc.data().discount,
         doctor:doc.data().doctor,
         invoiceId:doc.data().invoiceId,
         label:doc.data().label,
         paymentDueDateUnix:doc.data().paymentDueDateUnix,
         paymentTerms:doc.data().paymentTerms,
         teeth:doc.data().teeth,
         selected:null,
         status:doc.data().status,
         statusDateUnix:doc.data().statusDateUnix,
         subWorks:doc.data().subWorks,
         dateUnix:doc.data().dateUnix,
       }
       if(!work.discount){work.discount=0}
       works.push(work)
       })
      const payments=this.storePayments.invoicePayments[invoiceId]|| [];
      console.log(payments,'paymentssss')
      const currencies = [...new Set(works.map((item) => item.currency))]
      // Calculate subtotal for each currency
      const subTotals = currencies.map((currency) => {
        const paid = payments.length > 0 ? payments.reduce((accumulator, item) => {
          if (item.currency === currency) {
            return accumulator + parseInt(item.paid);
          }
          return accumulator;
        }, 0) : 0;
        // Extracting all payment dates
        const paymentDates = payments.map(payment => ((parseInt(payment.dateUnix))))
        // Finding the highest date
        const highestPaymentDate = paymentDates.reduce((maxDate, currentDate) => {
          return currentDate > maxDate ? currentDate : maxDate;
        }, paymentDates[0])||null
         // Extracting all due dates
         const paymentDueDates = works.map(work => ((parseInt(work.paymentDueDateUnix))))
         // Finding the highest date
         const highestPaymentDueDate = paymentDueDates.reduce((maxDate, currentDate) => {
           return currentDate > maxDate ? currentDate : maxDate;
         }, paymentDueDates[0])||null
        const subTotal = works.reduce((accumulator, item) => {
          if (item.currency === currency) {
            return accumulator + parseInt(item.price)
          }
          return accumulator
        }, 0)
        let tax=0
        let length=currencies.length
        const totalDiscount = works.reduce((accumulator, item) => {
          if (item.currency === currency) {
            return accumulator + parseInt(item.discount)
          }
          return accumulator
        }, 0)
        const totalAmount = subTotal - totalDiscount
        const dueAmount=totalAmount-paid
        const paidPercentage=(paid/totalAmount)*100
        return { currency, subTotal,totalDiscount ,tax,length,totalAmount,paid,dueAmount,paidPercentage,highestPaymentDate,highestPaymentDueDate}
      })
      works.forEach(work=>{
        work.allPaid= payments.length > 0 ? payments.reduce((accumulator, item) => {
          if (item.workId === work.workId) {
            return accumulator + parseInt(item.paid);
          }
          return accumulator;
        }, 0) : 0;
        work.paidPercentage=((work.allPaid/(work.price-work.discount))*100).toFixed(0)
        work.paidPercentage=parseInt(work.paidPercentage)
      })
      let overDue = false
      subTotals.forEach((subtotal) => {
        if (subtotal.highestPaymentDueDate) {
          const currentDate = new Date().getTime();
          if (currentDate > subtotal.highestPaymentDueDate) {
            overDue = true
          }
        }
      })

      let overallPercentages=0
      subTotals.forEach((subtotal) => {
        overallPercentages += subtotal.paidPercentage || 0;
      })
      // Calculate overall percentage
      const overallPercentage = (overallPercentages / subTotals.length).toFixed(0) || 0; // Consider default value if 'overallTotalAmount' is 0 or invalid
      function manipulateRepeatedDoctorLabels(arr) {
        const doctorLabels = {};

        arr.forEach((obj, index) => {
            const doctorLabel = obj.doctor.label;
            if (!doctorLabels[doctorLabel]) {
                doctorLabels[doctorLabel] = index; // Store index of each doctor.label for the last occurrence
            } else {
                doctorLabels[doctorLabel] = index; // Update index for the repeated doctor.label
            }
        });

        arr.forEach((obj, index) => {
            const doctorLabel = obj.doctor.label;
            if (index !== doctorLabels[doctorLabel]) {
                obj.doctor.label = ''; // Set 'doctor.label' to an empty string for non-last occurrences
            }
        });
        return arr;
    }
    const modifiedArray = manipulateRepeatedDoctorLabels(works)
          modifiedArray.subTotals=subTotals
          modifiedArray.overallPercentage=parseInt(overallPercentage)
          modifiedArray.overDue=overDue
          this.invoiceWorks[invoiceId]=manipulateRepeatedDoctorLabels(works)

   })
  //  console.log(this.invoiceWorks,'works2')
  console.log('done loading works for invoices')
  console.log(this.invoiceWorks,'subTotals')
   this.loading=false
 },
 async getWork(workId) {
  this.loading=true
 const worksCollectionQuery = query(worksCollectionRef, where('workId', '==', workId));
 getWorksSnapshot=onSnapshot(worksCollectionQuery, (querySnapshot) => {
   const works=[]
   querySnapshot.forEach((doc) => {
   let work={
     workId:doc.data().workId,
     color:doc.data().color,
     description:doc.data().description,
     price:doc.data().price,
     currency:doc.data().currency,
     discount:doc.data().discount,
     doctor:doc.data().doctor.name,
     invoiceId:doc.data().invoiceId,
     label:doc.data().label,
     paymentDueDateUnix:doc.data().paymentDueDateUnix,
     paymentTerms:doc.data().paymentTerms,
     patientName:doc.data().patientDetails.namef,
     teeth:doc.data().teeth,
   }
   const payments=this.storePayments.invoicePayments[work.invoiceId]|| []
   work.allPaid= payments.length > 0 ? payments.reduce((accumulator, item) => {
    if (item.workId === work.workId) {
      return accumulator + parseInt(item.paid);
    }
    return accumulator;
    },0): 0;
    work.paidPercentage=((work.allPaid/(work.price-work.discount))*100).toFixed(0)
    work.paidPercentage=parseInt(work.paidPercentage)
   if(!work.discount){work.discount=0}
   this.paymentsWorks[workId]=work

   console.log('workkkkk',work)

   })
  //  if(!work.discount){work.discount=0}
  //  this.paymentWorks[workId]=(work)

   })
this.loading=false
},

clearWorks(){
  this.invoiceWorks=[]
  this.paymentsWorks=[]
  console.log(this.invoiceWorks,this.paymentsWorks,'cleared')
  if (getWorksSnapshot) getWorksSnapshot() //unsubscribe from any active listener
},
  },

  getters:{

  }

})

