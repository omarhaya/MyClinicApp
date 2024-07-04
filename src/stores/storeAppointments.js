import { defineStore } from 'pinia'
import {
  collection, onSnapshot,where,
  query,orderBy,addDoc,deleteDoc,doc,updateDoc,writeBatch,getDocs
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import { useStoreAuth } from './storeAuth'
import {today} from '@quasar/quasar-ui-qcalendar/src/index.js'
import dayjs from 'dayjs';

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
    }
  },

  actions:{
    init(){
      const storeAuth=useStoreAuth()
      appointmentsCollectionRef = collection(db, 'users',storeAuth.user.uid,'appointments')
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
          title: doc.data().patientname,
          completed: doc.data().completed,
          resourceIds: doc.data().doctor,
          start: doc.data().start,
          end: doc.data().end,
          status: doc.data().status || 'booked',
          constraint: 'availableForAppointment',
          background:'pink',
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
          dtstart: dayjs().format('YYYY-MM-DDT15:00:00'),
          until: false,
        },
        duration: '06:00',
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
      appointmentsCollectionQuery = query(appointmentsCollectionRef, where("patientId", "==",patientId),orderBy("date","desc"))
      this.loadingAppointments=true

          getAppointmentsSnapshot=onSnapshot(appointmentsCollectionQuery, (querySnapshot) => {
          const appointments=[]
          querySnapshot.forEach((doc) => {
          let appointment= {
          appointmentId: doc.id,
          details: doc.data().details,
          date: doc.data().date,
          title: doc.data().patientname,
          doctor: doc.data().doctor,
          start: doc.data().start.substring(11),
          end: doc.data().end.substring(11),
          appointmentdate:doc.data().appointmentdate,
          status:doc.data().status||'booked',
          patientId:doc.data().patientId
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
   // Add Appointment
    async addAppointment (newAppointmentDetails) {
      console.log(this.loading,'ading')
      let currentDate = new Date().getTime(),
          date = currentDate.toString()
    await addDoc(appointmentsCollectionRef, {
      start: newAppointmentDetails.startDate+'T'+newAppointmentDetails.startTime,
      end:newAppointmentDetails.startDate+'T'+newAppointmentDetails.endTime,
      patientname: newAppointmentDetails.title,
      doctor: newAppointmentDetails.doctor,
      appointmentdate:dayjs(newAppointmentDetails.startDate).format('YYYY-MM-DD'),
      // patientId:newAppointmentDetails.title.patientId,
     
      // duration: newAppointmentDetails.duration,
      // details:newAppointmentDetails.details,
      // appointmentdate: newAppointmentDetails.startDate,
      // status:newAppointmentDetails.status,
      // bgcolor: newAppointmentDetails.bgcolor,
      date,

    })
    console.log(newAppointmentDetails,'newAppointmentDetails')
    console.log(this.loading,'added')
    },
    clearAppointments(){
      this.appointments=[]
      console.log(this.appointments,'cleared')
      if (getAppointmentsSnapshot) getAppointmentsSnapshot() //unsubscribe from any active listener
    },
    async deleteAppointment(idToDelete) {
      await deleteDoc(doc(appointmentsCollectionRef, idToDelete))
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
      await updateDoc(doc(appointmentsCollectionRef, appointment.appointmentId), {
      start: appointment.startDate+'T'+appointment.startTime,
      end:appointment.startDate+'T'+appointment.endTime,
      patientname: appointment.title,
      appointmentdate:dayjs(appointment.startDate).format('YYYY-MM-DD'),
      // patientId:newAppointmentDetails.title.patientId,
      doctor: appointment.doctor,
      })
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

