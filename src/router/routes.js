import MainLayout from '/src/layouts/MainLayout.vue'
import Dashboard from '/src/pages/Dashboard.vue'
import Patients from '/src/pages/Patients.vue'
import EditPatient from 'src/pages/EditPatient.vue'
import Auth from 'src/pages/Auth.vue'
import Calendar from 'src/pages/Calendar.vue'
import Invoices from'src/pages/Invoices.vue'
import invoice from 'src/pages/InvoiceView.vue'
import PatientDetails from 'src/pages/PatientDetails.vue'
import Transactions from 'src/pages/Transactions.vue'
import FormsLayout from 'src/layouts/FormsLayout.vue'
import ProfileForm from 'src/components/Settings/ProfileForm.vue'
import AccountForm from 'src/components/Settings/AccountForm.vue'
import AppearanceForm from 'src/components/Settings/AppearanceForm.vue'
import Settings from 'src/pages/Settings.vue'
import StaffMangement from 'src/pages/StaffMangement.vue'
import Inventory from 'src/pages/Inventory.vue'
import Analytics from 'src/pages/Analytics.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '/',
        component: Dashboard,
        name: 'dashboard',
        props: route => ({ toggleSidebar: route.meta.toggleSidebar }),
      },
      {
        path: '/Patients',
        component: Patients,
        name: 'Patients'
      },
      {
        path: '/Patients/:patientId',
        component: PatientDetails,
        name: 'PatientDetails'
      },
      {
        path: '/editPatient/:patientId',
        component: EditPatient,
        name: 'editpatient'
      },
      {
        path: '/auth',
        component: Auth,
        name: 'auth'
      },
      {
        path: '/Calendar',
        component: Calendar,
        name: 'calendar'
      },
      {
        path: '/Invoices',
        component: Invoices,
        name: 'invoices'
      },
      {
        path: '/staff',
        component: StaffMangement,
        name: 'staff'
      },
      {
        path: '/inventory',
        component: Inventory,
        name: 'inventory'
      },
      {
        path: '/analytics',
        component: Analytics,
        name: 'analytics'
      },
      {
        path: '/settings',
        component: Settings,
        children: [
          {
            path: 'profile',
            component: ProfileForm,
            name: 'profile'
          },
          {
            path: 'account',
            component: AccountForm,
            name: 'account'
          },
          {
            path: 'appearance',
            component: AppearanceForm,
            name: 'appearance'
          },
          {
            path: 'notifications',
            component: () => import('src/components/Settings/NotificationsForm.vue'),
            name: 'notifications'
          },
          {
            path: 'display',
            component: () => import('src/components/Settings/DisplayForm.vue'),
            name: 'display'
          }
        ]
      },
      {
        path: '/Invoices/:invoiceId',
        component: invoice,
        name: 'Invoice'
      },
      {
        path: '/Transactions',
        component: Transactions,
        name: 'transactions'
      }
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
