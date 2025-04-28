<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VuePlotly } from 'vue3-plotly'
import dayjs from 'dayjs'
import { useSettingsStore } from '@/stores/settings.store'
import type { ChartDataRow } from '@/stores/settings.store'

const settingsStore = useSettingsStore()

const datetimerange = ref<string[]>([])
const shortcuts = [
  {
    text: 'Today',
    value: () => {
      // const end = new Date()
      const start = new Date()
      // start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, start]
    },
  },
  {
    text: 'Yesterday',
    value: () => {
      // const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, start]
    },
  },
  {
    text: 'Last week',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
]

const chartData = ref<ChartDataRow[]>([])
const layout = {
  title: 'Cooling Load Difference',
  // barmode: 'stack',
  height: 600, // 设置图表高度
  responsive: true, // 启用自适应
  yaxis: {
    tickformat: 'd', // 设置刻度格式为整数
    dtick: 200, // 设置刻度间隔
    // range: [0, 2000], // 设置 y 轴范围
  },
  legend: {
    x: 0, // 图例的水平位置 (0 表示左对齐，1 表示右对齐)
    y: -0.1, // 图例的垂直位置 (0 表示底部，1 表示顶部)
    xanchor: 'left', // 水平对齐方式 ('left', 'center', 'right')
    yanchor: 'top', // 垂直对齐方式 ('top', 'middle', 'bottom')
    orientation: 'h', // 图例方向 ('v' 表示垂直, 'h' 表示水平)
  },
}

const refreshData = () => {
  try {
    const [startTime, endTime] = datetimerange.value
    const _endTime = `${endTime} 23:59:59`

    const dataMega = settingsStore.getMegaData('coolingLoadDiff', [startTime, _endTime])
    chartData.value = dataMega as ChartDataRow[]
  } catch (error) {
    console.error('Error in refreshData:', error)
  }
}

const onDatetimerangeChange = (value: string[]) => {
  if (!value) return
  refreshData()
}

onMounted(() => {
  const now = new Date()

  if (settingsStore.datetimerange.length > 0) {
    datetimerange.value = settingsStore.datetimerange
  } else {
    datetimerange.value = [
      dayjs(now).startOf('D').subtract(1, 'M').add(1, 'day').format('YYYY-MM-DD'),
      dayjs(now).startOf('D').format('YYYY-MM-DD'),
    ]
  }

  refreshData()
})
</script>

<template>
  <h1>Diff - Cooling Load</h1>
  <el-date-picker v-model="datetimerange" value-format="YYYY-MM-DD" type="daterange" range-separator="To"
    start-placeholder="Start date" end-placeholder="End date" :shortcuts="shortcuts" @change="onDatetimerangeChange" />

  <VuePlotly :data="chartData" :layout="layout" :display-mode-bar="false"></VuePlotly>
</template>
