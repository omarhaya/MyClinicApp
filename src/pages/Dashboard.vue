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
      <ion-card>
             <!-- Wrapping div to apply touch handlers -->
        <ion-card-content
            style="height: 300px;"
            ref="monthlyLineChart"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            class="monthly-line-chart-wrapper">
         <MonthlyPaymentLineChart :paymentsData="paymentsData"/>
        </ion-card-content>
      </ion-card>
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
} from '@ionic/vue';
import dayjs from 'dayjs';
import { useStorePayments } from 'src/stores/storePayments';
import MonthlyPaymentLineChart from 'src/components/Charts/MonthlyPaymentLineChart.vue';
import CardWidgetIcons from 'src/components/CardWidgetIcons.vue';
import { Platform } from 'quasar';
import { useStorePatients } from 'src/stores/storePatients';
import { useStoreAppointments } from 'src/stores/storeAppointments';
import { useStoreWorks } from 'src/stores/storeWorks';
const storePayments = useStorePayments();
const storePatients = useStorePatients()
const storeAppointments=useStoreAppointments()
const storeWorks=useStoreWorks()
const conversionRates = {
  '$': 1500, // 1 USD = 1500 IQD
  'EUR': 1700, // Example: 1 EUR = 1700 IQD
  'GBP': 2000, // Example: 1 GBP = 2000 IQD
  'IQD': 1, // IQD is the base currency
  // Add more currencies as needed
};

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
</style>
