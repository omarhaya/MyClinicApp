import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,orderBy,addDoc,deleteDoc,doc,updateDoc,getDocs,collectionGroup,writeBatch,deleteField
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
import dayjs from 'dayjs';
import {modalController, } from '@ionic/vue';
import { useQuasar } from 'quasar'
import { functions } from 'src/js/firebase'
import { httpsCallable } from 'firebase/functions';
import 'dayjs/locale/ar' // Import Arabic locale
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { computed } from 'vue'

let appointmentsCollectionRef
let appointmentsCollectionQuery
let getAppointmentsSnapshot=null

export const useStoreAppointments= defineStore('storeAppointments', {
  state: () => {
    const storeAuth=useStoreAuth()
    return {
       loading:null,
       appointments:[],
       transition:'',
       dayAppointments:[],
       selectedDate:today(),
       storeAuth,
       menu:[],
       $q:useQuasar(),
       modal:false,
    }
  },

  actions:{
    init(){
      if(this.storeAuth.role.doctor&&this.storeAuth.role.clinicId!==''){
        appointmentsCollectionRef = collection(db, 'users',this.storeAuth.role.clinicId,'appointments')
        }
        else {appointmentsCollectionRef = collection(db, 'users',this.storeAuth.user.uid,'appointments')}
      // this.updateInvoices()
   },
   async updateInvoices() {
    try {
      // const doctorsIds = doctors.map(doctor => doctor.doctorId);
      const invoicesCollectionAllRef = collectionGroup(db, 'appointments');
      const invoicesCollectionAllQuery = query(invoicesCollectionAllRef, );

      const snapshot = await getDocs(invoicesCollectionAllQuery);

      const batch =  writeBatch(db) // Use the batch function from Firestore

      snapshot.forEach(doc => {
        const invoiceData = doc.data();

        if (invoiceData && invoiceData.doctorId && Array.isArray(invoiceData.doctorId) && invoiceData.doctorId.length > 0) {
          // Choose the first item in the doctorId array
          const updatedData = {
            ...invoiceData,
            // doctorId: invoiceData.doctorId[0],  // Use the first element of the doctorId array
          };
          const invoiceRef = doc.ref;
          batch.update(invoiceRef, updatedData);
        }
      });

      await batch.commit();
      console.log('Updated invoice data successfully');
    } catch (error) {
      console.error('Error updating invoice data:', error);
    }
  },
  // Calendar View
  async getDayAppointments(appointmentDate) {
    this.loadingAppointments = false;
    const q = query(appointmentsCollectionRef, where("appointmentdate", "==", appointmentDate));
    onSnapshot(q, (querySnapshot) => {
      const fbAppointments = [];
      querySnapshot.forEach((doc) => {
        const appointment = {
          appointmentId: doc.id,
          details: doc.data().details,
          date: doc.data().date,
          patientDetails: doc.data().patientDetails,
          title:doc.data().patientDetails.namef,
          completed: doc.data().completed,
          resourceIds: [doc.data().doctorId],
          start: doc.data().start,
          end: doc.data().end,
          status: doc.data().status || 'booked',
          constraint: 'availableForAppointment',
          background:'orange',
          sendWhatsAppReminder:doc.data().sendWhatsAppReminder,
          sendWhatsAppMessage:doc.data().sendWhatsAppMessage,
        };
        fbAppointments.push(appointment);
      });

      // Add the default event to each day's appointments
      const defaultEvent = {
        groupId: 'availableForAppointment',
        display: 'background',
        rrule: {
          freq: 'weekly',
          byweekday: ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'],
          dtstart: dayjs().format('YYYY-MM-DDT11:00:00'),
          until: false,
        },
        duration: '10:00',
        resourceIds: this.storeAuth.doctors.map(doctor => doctor.doctorId),
        color: '#257e4a',
      };
console.log(defaultEvent,'default event')
      fbAppointments.push(defaultEvent);

      this.dayAppointments[appointmentDate] = fbAppointments;
      console.log(this.dayAppointments, 'emy');
    });
    this.loadingAppointments = false;
  },


    // Patient View
    async getAppointments(patientId) {
      appointmentsCollectionQuery = query(appointmentsCollectionRef, where("patientDetails.patientId", "==",patientId),orderBy("date","desc"))
      this.loadingAppointments=true

          getAppointmentsSnapshot=onSnapshot(appointmentsCollectionQuery, (querySnapshot) => {
          const appointments=[]
          querySnapshot.forEach((doc) => {
          let appointment= {
          appointmentId: doc.id,
          details: doc.data().details,
          date: doc.data().date,
          title: doc.data().patientDetails.namef,
          doctor: this.storeAuth.doctors.find(doctor => doctor.doctorId === doc.data().doctorId).name,

          start: doc.data().start.substring(11),
          end: doc.data().end.substring(11),
          appointmentdate:doc.data().appointmentdate,
          status:doc.data().status||'booked',
          patientId:doc.data().patientDetails.patientId,
          constraint: 'availableForAppointment',
          background:'orange',
          }
          appointment.status=appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
          appointments.push(appointment)
          })
          this.appointments[patientId]=appointments

          console.log(this.appointments[patientId],'xxxxx')

       this.loadingAppointments=false
        // this.updateAppointmentFields()
        },error=>{
          console.log('error',error.message)
      })
   },
  //  async updateAppointmentFields() {
  //   try {
  //     const appointmentsRef = collection(db, 'appointments'); // Replace 'appointments' with your collection name
  //     const appointmentsQuery = await getDocs(appointmentsCollectionRef);

  //     const batch = writeBatch(db);

  //     appointmentsQuery.forEach((doc) => {
  //       const appointmentData = doc.data();

  //       if (appointmentData.id || appointmentData.patientid) {
  //         const updatedData = {
  //           ...appointmentData,
  //           appointmentId: appointmentData.id, // Rename 'id' field to 'appointmentId'
  //           patientId: appointmentData.patientid // Rename 'patientid' field to 'patientId'
  //         };

  //         delete updatedData.id; // Remove the 'id' field
  //         delete updatedData.patientid; // Remove the 'patientid' field

  //         const appointmentRef = doc.ref;
  //         batch.update(appointmentRef, updatedData);
  //       }
  //     });

  //     await batch.commit();
  //     console.log('Appointment fields updated successfully');
  //   } catch (error) {
  //     console.error('Error updating appointment fields:', error);
  //   }
  // },
  async addAppointment(newAppointmentDetails) {
    this.loading = true;
    if(!newAppointmentDetails.title.phone){newAppointmentDetails.sendWhatsAppReminder=false,newAppointmentDetails.sendWhatsAppMessage=false}
    try {
          // Calculate the sendAt timestamp for 11:00 AM on the appointment date
      const appointmentDate = dayjs(newAppointmentDetails.startDate);
      const sendAt = appointmentDate.set('hour', 11).set('minute', 0).toDate(); // 11:00 AM on the appointment day
      // Add appointment to Firestore
      const appointmentDocRef = await addDoc(appointmentsCollectionRef, {
        start: newAppointmentDetails.startDate + 'T' + newAppointmentDetails.startTime,
        end: newAppointmentDetails.startDate + 'T' + newAppointmentDetails.endTime,
        patientDetails: newAppointmentDetails.title,
        doctorId: newAppointmentDetails.doctor.doctorId,
        appointmentdate: dayjs(newAppointmentDetails.startDate).format('YYYY-MM-DD'),
        date: new Date().getTime().toString(),
        sendWhatsAppReminder:newAppointmentDetails.sendWhatsAppReminder || false,
        sendWhatsAppMessage:newAppointmentDetails.sendWhatsAppMessage || false,
      });

      modalController.dismiss(null, 'confirm');

      this.$q.notify({
        icon: 'done',
        color: 'positive',
        message: 'Appointment Added',
        actions: [{ label: 'Dismiss', color: 'white', handler: () => {} }],
      });

      // Check if WhatsApp message is enabled and phone number is provided
      if (newAppointmentDetails.sendWhatsAppMessage && newAppointmentDetails.title.phone) {
        dayjs.extend(customParseFormat)
        const time = dayjs(newAppointmentDetails.startTime, 'HH:mm').locale('ar')
        const timeArabic = time.format('hh:mm A').replace('ص', 'صباحاً').replace('م', 'مساءً');
        const dayArabic = dayjs(newAppointmentDetails.startDate).locale('ar').format('dddd');
        const type = 'حجز';
        const doctorInfo = computed(() => {
          if (this.storeAuth.role.clinicId !== '') {
            return {
              clinicName:this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.role.clinicId).name,
              doctorName:this.storeAuth.doctors.find(doctor => doctor.doctorId === newAppointmentDetails.doctor.doctorId).name
            }
          } else {
            if (this.storeAuth.doctors.length > 1) {
              return {
                clinicName:this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.user.uid).name,
                doctorName:this.storeAuth.doctors.find(doctor => doctor.doctorId === newAppointmentDetails.doctor.doctorId).name
              }
            } else {
              return {
                clinicName:this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.user.uid).name,
                doctorName:this.storeAuth.doctors.find(doctor => doctor.doctorId === newAppointmentDetails.doctor.doctorId).name
              }
            }
          }
        });
        console.log(doctorInfo);
        const sendWhatsAppReservatiion = httpsCallable(functions, 'sendWhatsAppReservatiion');
        const result = await sendWhatsAppReservatiion({
          to: `whatsapp:${newAppointmentDetails.title.phone}`,  // Recipient's WhatsApp number
          message: { startDate: newAppointmentDetails.startDate, doctorInfo: doctorInfo.value, timeArabic, dayArabic, type }
        });
        console.log('Message sent:', result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.loading = false;
    }
  },
    clearAppointments(){
      this.appointments=[]
      console.log(this.appointments,'cleared')
      if (getAppointmentsSnapshot) getAppointmentsSnapshot() //unsubscribe from any active listener
    },
    async deleteAppointment(appointmentDetails) {
      this.loading = true;
      try {
        // Delete appointment to Firestore
        await deleteDoc(doc(appointmentsCollectionRef, appointmentDetails.extendedProps.appointmentId))

        this.$q.notify({
          icon: 'done',
          color: 'negative',
          message: 'Appointment deleted',
          actions: [{ label: 'Dismiss', color: 'white', handler: () => {} }],
        });

        // Sending WhatsApp Message
        // if (appointmentDetails.extendedProps.patientDetails.phone !==null&&appointmentDetails.extendedProps.patientDetails.phone!==''){
        //   dayjs.extend(customParseFormat)
        //   appointmentDetails.doctor=this.storeAuth.doctors.find(doc => doc.doctorId === appointmentDetails._def.resourceIds[0])

        //   const time = dayjs(appointmentDetails.startStr).locale('ar')
        //   const timeArabic=time.format('hh:mm A').replace('ص', 'صباحاً').replace('م', 'مساءً');
        //   const dayArabic=dayjs(time).locale('ar').format('dddd')
        //   const date = dayjs(time).locale('ar').format('YYYY-MM-DD')
        //   const doctor=computed(()=>{
        //     if(this.storeAuth.role.clinicId!=='') {
        //       return this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.role.clinicId).name}
        //      else {
        //       if(this.storeAuth.doctors.length>1) {
        //         return (this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.user.uid).name)
        //       }
        //        else {
        //         return ('الدكتور'+' '+this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.user.uid).name)
        //        }
        //     }})
        //   const sendWhatsAppCancel = httpsCallable(functions, 'sendWhatsAppCancel')
        //   const result = await sendWhatsAppCancel({
        //     to: `whatsapp:${appointmentDetails.extendedProps.patientDetails.phone}`,  // Recipient's WhatsApp number
        //     message: {startDate:date,doctor:doctor.value,timeArabic,dayArabic}
        //   });
        //   console.log('Message sent:', result.data);
        // }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }

    },
    // async updateAppointment(id,appointment){
    //   await updateDoc(doc(appointmentsCollectionRef, id), {
    //     namef:appointment.namef,
    //     age:appointment.age,
    //     phone:appointment.phone,
    //     gender:appointment.gender,
    //     updatedDate:Date.now()
    //   })
    // },
    // async completeAppointment(appointment){
    //   await updateDoc(doc(appointmentsCollectionRef, appointment.id), {
    //     completed:!appointment.completed,
    //   })
    // },
    async dropAppointment(appointment){
      this.loading=true
      try {
        console.log(appointment,'appointmed dropped')
        await updateDoc(doc(appointmentsCollectionRef, appointment.appointmentId), {
        start: appointment.startDate+'T'+appointment.startTime,
        end:appointment.startDate+'T'+appointment.endTime,
        patientDetails: appointment.patientDetails,
        appointmentdate:dayjs(appointment.startDate).format('YYYY-MM-DD'),
        doctorId: appointment.doctor.doctorId,
        })
        this.$q.notify({
          icon: 'done',
          color: 'positive',
          message: 'Appointment Re-Scheduled',
          actions: [{ label: 'Dismiss', color: 'white', handler: () => {} }],
        });

        // Sending WhatsApp Message
        // if (appointment.patientDetails.phone !==null&&appointment.patientDetails.phone!==''){
        //   dayjs.extend(customParseFormat)
        //   const time = dayjs(appointment.startTime,'HH:mm').locale('ar')
        //   const timeArabic=time.format('hh:mm A').replace('ص', 'صباحاً').replace('م', 'مساءً');
        //   const dayArabic=dayjs(time).locale('ar').format('dddd')
        //   const doctor=computed(()=>{
        //     if(this.storeAuth.role.clinicId!=='') {
        //       return this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.role.clinicId).name}
        //      else {
        //       if(this.storeAuth.doctors.length>1) {
        //         return (this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.user.uid).name)
        //       }
        //        else {
        //         return ('الدكتور'+' '+this.storeAuth.doctors.find(doctor => doctor.doctorId === this.storeAuth.user.uid).name)
        //        }
        //     }})
        //   const sendWhatsAppChange = httpsCallable(functions, 'sendWhatsAppChange')
        //   const result = await sendWhatsAppChange({
        //     to: `whatsapp:${appointment.patientDetails.phone}`,  // Recipient's WhatsApp number
        //     message: {startDate:appointment.startDate,doctor:doctor.value,timeArabic,dayArabic}
        //   });
        //   console.log('Message sent:', result.data);
        // }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
      try {

    } catch (error) {
      console.error('Error updating appointment: ', error);
    }
    }

  },



  getters:{
    // getAppointmentByDoctor: (state)=>{
    //   return (doctor) =>{
    //    return state.appointments.filter(appointment=> appointment.doctor===doctor)

    //   }
    //  },
    // getAppointmentsday: (state)=>{
    //   return () =>{
    //    return state.dayAppointments

    //   }
    //  },
    }

})

