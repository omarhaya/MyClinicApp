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

//Twilio messeaging
//appointment_reservation
const accountSid = '';
const authToken = '';
const client = new twilio(accountSid, authToken);

exports.sendWhatsAppAppointment = functions.https.onCall((data, context) => {
  const to = data.to; // e.g., 'whatsapp:+1234567890'
  const message = data.message; // e.g., 'Hello from my app!'

  return client.messages.create({
    contentSid: "",
    contentVariables: JSON.stringify({
      1: message.timeArabic,
      2: message.doctor,
      3: message.dayArabic,
      4: message.startDate,
    }),
      from: '', // Your Twilio WhatsApp-enabled number
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
    contentSid: "",
    contentVariables: JSON.stringify({
      1: message.timeArabic,
      2: message.doctor,
      3: message.dayArabic,
      4: message.startDate,
    }),
      from: '', // Your Twilio WhatsApp-enabled number
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
    contentSid: "",
    contentVariables: JSON.stringify({
      1: message.timeArabic,
      2: message.doctor,
      3: message.dayArabic,
      4: message.startDate,
    }),
      from: '', // Your Twilio WhatsApp-enabled number
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
    contentSid: "",
    contentVariables: JSON.stringify({
      5: message.timeArabic,
      1: message.doctorInfo.clinicName,
      4: message.dayArabic,
      6: message.startDate,
      2: 'حجز',
      3:message.doctorInfo.doctorName
    }),
      from: '', // Your Twilio WhatsApp-enabled number
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
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  const nowUnix = Math.floor(now.getTime() / 1000);

  const fixedTime = new Date();
  fixedTime.setHours(8, 0, 0, 0);
  const fixedTimeUnix = Math.floor(fixedTime.getTime() / 1000);

  const startOfWindowUnix = fixedTimeUnix;
  const endOfWindowUnix = fixedTimeUnix + 60 * 60;

  if (nowUnix > startOfWindowUnix && nowUnix < endOfWindowUnix) {
    console.log('Processing appointments for fixed time window');

    try {
      const userDocs = await db.collection('users').get();

      userDocs.forEach(async (userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const userRole = userData.role;

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

              const { patientDetails, start, doctorId } = appointmentData;
              dayjs.extend(customParseFormat);
              const startTime = start.split('T')[1].slice(0, 5);
              const startDate = start.slice(0, 10);
              const time = dayjs(startTime, 'HH:mm').locale('ar');
              const timeArabic = time.format('hh:mm A').replace('ص', 'صباحاً').replace('م', 'مساءً');
              const dayArabic = dayjs(startDate).locale('ar').format('dddd');
              const type = 'حجز';
              console.log(startTime,'startTime',startDate,'startDate',timeArabic,'timeArabic',dayArabic,'dayArabic')
              // Check if userData.doctors is an array
              const doctorInfo = (() => {
                const doctorsArray = Object.values(userData.doctors); // Convert the doctors object to an array

                if (userRole.clinicId !== '') {
                  const clinicDoctor = doctorsArray.find(doctor => doctor.doctorId === userRole.clinicId);
                  const assignedDoctor = doctorsArray.find(doctor => doctor.doctorId === doctorId);
                  return {
                    clinicName: clinicDoctor ? clinicDoctor.name : 'Unknown Clinic',
                    doctorName: assignedDoctor ? assignedDoctor.name : 'Unknown Doctor'
                  };
                } else {
                  if (doctorsArray.length > 1) {
                    const clinicDoctor = doctorsArray.find(doctor => doctor.doctorId === userId);
                    const assignedDoctor = doctorsArray.find(doctor => doctor.doctorId === doctorId);
                    return {
                      clinicName: clinicDoctor ? clinicDoctor.name : 'Unknown Clinic',
                      doctorName: assignedDoctor ? assignedDoctor.name : 'Unknown Doctor'
                    };
                  } else {
                    const clinicDoctor = doctorsArray.find(doctor => doctor.doctorId === userId);
                    const assignedDoctor = doctorsArray.find(doctor => doctor.doctorId === doctorId);
                    return {
                      clinicName: clinicDoctor ? clinicDoctor.name : 'Unknown Clinic',
                      doctorName: assignedDoctor ? assignedDoctor.name : 'Unknown Doctor'
                    };
                  }
                }
              })();
               console.log(doctorInfo,'doctorInfo')
              const messageContent = {
                startDate: startDate,
                clinicName: doctorInfo.clinicName,
                doctorName: doctorInfo.doctorName,
                timeArabic,
                dayArabic,
                type
              };
                console.log(messageContent,'messageContent')
              const phone = patientDetails ? patientDetails.phone : null;
              const patientName = patientDetails.namef;

              if (phone) {
                try {
                  console.log(messageContent);
                  const message = await client.messages.create({
                    contentSid: "",
                    contentVariables: JSON.stringify({
                      1: patientName,
                      2: messageContent.clinicName,
                      3: messageContent.timeArabic,
                      4: messageContent.dayArabic,
                      5: messageContent.doctorName,
                    }),
                    from: '',
                    to: `whatsapp:${phone}`,
                  });

                  console.log(`WhatsApp message sent: ${message.sid}`);

                  await appointmentsCollectionRef.doc(appointmentId).update({
                    sendWhatsAppReminder: false,
                    messageSentAt: dayjs().unix(),
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

// Incoming WhatsApp message handler
exports.incomingWhatsAppMessage = functions.https.onRequest(async (req, res) => {
  const messageSid = req.body.MessageSid;
  const from = req.body.From; // The sender (e.g., 'whatsapp:+1234567890')
  const to = req.body.To;     // Your Twilio WhatsApp number
  const body = req.body.Body; // The incoming message body

  console.log(`Received WhatsApp message from ${from}: ${body}`);

  try {
    // Store the incoming message in Firestore
    await db.collection('whatsappMessages').add({
      messageSid: messageSid,
      from: from,
      to: to,
      body: body,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send a response back to Twilio
    // res.status(200).send('<Response><Message>Message received!</Message></Response>');

  } catch (error) {
    console.error('Error saving message to Firestore:', error);
    res.status(500).send('Error processing incoming message');
  }
});
