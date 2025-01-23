<template>
  <ion-page ref="page">
    <ion-header v-if="mobile" :translucent="true">
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-header collapse="condense">
        <ion-toolbar class="home container">
          <ion-title size="large">Dashboard</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="row">
        <CardWidgetIcons class="col-12 col-md card-widget" :prefix="'IQD'" :value="currentMonthPaymentsData" icon="card" label="Payments" />
        <CardWidgetIcons class="col-12 col-md card-widget" :value="currentMonthAppointmentsCount" icon="calendar" label="Appointments" />
        <CardWidgetIcons class="col-12 col-md card-widget" :value="currentMonthPatientsCount" icon="person"  label="New Clients" />
        <CardWidgetIcons class="col-12 col-md card-widget" :value="storeWorks.totalPriceThisMonth" icon="newspaper" label="Invoices" />
      </div>
      <div class="row">
        <div class="col-12 col-md">
          <ion-card>
            <ion-card-header>
              <ion-card-title class="text-h6">
                Upcoming Appointments
              </ion-card-title>
            </ion-card-header>

            <ion-card-content style="min-height: 300px;" class="monthly-line-chart-wrapper">
              <ion-list v-if="groupedAppointmentsByDate.length > 0">
                <ion-item-group v-for="group in groupedAppointmentsByDate" :key="group.id">
                  <ion-item-divider sticky>
                    <ion-label>{{ group.id }}</ion-label>
                  </ion-item-divider>
                  <ion-item-sliding v-for="session in group.sessions" :key="session.appointmentId">
                    <ion-card>
                    <ion-item >
                      <ion-label :style="getLabelStyle('primary')">
                        <h3>{{ session.title }}</h3>
                        <p>
                          {{ dayjs(session.start, "HH:mm").format("h:mm A") + ' - ' + dayjs(session.end, "HH:mm").format("h:mm A") }}
                        </p>
                      </ion-label>
                    </ion-item>
                  </ion-card>
                    <!-- <ion-item-options>
                      <ion-item-option color="favorite" @click="addFavorite(session)">
                        Favorite
                      </ion-item-option>
                      <ion-item-option color="danger" @click="removeFavorite(session)">
                        Remove
                      </ion-item-option>
                    </ion-item-options> -->
                  </ion-item-sliding>
                </ion-item-group>
                <div style="display: flex; justify-content: center; margin-top: 16px;">
                <q-btn
                  :loading="storeAppointments.loadingAppointments"
                  flat
                  color="secondary"
                  @click="storeAppointments.limit += 2; storeAppointments.getMyAppointments()"
                  label="Load More..."
                />
              </div>
              </ion-list>
              <div v-else> No Upcoming Appointments</div>
              <!-- Center-aligned Button -->

            </ion-card-content>
          </ion-card>
        </div>
        <div class="col-12 col-md">
        <ion-card>
             <!-- Wrapping div to apply touch handlers -->
        <ion-card-content
            style="height: 300px;"
            ref="monthlyLineChart"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            class="monthly-line-chart-wrapper  ">
         <MonthlyPaymentLineChart :paymentsData="paymentsData"/>
        </ion-card-content>
      </ion-card>
    </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  IonCard,
  IonCardContent,
  IonTitle,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButton, IonItem, IonList, IonPopover
} from '@ionic/vue';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useStorePayments } from 'src/stores/storePayments';
import MonthlyPaymentLineChart from 'src/components/Charts/MonthlyPaymentLineChart.vue';
import CardWidgetIcons from 'src/components/CardWidgetIcons.vue';
import { Platform } from 'quasar';
import { useStorePatients } from 'src/stores/storePatients';
import { useStoreAppointments } from 'src/stores/storeAppointments';
import { useStoreWorks } from 'src/stores/storeWorks';
import { useStoreAuth } from 'src/stores/storeAuth';
import { defineEmits } from "vue";

// Define the event this component will emit
const emit = defineEmits(["toggle-sidebar"]);
dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);

const storePayments = useStorePayments();
const storePatients = useStorePatients()
const storeAppointments=useStoreAppointments()
const storeWorks=useStoreWorks()
const storeAuth=useStoreAuth()
const conversionRates = {
  '$': 1500, // 1 USD = 1500 IQD
  'EUR': 1700, // Example: 1 EUR = 1700 IQD
  'GBP': 2000, // Example: 1 GBP = 2000 IQD
  'IQD': 1, // IQD is the base currency
  // Add more currencies as needed
};
// Helper to format the date
function formatDate(date) {
  const today = dayjs();
  const nextWeek = today.add(7, 'day');
  const current = dayjs(date); // Ensure `current` is a Day.js object

  // Check if it's today
  if (current.isToday()) return 'Today';

  // Check if it's within the next 7 days
  if (current.isSameOrBefore(nextWeek, 'day')) return  current.format('dddd');

  // Beyond the next 7 days
  return current.format('dddd, MMMM D, YYYY');
}

// Group appointments by their date
const groupedAppointmentsByDate = computed(() => {
  const grouped = {};

  // Flatten all appointments into a single array
  const allAppointments = Object.values(storeAppointments.dayAppointments).flat();

  allAppointments.forEach((appointment) => {
    if (!appointment.groupId && appointment.resourceIds[0] === storeAuth.user.uid) {
      const dateKey = (appointment.appointmentdate) // Group by date (e.g., 2024-11-19)

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          id:formatDate(dateKey),
          date: appointment.date,
          sessions: [],
        };
      }

      grouped[dateKey].sessions.push(appointment);
    }
  });
  console.log(grouped,'grouped')
  // Convert the grouped object into an array and sort by date
  return Object.values(grouped).sort((a, b) =>
    dayjs(a.id).valueOf() - dayjs(b.id).valueOf()
  );
});
// Set the initial date range to the current year
onMounted(() => {
  const startDate = dayjs().startOf('year').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('year').format('YYYY-MM-DD');
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
  const currentMonthStart = dayjs().startOf('month').valueOf(); // Start of current month (Unix timestamp in milliseconds)
  const currentMonthEnd = dayjs().endOf('month').valueOf(); // End of current month (Unix timestamp in milliseconds)
  storePayments.selectedDateRange = { from: startDate, to: endDate };
  fetchPayments();
  storeAppointments.fetchMonthAppointments(startOfMonth,endOfMonth)
  storeWorks.fetchMonthWorksPrice(currentMonthStart,currentMonthEnd)
});

// Fetch payments based on the selected date range
const fetchPayments = async () => {
  if (storePayments.selectedDateRange?.from && storePayments.selectedDateRange?.to) {
    const startDate = storePayments.selectedDateRange.from;
    const endDate = storePayments.selectedDateRange.to;
    await storePayments.fetchPaymentsByDate(startDate, endDate);
  }
};

const paymentsData = computed(() => storePayments.getPaymentsByPeriod('day'));
// Calculate the number of patients added in the current month
const currentMonthPatientsCount = computed(() => {
  const startOfMonth = dayjs().startOf('month').valueOf(); // Start of the current month in milliseconds
  const endOfMonth = dayjs().endOf('month').valueOf(); // End of the current month in milliseconds

  return storePatients.patients.filter(patient =>
    patient.dateUnix >= startOfMonth && patient.dateUnix <= endOfMonth
  ).length;
});
const currentMonthAppointmentsCount = computed(() => {
  return storeAppointments.appointmentsCount
});
const currentMonthPaymentsData = computed(() => {
  const currentMonth = dayjs().format('YYYY-MM'); // Get the current month
  let totalSum = 0;

  // Iterate over all currencies in paymentsData
  Object.keys(paymentsData.value).forEach(currency => {
    const currencyData = paymentsData.value[currency];

    // Find the payment entry for the current month
    const currentMonthPayment = currencyData.find(payment => payment.date === currentMonth);

    if (currentMonthPayment) {
      // Get the conversion rate for the current currency
      const rate = conversionRates[currency];

      // Add the converted total to the sum
      totalSum += currentMonthPayment.total * rate;
    }
  });

  return totalSum;
});
watch(storePayments.selectedDateRange, fetchPayments);

const mobile = computed(() => {
  if (Platform.is.desktop) {
    return false;
  }
  if (Platform.is.mobile) {
    return true;
  }
  return false;
});

// Touch handling logic
const touchStartX = ref(0);
const touchStartY = ref(0);
const isScrollingVertically = ref(true);

// Handle touch start to detect initial coordinates
const handleTouchStart = (event) => {
  const touch = event.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  isScrollingVertically.value = true; // Reset scrolling direction
};

// Handle touch move to prevent vertical scrolling during horizontal swipe
const handleTouchMove = (event) => {
  const touch = event.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartX.value);
  const deltaY = Math.abs(touch.clientY - touchStartY.value);

  if (deltaX > deltaY) {
    // Horizontal scrolling detected
    isScrollingVertically.value = false;
    event.preventDefault(); // Prevent vertical scrolling
  }
};
 storeAppointments.getMyAppointments()
//style
const getLabelStyle = (track) => {
  let colorVar = track === "Ionic" ? "primary" : track.toLowerCase();
  return {
    borderLeft: `2px solid var(--ion-color-${colorVar})`,
    paddingLeft: "10px",
    marginTop: "12px",
    marginBottom: "12px"
  };
};
</script>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between; /* Add spacing between cards */
  gap: 10px; /* Ensure spacing between items */
  padding: 10px; /* Replace margin with padding to prevent overflow */
  box-sizing: border-box; /* Include padding in width calculations */
}


@media (max-width: 768px) {
  .card-widget {
    flex: 1 1 100%; /* Stack cards on smaller screens */
    max-width: none;
  }
}
.chart {
  width: 100%;

  /* touch-action: none;  Disable touch gestures on the chart to avoid interference */
}
ion-card-title {
  -webkit-padding-start: 0px;
  -webkit-padding-end: 0px;
  padding-inline-start: 12px;
  padding-inline-end:  12px;
  padding-top: 12px;
}
ion-card-content {
  -webkit-padding-start: 0px;
  -webkit-padding-end: 0px;
  padding-inline-start: 2px !important;
  padding-inline-end:  2px !important;
}
</style>
