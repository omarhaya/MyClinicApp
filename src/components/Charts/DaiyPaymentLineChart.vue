<template>
  <ion-page>
    <IonContent>
      <v-chart class="chart" :option="chartOption" autoresize style="height: 400px; width: 100%;" />
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
import { ref, computed, onMounted, watch } from 'vue';
import { IonContent, IonPage } from '@ionic/vue';
import dayjs from 'dayjs';
import { useStorePayments } from 'src/stores/storePayments';
import numeral from 'numeral'

const storePayments = useStorePayments();
const selectedDateRange = ref({});

// Set the initial date range to the current month
onMounted(() => {
  const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
  selectedDateRange.value = { from: startDate, to: endDate };
  fetchPayments();
});

// Fetch payments based on the selected date range
const fetchPayments = async () => {
  if (selectedDateRange.value && selectedDateRange.value.from && selectedDateRange.value.to) {
    const startDate = selectedDateRange.value.from;
    const endDate = selectedDateRange.value.to;
    await storePayments.fetchPaymentsByDate(startDate, endDate);
  }
};

const paymentsData = computed(() => storePayments.getPaymentsByPeriod('day'));

// Watch for changes in selectedDateRange to refetch and update the chart data
watch(selectedDateRange, fetchPayments);

const chartOption = computed(() => {
  const payments = paymentsData.value || {};
  const currencies = Object.keys(payments);

  // Collect all unique dates within the range from start to end
  const allDates = [];
  let currentDate = dayjs(selectedDateRange.value.from);
  const endDate = dayjs(selectedDateRange.value.to);

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    allDates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'day');
  }

  // Map each currency's data to align with allDates and handle missing data
  const series = currencies.map((currency, index) => {
    const currencyData = payments[currency];

    const data = allDates.map(date => {
      const item = currencyData.find(i => i.date === date);
      return item ? parseFloat(item.total) : null; // Convert to number (parseFloat) for missing data
    });

    return {
      name: `${currency} Payments`,
      type: 'line',
      smooth: true,
      connectNulls: true, // Connect lines across null values to maintain continuity
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

  // If there is more than one currency, use logarithmic scale for better visibility of different ranges
  const isLogScale = currencies.length > 1;

  const today = dayjs().format('YYYY-MM-DD'); // Get today's date
  const todayIndex = allDates.indexOf(today); // Find the index of today's date

  // Calculate today's payment by parsing the strings to numbers
  const todayPayments = currencies.map(currency => {
    const todayData = payments[currency].find(i => i.date === today);
    return todayData ? parseFloat(todayData.total) : 0; // Ensure the payment is parsed as a number
  });

  // Default y position if no payments today
  const todayPaymentValue = todayPayments.reduce((max, curr) => Math.max(max, curr), 0); // Max value for today’s payment

  // Log today's payment value for debugging
  console.log('Today Index:', todayIndex);
  console.log('Today Payment:', todayPaymentValue);

  // Ensure that the yAxis range is set to accommodate your data
  const maxPayment = Math.max(
    ...Object.values(payments).flatMap(currencyData => currencyData.map(i => parseFloat(i.total))) // Parse all total values as numbers
  );

  // Ensure that the yAxis range accommodates the payment data
  const yAxisRange = [0, Math.max(maxPayment, todayPaymentValue) * 1.1]; // 10% buffer above the highest payment value

  return {
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    color: ['#37c651', '#00DDFF', '#FF8C00', '#FF0087'],
    title: { text: 'Payments' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
    },
    legend: { data: currencies.map(currency => `${currency} Payments`) },
    toolbox: { feature: { saveAsImage: {}, dataZoom: { yAxisIndex: 'none'}, dataView: { readOnly: false } } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', boundaryGap: false, data: allDates }],
    yAxis: [
    {
      type: isLogScale ? 'log' : 'value', // Dynamically set the scale type
      logBase: 10, // Base 10 logarithmic scale
      min: 1, // Ensure the minimum value is greater than 0 (logarithmic scale cannot handle 0)
      max: yAxisRange[1], // Set y-axis max value
      axisLabel: {
        formatter: function (value) {
          return numeral(Math.floor(value)).format('0,0')  // Remove decimal places
        }
      }
    }
  ],
    series,
    markPoint: {
      symbol: 'circle',
      symbolSize: 20,
      itemStyle: { color: '#FF0000' },
      data: [
        {
          xAxis: todayIndex !== -1 ? todayIndex : 0, // Position on the x-axis (today's date)
          yAxis: todayPaymentValue, // Place at the y position for today’s payment or fallback value
          name: 'Today',
          label: { show: true, formatter: 'Today' },
        },
      ],
      animation: {
        duration: 1000,
        easing: 'easeInOutElastic',
        delay: 500,
        loop: true,
      },
    },
  };
});
</script>

<style scoped>
.chart {
  width: 100%;
  touch-action: none;
}
</style>
