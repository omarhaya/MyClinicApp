<template>

      <!-- Chart component with loading skeleton option -->
      <v-chart
        class="chart"
        :option="storePayments.loading ? loadingChartOption : chartOption"
        autoresize

      />

      <!-- Date range picker and fetch button
      <q-date
        v-model="selectedDateRange"
        range
        mask="YYYY-MM-DD"
        :options="dateOptions"
      />
      <q-btn label="Fetch Payments" @click="fetchPayments" /> -->

</template>
<script setup>
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { useStorePayments } from 'src/stores/storePayments';
import numeral from 'numeral';

 const storePayments=useStorePayments()
 const selectedDateRange = ref({})

const props = defineProps({
payments:{
  type : Object,
  required:true
},
data:{
  type : Object,
  required:true
},
todayIndex:{
  type : Object,
  required:true
},
paymentsData:{
  type : Object,
  required:true
},
})
// Basic loading chart option with placeholder data
const loadingChartOption = {
  title: { text: 'Loading...', left: 'center' },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Loading Data',
      type: 'line',
      data: Array(12).fill(null), // Placeholder data
      smooth: true,
      lineStyle: { width: 2, type: 'dashed', color: '#ccc' },
    },
  ],
};

// Main chart option with actual data
const chartOption = computed(() => {
  if (storePayments.loading) return loadingChartOption;

  const payments = props.paymentsData || {};
  const currencies = Object.keys(payments);

  // Generate an array of monthly dates within the selected range using 'YYYY-MM' format
  const allDates = [];
  let currentDate = dayjs(storePayments.selectedDateRange.from).startOf('month');
  const endDate = dayjs(storePayments.selectedDateRange.to).endOf('month');
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    allDates.push(currentDate.format('YYYY-MM'));  // Store in 'YYYY-MM' format
    currentDate = currentDate.add(1, 'month');
  }

  // Convert 'YYYY-MM' formatted dates to 'MMM' for xAxis labels
  const xAxisLabels = allDates.map(date => dayjs(date).format('MMM'));

  // Generate series data by mapping each currency to allDates
  const series = currencies.map((currency, index) => {
    const currencyData = payments[currency];

    const data = allDates.map(date => {
      const monthData = currencyData.find(i => i.date === date);
      return monthData ? monthData.total : null;  // Fill missing months with null
    });

    return {
      name: `${currency} Payments`,
      type: 'line',
      smooth: true,
      connectNulls: true,
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

  // Check if the payments across currencies vary significantly
  const allPayments = Object.values(payments).flat();
  const maxPayment = Math.max(...allPayments.map(payment => payment.total));
  const minPayment = Math.min(...allPayments.map(payment => payment.total));

  // If the range of payments is too large, use a logarithmic scale
  const isLogScale = maxPayment / minPayment > 1000;

  return {
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    color: ['#37c651', '#00DDFF', '#FF8C00', '#FF0087'],
    // title: { text: 'Monthly Payments' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
    },
    legend: { data: currencies.map(currency => `${currency} Payments`) },
    // toolbox: {
    //   feature: {
    //     saveAsImage: {},
    //     dataZoom: { yAxisIndex: 'none' },
    //     dataView: { readOnly: false },
    //   }
    // },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', boundaryGap: false, data: xAxisLabels }],
    yAxis: [{
      type: isLogScale ? 'log' : 'value',  // Use logarithmic scale if necessary
      logBase: 10, // Logarithmic scale base
      min: isLogScale ? 1 : 0,  // Ensure we don't have 0 in log scale
      axisLabel: {
        formatter: function (value) {
          if (value >= 1000000) {
            return numeral(value).format('0.0a'); // Format as millions (e.g., 10.5m)
          } else if (value >= 1000) {
            return numeral(value).format('0.0a'); // Format as thousands (e.g., 12.3k)
          }
          return numeral(value).format('0'); // Return as is for smaller values
        }
      }
    }],
    series,
  };
});


</script>
<style scoped>

.chart {
  width: 100%;
  /* touch-action: none;  Disable touch gestures on the chart to avoid interference */
}
</style>
