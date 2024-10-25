const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { onSchedule } = require('firebase-functions/v2/scheduler');
const twilio = require('twilio');
initializeApp()
const admin = require('firebase-admin')
const db = admin.firestore()
const dayjs = require('dayjs');
require('dayjs/locale/ar'); // Import the Arabic locale
const localeData = require('dayjs/plugin/localeData');
const customParseFormat = require ('dayjs/plugin/customParseFormat')
dayjs.extend(localeData)
dayjs.locale('ar') // Set the locale to Arabic
// Initialize Firestore
// On sign up.
exports.processSignUp = functions.auth.user().onCreate(async (user) => {
  // Check if user meets role criteria.
  if (
    user.email
  ) {
    const customClaims = {
      doctor: true,
      accessLevel: 9,
      clinicId:'',
    };

    try {
      // Set custom user claims on this newly created user.
      await getAuth().setCustomUserClaims(user.uid, customClaims)
      return db.collection("users").doc(user.uid).update({
        email: user.email,
        role: customClaims,
      })
      // // Update real-time database to notify client to force refresh.
      // const metadataRef = getDatabase().ref('metadata/' + user.uid);

      // // Set the refresh time to the current UTC timestamp.
      // // This will be captured on the client to force a token refresh.
      // await  metadataRef.set({refreshTime: new Date().getTime()});

    } catch (error) {
      console.log(error,'errrror');
    }
  }
});

