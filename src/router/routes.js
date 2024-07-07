import MainLayout from '/src/layouts/MainLayout.vue'
import Dashboard from '/src/pages/Dashboard.vue'
import Patients from '/src/pages/Patients.vue'
import EditPatient from 'src/pages/EditPatient.vue'
import Auth from 'src/pages/Auth.vue'
import Calendar from 'src/pages/Calendar.vue'
import Invoices from'src/pages/Invoices.vue'
import invoice from 'src/pages/InvoiceView.vue'
import PatientDetails from 'src/pages/PatientDetails.vue'
import Treasury from 'src/pages/Treasury.vue'

const routes = [
  {
    path: '/',
    component:MainLayout,
    children: [
      { path: '/',
      component: Dashboard,
      name:'dashboard'
      },
      { path: '/Patients',
      component: Patients,
      name:'Patients'
      },
      { path: '/Patients/:patientId',
      component: PatientDetails,
      name:'PatientDetails'
      },
      { path: '/editPatient/:patientId',
      component: EditPatient,
      name:'editpatient'
      },
      { path: '/auth',
      component: Auth,
      name:'auth'
      },
      { path: '/Calendar',
      component: Calendar,
      name:'calendar'
      },
      { path: '/Invoices',
      component: Invoices,
      name:'invoices'
      },
      { path: '/Invoices/:invoiceId',
      component: invoice,
      name: 'Invoice',
      },
      { path: '/Treasury',
      component: Treasury,
      name:'treasury'
      },

    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
