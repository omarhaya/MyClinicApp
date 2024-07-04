const functions = require("firebase-functions")
const admin = require('firebase-admin')
const app =admin.initializeApp()
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');
const db = admin.firestore()
const firestore = app.firestore()
const util = require('util')

exports.addAdminRole=functions.https.onCall((data,context)=>{
  // check request is made by an admin
  // if(context.auth.token.admin !== true){
  //   return {error:'only admins can add doctors'}
  // }
  // get user and add custom claim(admin)
  return getAuth().getUserByEmail(data.email).then(user =>{
    return getAuth().setCustomUserClaims(user.uid,{
      admin:true
    })
  }).then(() => {
    return {
      message:`success! ${data.email} has been made an admin`
    }
  }).catch(err => {
    return err
  })

})

/*
 User Roles when User is created
*/
exports.AddUserRole = functions.auth.user().onCreate(async (authUser) => {

  if (authUser.email) {
    const customClaims = {
      doctor: true,
      doctorId:''
    };
    try {
      var _ = await getAuth().setCustomUserClaims(authUser.uid, customClaims)
            // Update real-time database to notify client to force refresh.
            const metadataRef = getDatabase().ref('metadata/' + authUser.uid);

            console.log(metadataRef)
      return db.collection("users").doc(authUser.uid).update({
        email: authUser.email,
        role: customClaims
      })

    } catch (error) {
      console.log(error)
    }

  }

});


/*
 Change User Roles
*/

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.getPatients_v1 = functions.https.onCall(async (data,context)=>{
//  const userId = data.uid
//  if(userId){
//     // check request is made by an admin
//   // if(context.auth.token.admin !== true){
//   //   return {error:'only admins can add doctors'}
//   // }


//  console.log(`im going to get patients for ${userId}`)
//  const userDoc= await firestore.doc(`users/${userId}`).get()
//  const userData=userDoc.data()

//   //  return userData
//  if(!userData){
//   console.log('no patients :(')
//   return []
//  }
//  const doctors=userData.doctors
//  const fetchPromises=[]
//  doctors.forEach((doctorId)=>{

//   console.log(`going to get patient ${doctorId}`)

//   const nextPromise =  db.collection(`users/${doctorId}/patients`).get()
//   fetchPromises.push(nextPromise)
//  })
//  const snapshots=await Promise.all(fetchPromises)
//  const responseArray=snapshots.map((snapshot)=>{return snapshot})

//   console.log('done fetching!'+(responseArray))
//   return responseArray

// }
//  else{
//  console.log('Nouser ID . what`s up with that')
//  return []
// }
// });
