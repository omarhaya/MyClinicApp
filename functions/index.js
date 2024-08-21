const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getDatabase } = require('firebase-admin/database')
const twilio = require('twilio');

initializeApp()
const admin = require('firebase-admin')
const db = admin.firestore()

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

//Twilio messeaging
const accountSid = 'AC6714de1ae7d6324a62f0acbc62195ed6';
const authToken = 'a972d1974f906eb511c6215c96d341f9';
const client = new twilio(accountSid, authToken);

exports.sendWhatsAppMessage = functions.https.onCall((data, context) => {
  const to = data.to; // e.g., 'whatsapp:+1234567890'
  const message = data.message; // e.g., 'Hello from my app!'

  return client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Your Twilio WhatsApp-enabled number
      to: to
  })
  .then((message) => {
      console.log('WhatsApp message sent:', message.sid);
      return { success: true, sid: message.sid };
  })
  .catch((error) => {
      console.error('Error sending WhatsApp message:', error);
      throw new functions.https.HttpsError('unknown', error.message, error);
  });
});
