<template>
  <ion-page>
    <IonContent>
      <!-- <v-chart class="chart" :option="chartOption" autoresize style="height: 400px; width: 100%;" /> -->
       <chart class="chart" :paymentsData="paymentsData" :data="paymentsData.map(item => item.date)" :payments="paymentsData.map(item => item.total)" :todayIndex=" paymentsData.findIndex(item => item.date === dayjs().format('YYYY-MM-DD'))"></chart>
      <q-date
        v-model="selectedDateRange"
        range
        mask="YYYY-MM-DD"
        :options="dateOptions"
      />
      <q-btn label="Fetch Payments" @click="fetchPayments" />
    </IonContent>
  </ion-page>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue';
import { IonContent, IonPage } from '@ionic/vue';
import dayjs from 'dayjs';
import { useStorePayments } from 'src/stores/storePayments';
import chart from 'src/components/Charts/chart.vue'


const storePayments = useStorePayments();
const selectedDateRange = ref([]);

const fetchPayments = async () => {
  if (selectedDateRange.value && selectedDateRange.value.from && selectedDateRange.value.to) {
    const startDate = selectedDateRange.value.from;
    const endDate = selectedDateRange.value.to;
    await storePayments.fetchPaymentsByDate(startDate, endDate);
    console.log(paymentsData.value, 'paymentsData');
  } else {
    console.error('Invalid date range selected:', selectedDateRange.value);
  }
};

const paymentsData = computed(() => storePayments.getPaymentsByPeriod('day'));

onMounted(() => {
  // Calculate the date range for the last month
  const endDate = dayjs().format('YYYY-MM-DD');
  const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

  // Set selectedDateRange and fetch payments for this range
  selectedDateRange.value = { from: startDate, to: endDate };
  fetchPayments();
});
</script>

<style scoped>

</style>
