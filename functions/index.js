const functions1 = require("firebase-functions/v1");
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { https } = require('firebase-functions/v2');
// Initialize Firebase app only if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp();
} else {
  admin.app(); // If already initialized, use the existing app
}
const db = admin.firestore();
const { getAuth } = require('firebase-admin/auth')
const { onSchedule } = require('firebase-functions/v2/scheduler');
const twilio = require('twilio');
const dayjs = require('dayjs');
require('dayjs/locale/ar'); // Import the Arabic locale
const localeData = require('dayjs/plugin/localeData');
const customParseFormat = require ('dayjs/plugin/customParseFormat')
dayjs.extend(localeData)
const { uid } = require("uid");

// On sign up.
exports.processSignUp = functions1.auth.user().onCreate(async (user) => {
  // Check if user meets role criteria.
  if (
    user.email
  ) {
    const customClaims = {
      doctor: true,
      accessLevel: 9,
      clinicId:'',
    };
  console.log(customClaims,'customClaims')
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
const authToken = 'f07ac30918bbb670322f4dddb4b66989';
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
exports.sendWhatsAppReservation = functions.https.onCall((request) => {
  const to = request.data.to; // e.g., 'whatsapp:+1234567890'
  const message = request.data.message; // e.g., 'Hello from my app!'
   console.log(request.data,'dataaa')
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
  dayjs.locale('ar') // Set the locale to Arabic
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
                    contentSid: "HXf77adb5996726eb9c862715219723c0f",
                    contentVariables: JSON.stringify({
                      1: patientName,
                      2: messageContent.clinicName,
                      3: messageContent.timeArabic,
                      4: messageContent.dayArabic,
                      5: messageContent.doctorName,
                    }),
                    from: 'whatsapp:+9647511431331',
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
exports.incomingWhatsAppMessage = https.onRequest(async (req, res) => {
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
    res.status(200).send('<Response><Message>Message received!</Message></Response>');
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
    res.status(500).send('Error processing incoming message');
  }
});
// adding Rent Function
// Scheduled function to run daily

exports.addRentPaymentOnSchedule = onSchedule("0 8 * * *", async (event) => {
  try {
    const today = dayjs();
    const todayDayOfMonth = today.date(); // Day of the month (1-31)
    const todayDate = today.format("YYYY-MM-DD");
    const formattedDate = today.format("MMM D, YYYY");
    const todayUnix = today.valueOf();

    const usersSnapshot = await admin.firestore().collection("users").get();

    usersSnapshot.forEach(async (userDoc) => {
      const userId = userDoc.id; // Get the user ID
      const userData = userDoc.data();
      const scheduledInvoices = userData.scheduledInvoices;

      if (Array.isArray(scheduledInvoices)) {
        scheduledInvoices.forEach(async (item) => {
          const itemDate = dayjs(item.date); // Start date
          const itemDayOfMonth = itemDate.date(); // Day of the month for item.date
          const itemMonth = itemDate.month(); // Month (0-indexed, January is 0)
          const paymentTerms = item.paymentTerms;
          const repeat=item.repeat;
          const repeatInterval=parseInt(repeat);
          const paymentInterval = parseInt(paymentTerms); // Convert to integer
          const invoiceId = uid(6); // Generate unique invoice ID
          const workId = uid();
          const price = item.price || 0; // Default price
          const currency = item.currency || "IQD"; // Default currency
          const category=item.category || 'fixed'
          const patientId=item.patientId
          const doctor=item.doctor
          const invoiceRef = admin
            .firestore()
            .collection("users")
            .doc(userDoc.id)
            .collection("invoices")
            .doc(invoiceId);

          const paymentRef = invoiceRef.collection("payments").doc();

          if (repeat === "monthly") {
            // Handle "monthly" payments
            if (todayDayOfMonth === itemDayOfMonth) {
              await createInvoiceAndPayment({
                invoiceRef,
                paymentRef,
                userId,
                formattedDate,
                todayUnix,
                todayDate,
                item,
                workId,
                invoiceId,
                price,
                currency,
                category,
                patientId,
                doctor,
                paymentTerms,
              });
            }
          } else if (repeat === "yearly") {
            // Handle "yearly" payments
            if (todayDayOfMonth === itemDayOfMonth && today.month() === itemMonth) {
              await createInvoiceAndPayment({
                invoiceRef,
                paymentRef,
                userId,
                formattedDate,
                todayUnix,
                todayDate,
                item,
                workId,
                invoiceId,
                price,
                currency,
                category,
                patientId,
                doctor,
                paymentTerms,
              });
            }
          } else if (repeatInterval > 0 && repeat !== "monthly" && repeat !== "yearly") {
            // Handle periodic payments based on `paymentInterval`
            const daysSinceStart = today.diff(itemDate, "day"); // Days since start date

            if (daysSinceStart >= 0 && daysSinceStart % paymentInterval === 0) {
              await createInvoiceAndPayment({
                invoiceRef,
                paymentRef,
                userId,
                formattedDate,
                todayUnix,
                todayDate,
                item,
                workId,
                invoiceId,
                price,
                currency,
                category,
                patientId,
                doctor,
                paymentTerms,
              });
            }
          } else {
            // Log invalid repeat
            console.warn(
              `Invalid repeat '${repeat}' for user: ${userId}, item: ${JSON.stringify(
                item
              )}`
            );
          }
        });
      } else {
        console.log(`No FixedInvoices for user: ${userId}`);
      }
    });

    console.log("Rent payments added successfully.");
  } catch (error) {
    console.error("Error adding rent payments:", error);
  }
});

async function createInvoiceAndPayment({
  invoiceRef,
  paymentRef,
  userId,
  formattedDate,
  todayUnix,
  todayDate,
  item,
  workId,
  invoiceId,
  price,
  currency,
  category,
  patientId,
  doctor,
  paymentTerms
}) {
  // Set invoice data
  await invoiceRef.set({
    invoiceId,
    invoiceDate: formattedDate,
    invoiceDateUnix: todayUnix,
    deletedDateUnix: null,
    uid: userId,
    category,
    patientId,
    workItemList: [
      {
        color: item.color,
        currency,
        doctor,
        label: item.label,
        price,
        workId,
        paymentTerms,
        invoiceId,
      },
    ],
  });

  // Handle autopayment
  if (item.autopay) {
    if (Array.isArray(doctor)) {
      // Iterate over each doctor in the array
      for (const doctorEntry of doctor) {
        const { doctorId, percentage } = doctorEntry;

        if (!doctorId || !percentage) {
          console.warn(
            `Invalid doctor data for item: ${JSON.stringify(item)}, skipping entry: ${JSON.stringify(doctorEntry)}`
          );
          continue;
        }

        const doctorPayment = (price * percentage) / 100;

        // Create payment document for each doctor
        const doctorPaymentRef = paymentRef.parent.doc(); // Generate a unique payment ID for each payment
        await doctorPaymentRef.set({
          paid: doctorPayment,
          mode: "cash",
          type: "expense",
          category,
          dateUnix: todayUnix,
          date: todayDate,
          doctorId,
          invoiceId,
          currency,
          uid: userId,
          workId,
          patientId,
        });
      }
    } else {
      // Handle single doctor case
      await paymentRef.set({
        paid: price,
        mode: "cash",
        type: "expense",
        category,
        dateUnix: todayUnix,
        date: todayDate,
        doctorId: doctor?.doctorId || userId,
        invoiceId,
        currency,
        uid: userId,
        workId,
        patientId,
      });
    }
  }

  console.log(`Added rent payment for user: ${userId}`);
}
