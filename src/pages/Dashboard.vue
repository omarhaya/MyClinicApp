<template>
  <ion-page>
    <IonContent>
      <v-chart class="chart" :option="chartOption" autoresize style="height: 400px; width: 100%;" />
       <!-- <chart class="chart" :paymentsData="paymentsData" :data="paymentsData.map(item => item.date)" :payments="paymentsData.map(item => item.total)" :todayIndex=" paymentsData.findIndex(item => item.date === dayjs().format('YYYY-MM-DD'))"></chart> -->
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

const storePayments = useStorePayments();
const selectedDateRange = ref([]);

const fetchPayments = async () => {
  if (selectedDateRange.value && selectedDateRange.value.from && selectedDateRange.value.to) {
    const startDate = selectedDateRange.value.from;
    const endDate = selectedDateRange.value.to;
    await storePayments.fetchPaymentsByDate(startDate, endDate);
  }
};

const paymentsData = computed(() => storePayments.getPaymentsByPeriod('day'));

onMounted(() => {
  const endDate = dayjs().format('YYYY-MM-DD');
  const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
  selectedDateRange.value = { from: startDate, to: endDate };
  fetchPayments();
});

const chartOption = computed(() => {
  const payments = paymentsData.value || {};
  const currencies = Object.keys(payments);

  // Gather all unique dates across currencies
  const allDates = [...new Set(currencies.flatMap(currency => payments[currency].map(item => item.date)))].sort();

  // Map each currency's data to align with allDates
  const series = currencies.map((currency, index) => {
    const data = allDates.map(date => {
      const item = payments[currency].find(i => i.date === date);
      return item ? item.total : null;
    });

    return {
      name: `${currency} Payments`,
      type: 'line',
      smooth: true,
      lineStyle: { width: 4 },
      showSymbol: false,
      areaStyle: {
        opacity: 0.8,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: index % 2 === 0 ? '#3ecb7778' : '#00DDFF' },
            { offset: 1, color: '#ffffff00' },
          ],
        },
      },
      emphasis: { focus: 'series' },
      data,
    };
  });

  return {
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    color: ['#37c651', '#00DDFF', '#FF8C00', '#FF0087'], // Define a color palette
    title: { text: 'Payments' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
    legend: { data: currencies.map(currency => `${currency} Payments`) },
    toolbox: { feature: { saveAsImage: {} } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', boundaryGap: false, data: allDates }],
    yAxis: [{ type: 'value' }],
    series,
  };
});
</script>

<style scoped>
.chart {
  width: 100%;
  touch-action: none;
}
</style>
