// src/boot/echarts.js
import { boot } from 'quasar/wrappers';
import ECharts from 'vue-echarts';
import * as echarts from 'echarts';
export default boot(({ app }) => {
  // Register the ECharts component globally
  app.component('v-chart', ECharts);
  // Optionally, make the `echarts` instance available globally
  app.config.globalProperties.$echarts = echarts;
});
