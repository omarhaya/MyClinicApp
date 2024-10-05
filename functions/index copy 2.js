const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { onSchedule } = require('firebase-functions/v2/scheduler');
const twilio = require('twilio');
initializeApp()
const admin = require('firebase-admin')
const db = admin.firestore()
const dayjs = require('dayjs')

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
//appointment_reservation
const accountSid = 'AC6714de1ae7d6324a62f0acbc62195ed6';
const authToken = 'a972d1974f906eb511c6215c96d341f9';
const client = new twilio(accountSid, authToken);

exports.sendWhatsAppAppointment = functions.https.onCall((data, context) => {
  const to = data.to; // e.g., 'whatsapp:+1234567890'
  const message = data.message; // e.g., 'Hello from my app!'

  return client.messages.create({
    contentSid: "HX6d818fafe4f682bb4e1da293a1733f8b",
    contentVariables: JSON.stringify({
      1: message.timeArabic,
      2: message.doctor,
      3: message.dayArabic,
      4: message.startDate,
    }),
      from: 'whatsapp:+9647511431331', // Your Twilio WhatsApp-enabled number
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
//appointment_change

exports.sendWhatsAppChange = functions.https.onCall((data, context) => {
  const to = data.to; // e.g., 'whatsapp:+1234567890'
  const message = data.message; // e.g., 'Hello from my app!'

  return client.messages.create({
    contentSid: "HX25dae7a6048c8af115875449cc90519a",
    contentVariables: JSON.stringify({
      1: message.timeArabic,
      2: message.doctor,
      3: message.dayArabic,
      4: message.startDate,
    }),
      from: 'whatsapp:+9647511431331', // Your Twilio WhatsApp-enabled number
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
//appointment_cancelation
exports.sendWhatsAppCancel = functions.https.onCall((data, context) => {
  const to = data.to; // e.g., 'whatsapp:+1234567890'
  const message = data.message; // e.g., 'Hello from my app!'

  return client.messages.create({
    contentSid: "HX030b90e78b25fc74d6b10f08bd2b479a",
    contentVariables: JSON.stringify({
      1: message.timeArabic,
      2: message.doctor,
      3: message.dayArabic,
      4: message.startDate,
    }),
      from: 'whatsapp:+9647511431331', // Your Twilio WhatsApp-enabled number
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
//appointment_reservation
exports.sendWhatsAppReservatiion = functions.https.onCall((data, context) => {
  const to = data.to; // e.g., 'whatsapp:+1234567890'
  const message = data.message; // e.g., 'Hello from my app!'

  return client.messages.create({
    contentSid: "HX0f3938db6243f631f95a7022d5f2c931",
    contentVariables: JSON.stringify({
      5: message.timeArabic,
      1: message.doctorInfo.clinicName,
      4: message.dayArabic,
      6: message.startDate,
      2: 'حجز',
      3:message.doctorInfo.doctorName
    }),
      from: 'whatsapp:+9647511431331', // Your Twilio WhatsApp-enabled number
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

// Scheduled function to check Firestore for messages to send

exports.scheduleWhatsAppMessages = onSchedule("every 1 minutes", async (event) => {
  const now = new Date();  // Current time
  const todayDate = now.toISOString().split('T')[0];  // YYYY-MM-DD
  const nowUnix = Math.floor(now.getTime() / 1000);  // Current time in Unix timestamp

  // Define fixed time for processing: 11:00 AM today
  const fixedTime = new Date();
  fixedTime.setHours(9, 0, 0, 0);
  const fixedTimeUnix = Math.floor(fixedTime.getTime() / 1000);  // Fixed time in Unix timestamp

  // Define the window for processing: 11:01 AM to 11:02 AM today
  const startOfWindowUnix = fixedTimeUnix // 11:01 AM
  const endOfWindowUnix = fixedTimeUnix+ (10 * 60) // 11:02 AM

  // Check if current time is within the specified window
  if (nowUnix > startOfWindowUnix && nowUnix < endOfWindowUnix) {
    console.log('Processing appointments for fixed time window');

    try {
      const userDocs = await db.collection('users').get();

      userDocs.forEach(async (userDoc) => {
        const userId = userDoc.id;
        console.log(`Checking appointments for user: ${userId}`);

        const appointmentsCollectionRef = db.collection('users').doc(userId).collection('appointments');

        const query = appointmentsCollectionRef
          .where('sendWhatsAppReminder', '==', true)
          .where('appointmentdate', '==', todayDate);

        try {
          const snapshot = await query.get();

          if (!snapshot.empty) {
            snapshot.forEach(async (doc) => {
              const appointmentId = doc.id;
              console.log(`Processing appointment: ${appointmentId} for user: ${userId}`);
              const appointmentData = doc.data();

              // Extract necessary information for the WhatsApp message
              const { patientDetails,message} = appointmentData;
              const messageContent=message
              // Ensure patientDetails exists and extract the phone number
              const phone = patientDetails ? patientDetails.phone : null;
              const patientName=patientDetails.namef

              if (phone) { // Ensure phone number exists
                try {
                  // Send WhatsApp message using Twilio
                  const message = await client.messages.create({
                    contentSid: "HXf77adb5996726eb9c862715219723c0f", // Use your own contentSid
                    contentVariables: JSON.stringify({
                      1: patientName,
                      2: messageContent.doctorInfo.clinicName,
                      3: messageContent.timeArabic,
                      4: messageContent.dayArabic,
                    }),
                    from: 'whatsapp:+9647511431331', // Your Twilio WhatsApp-enabled number
                    to: `whatsapp:${phone}`,
                  });

                  console.log(`WhatsApp message sent: ${message.sid}`);

                  // Update Firestore document to reflect that the message was sent and schedule was updated
                  await appointmentsCollectionRef.doc(appointmentId).update({
                    sendWhatsAppReminder: false,  // Disable further messages for this appointment
                    messageSentAt: dayjs().unix(),  // Log the send time as Unix timestamp
                  });

                } catch (error) {
                  console.error(`Error sending WhatsApp message for appointment ${appointmentId}:`, error);
                }
              } else {
                console.log(`No phone number available for appointment ${appointmentId}, skipping.`);
              }
            });
          } else {
            console.log(`No appointments need processing for user: ${userId}`);
          }

        } catch (error) {
          console.error('Error querying appointments:', error);
        }
      });

    } catch (error) {
      console.error('Error fetching users:', error);
    }
  } else {
    console.log('Current time is not within the messaging window, skipping processing.');
  }
});


