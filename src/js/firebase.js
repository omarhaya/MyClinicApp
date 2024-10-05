
import { initializeApp } from 'firebase/app'
import { getFirestore,enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import {getFunctions} from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyD0kt96ogghILFaxVsub6rr2bCL7W8O7WU",
  authDomain: "myclinicapp-3202a.firebaseapp.com",
  databaseURL: "https://myclinicapp-3202a-default-rtdb.firebaseio.com",
  projectId: "myclinicapp-3202a",
  storageBucket: "myclinicapp-3202a.appspot.com",
  messagingSenderId: "128618306083",
  appId: "1:128618306083:web:ebea4bcfa32a953a796f96",
  measurementId: "G-0KFQ2YFFPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const functions = getFunctions(app)
const db = getFirestore(app)
const auth = getAuth(app)
// offline support
enableIndexedDbPersistence(db)
.catch((err) => {
    if (err.code == 'failed-precondition') {
    } else if (err.code == 'unimplemented') {
    }
})
export {db,auth,functions}
