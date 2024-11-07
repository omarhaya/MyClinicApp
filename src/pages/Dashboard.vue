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
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { ref, computed, onMounted } from 'vue';
import { IonContent, IonPage } from '@ionic/vue';
import dayjs from 'dayjs';
import { useStorePayments } from 'src/stores/storePayments';
import chart from 'src/components/Charts/chart.vue'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

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

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  xAxis: {
    type: 'category',
    data: paymentsData.value.map(item => item.date),
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'Payments',
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.8,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgb(128, 255, 165)' },
            { offset: 1, color: 'rgb(1, 191, 236)' }
          ],
        },
      },
      emphasis: {
        focus: 'series',
      },
      data: paymentsData.value.map(item => item.total),
    }
  ]
}));

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
.chart {
  height: 100vh;
  width: 100%;
}
</style>
