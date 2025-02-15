import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,orderBy,addDoc,writeBatch,getDocs,collectionGroup,deleteField
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import { useStorePayments } from './storePayments'


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
    }
  },

  actions:{
    init(){
      if(this.storeAuth.role.doctor&&this.storeAuth.role.clinicId!==''){
        worksCollectionRef = collection(db, 'users',this.storeAuth.role.clinicId,'works')
        }
        else {worksCollectionRef = collection(db, 'users',this.storeAuth.user.uid,'works') }
        // this.updateWorks()
   },
   async updateWorks() {
    try {
      // const doctorsIds = doctors.map(doctor => doctor.doctorId);
      const worksCollectionAllRef = collectionGroup(db, 'works');
      const worksCollectionAllQuery = query(worksCollectionAllRef, );

      const snapshot = await getDocs(worksCollectionAllQuery);

      const batch =  writeBatch(db) // Use the batch function from Firestore

      snapshot.forEach(doc => {
        const workData = doc.data();

        if (!workData.doctor.doctorId) {
          const updatedData = {
            ...workData,
            doctor: {
              name: workData.doctor.name,
              doctorId: this.storeAuth.user.uid
            },
            // // id: patientData.id,
            // id: deleteField(), // Remove the 'id' field
            // clientDetails: deleteField() // Remove the 'id' field
          };
          const workRef = doc.ref;
          batch.update(workRef, updatedData);
        }
      });

      await batch.commit();
      console.log('Updated invoice data successfully');
    } catch (error) {
      console.error('Error updating invoice data:', error);
    }
  },
    // Add Invoice
    async addWork (work) {
      this.loading=true
    await addDoc(worksCollectionRef, {
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
         uid:this.storeAuth.user.uid,
    })
    this.loading=false
    },
    async getWorksForInvoice(invoiceId) {
      this.loading=true
      console.log('loading works for invoices')
     const worksCollectionQuery = query(worksCollectionRef, where('invoiceId', '==', invoiceId));
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

