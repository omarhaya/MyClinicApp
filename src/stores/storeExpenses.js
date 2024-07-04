import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,orderBy,addDoc,writeBatch,getDocs,collectionGroup,deleteField,deleteDoc,doc,
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
import {useDynamicSort} from 'src/use/useDynamicSort'
import { useStoreWorks } from './storeWorks'
import {modalController, } from '@ionic/vue';
let expensesCollectionRef
let expensesCollectionQuery
let getExpensesSnapshot=null

export const useStoreExpenses= defineStore('storeExpenses', {
  state: () => {

    return {
       loadingModal:false,
       invoiceExpenses:[],
       patient:null,
       appointmentDate:null,
       expenseInvoices:null,
       expenses:[],
       dayExpenses:[],
       editExpense: null,
       expenseModal: null,
       selectedDate:today(),
       storeWorks:useStoreWorks(),
       storeAuth:useStoreAuth(),
       loading:null,
    }
  },

  actions:{
    init(){
      if(this.storeAuth.role.doctor&&this.storeAuth.role.clinicId!==''){
        expensesCollectionRef = collection(db, 'users',this.storeAuth.role.clinicId,'expenses')
        }
        else {expensesCollectionRef = collection(db, 'users',this.storeAuth.user.uid,'expenses')}
   },
   TOGGLE_EXPENSE() {
    this.expenseModal = !this.expenseModal
  },
  CLEAR_DATA(){
    this.expenseInvoices=[]
    this.patient=null
    this.editExpense=null
  },
  async updateExpenses() {
    try {
      // const doctorsIds = doctors.map(doctor => doctor.doctorId);
      const expensesCollectionAllRef = collectionGroup(db, 'expenses');
      const expensesCollectionAllQuery = query(expensesCollectionAllRef, );
      const snapshot = await getDocs(expensesCollectionAllQuery);

      const batch =  writeBatch(db) // Use the batch function from Firestore

      snapshot.forEach(doc => {
        const expenseData = doc.data();

        if (expenseData) {
          const updatedData = {
            ...expenseData,
            patientId:expenseData.clientId,
            // patientDetails:expenseData.clientDetails,
            // id: patientData.id,
            clientId: deleteField(), // Remove the 'id' field
            // clientDetails: deleteField() // Remove the 'id' field
          };
          const expenseRef = doc.ref;
          batch.update(expenseRef, updatedData);
        }
      });

      await batch.commit();
      console.log('Updated invoice data successfully');
    } catch (error) {
      console.error('Error updating invoice data:', error);
    }
  },
  async getExpensesForInvoice(invoiceId) {
    try {
      this.loading = true; // Set loading state to true when data fetching begins
      console.log(this.loading, 'expensesloading');

      const expensesCollectionQuery = query(expensesCollectionRef, where('invoiceId', '==', invoiceId));

      // Await for the snapshot to get data
      const querySnapshot = await getDocs(expensesCollectionQuery);

      const expenses = [];
      querySnapshot.forEach((doc) => {
        let expense = {
          expenseId: doc.id,
          paid: doc.data().paid,
          date: doc.data().date,
          workId: doc.data().workId,
          currency: doc.data().currency,
          dateUnix: doc.data().dateUnix,
        };
        expenses.push(expense);
      });

      this.invoiceExpenses[invoiceId] = expenses;
      await this.storeWorks.getWorksForInvoice(invoiceId);

      this.loading = false; // Clear loading state when data fetching completes
      console.log(this.loading, 'expensesloading');
    } catch (error) {
      console.error("Error fetching expenses:", error);
      this.loading = true; // Clear loading state if an error occurs
    }
  },
  async deleteExpense(expenseId) {
    try {
      await deleteDoc(doc(expensesCollectionRef, expenseId));
      console.log('Expense successfully deleted');
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Handle error here
    }
  },
  async getdayExpenses(date) {
    this.loading=true
    console.log(date,expensesCollectionRef,'getdayexpenses')
   const expensesCollectionQuery = query(expensesCollectionRef,where("date", "==", date));
   getExpensesSnapshot=onSnapshot(expensesCollectionQuery, (querySnapshot) => {
     const expenses=[]
     querySnapshot.forEach((doc) => {
     let expense={
       expenseId:doc.id,
       invoiceId:doc.data().invoiceId,
       paid:doc.data().paid,
       dateUnix:doc.data().dateUnix,
       workId:doc.data().workId,
     }

     this.getExpensesForInvoice(expense.invoiceId)
    //  this.storeWorks.getWork(expense.workId)
     expenses.push(expense)
     })
     this.dayExpenses[date]=expenses
 })
 this.loading=false

},
async getIntervalExpenses(startDate, endDate) {
  const startDateUnix = Math.floor(new Date(startDate).getTime() / 1000).toString();
  // Adjust endDate to be one day after the provided endDate
  let endDateObject = new Date(endDate);
  endDateObject.setDate(endDateObject.getDate() + 1); // Adding one day
  const endDateUnix = Math.floor(endDateObject.getTime() / 1000).toString();

  this.loading = true;

  const expensesCollectionQuery = query(
    expensesCollectionRef,
    where('dateUnix', '>=', startDateUnix),
    where('dateUnix', '<', endDateUnix) // Use '<' to include until the day before the next day
  );

  getExpensesSnapshot = onSnapshot(expensesCollectionQuery, (querySnapshot) => {
    const expenses = [];
    querySnapshot.forEach((doc) => {
      let expense = {
        expenseId: doc.id,
        invoiceId: doc.data().invoiceId,
        paid: doc.data().paid,
        dateUnix: doc.data().dateUnix,
        workId: doc.data().workId,
        currency: doc.data().currency,
      };

      //  this.getExpensesForInvoice(expense.invoiceId)
      //  this.storeWorks.getWork(expense.workId)
      expenses.push(expense);
    });
    console.log(expenses, 'intervalexpenses!!');
    this.dayExpenses[this.selectedDate] = expenses;
  });
  this.loading = false;
},
async getExpenses(patientId) {
  this.loading=true
 const expensesCollectionQuery = query(expensesCollectionRef,where("patientId", "==", patientId),orderBy('dateUnix','desc'));
 getExpensesSnapshot=onSnapshot(expensesCollectionQuery, (querySnapshot) => {
   const expenses=[]
   querySnapshot.forEach((doc) => {
   let expense={
     expenseId:doc.id,
     invoiceId:doc.data().invoiceId,
     paid:doc.data().paid,
     dateUnix:doc.data().dateUnix,
     workId:doc.data().workId,
   }
   this.getExpensesForInvoice(expense.invoiceId)
   this.storeWorks.getWork(expense.workId)
   expenses.push(expense)
   })
   this.expenses[patientId]=expenses
   console.log(this.expenses[patientId],'expensessss')
})
this.loading=false
},
    async addExpense (work) {
      try {
        this.loadingModal = true
        let paid = work.expenseItemList.paid.replace(/\,/g,'') || 0
        let currentDate = new Date().getTime(),
        dateUnix = currentDate.toString()
        let date=today()
        const addDocPromise = addDoc(expensesCollectionRef, {
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

        // If the operation completes successfully or within the timeout, proceed to toggle the expense
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        if(this.expenseModal)  this.TOGGLE_EXPENSE();
        this.moreDataAvailable = true; // If the expense is added, set moreDataAvailable to true

      } catch (error) {
        console.error('Error adding invoice:', error);

        // Handle error here
        modalController.dismiss(null, 'confirm');
        this.loadingModal = false;
        if(this.expenseModal)  this.TOGGLE_EXPENSE(); // Ensure TOGGLE_EXPENSE is called even in offline scenarios

      }
    },
    clearExpenses(){
      this.expenses=[]
      this.invoiceExpenses=[]
      console.log( this.expenses,this.invoiceExpenses,'cleared')
      if (getExpensesSnapshot) getExpensesSnapshot() //unsubscribe from any active listener
    },

    // async deleteExpense(idToDelete) {

    //   console.log(idToDelete)
    //   await deleteDoc(doc(expensesCollectionRef, idToDelete))

    // },
    // async updateExpense(id,expense){
    //   await updateDoc(doc(expensesCollectionRef, id), {
    //     namef:expense.namef,
    //     age:expense.age,
    //     phone:expense.phone,
    //     gender:expense.gender,
    //     updatedDate:Date.now()
    //   })
    // },
    // async completeExpense(expense){
    //   await updateDoc(doc(expensesCollectionRef, expense.id), {
    //     completed:!expense.completed,
    //   })
    // },
    // async dropExpense(expense){
    //   await updateDoc(doc(expensesCollectionRef, expense.id), {
    //     time:expense.time,
    //     doctor:expense.doctor,
    //   })
    // }
  },
  getters:{

    }

})

