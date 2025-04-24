<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VuePlotly } from 'vue3-plotly'
import { fetchCarnotData } from '@/api/carnot'
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

const loading1 = ref(true)
const chartData1 = ref<ChartDataRow[]>([])
const layout1 = {
  title: 'Chiller Running Status (Carnot)',
  barmode: 'stack',
  yaxis: {
    type: 'category', // 将 y 轴设置为分类轴
    categoryorder: 'array', // 按自定义顺序排序
    categoryarray: [false, true], // 指定分类顺序
  },
  legend: {
    x: 0, // 图例的水平位置 (0 表示左对齐，1 表示右对齐)
    y: -0.15, // 图例的垂直位置 (0 表示底部，1 表示顶部)
    xanchor: 'left', // 水平对齐方式 ('left', 'center', 'right')
    yanchor: 'top', // 垂直对齐方式 ('top', 'middle', 'bottom')
    orientation: 'h', // 图例方向 ('v' 表示垂直, 'h' 表示水平)
  },
}

const chartData2 = ref<ChartDataRow[]>([])
const layout2 = {
  title: 'Chiller Running Status (Mega)',
  barmode: 'stack',
  yaxis: {
    type: 'category', // 将 y 轴设置为分类轴
    categoryorder: 'array', // 按自定义顺序排序
    categoryarray: [false, true], // 指定分类顺序
  },
  legend: {
    x: 0, // 图例的水平位置 (0 表示左对齐，1 表示右对齐)
    y: -0.15, // 图例的垂直位置 (0 表示底部，1 表示顶部)
    xanchor: 'left', // 水平对齐方式 ('left', 'center', 'right')
    yanchor: 'top', // 垂直对齐方式 ('top', 'middle', 'bottom')
    orientation: 'h', // 图例方向 ('v' 表示垂直, 'h' 表示水平)
  },
}

const refreshData = async () => {
  loading1.value = true
  try {
    const [startTime, endTime] = datetimerange.value
    const _endTime = `${endTime} 23:59:59`

    const dataCarnot = await fetchCarnotData('chillerRunningStatus', [startTime, _endTime])
    chartData1.value = dataCarnot as ChartDataRow[]

    const dataMega = settingsStore.getMegaData('chillerRunningStatus', [startTime, _endTime])
    chartData2.value = dataMega as ChartDataRow[]
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading1.value = false
  }
}

const onDatetimerangeChange = async (value: string[]) => {
  if (!value) return
  await refreshData()
}

onMounted(async () => {
  const now = new Date()

  if (settingsStore.datetimerange.length > 0) {
    datetimerange.value = settingsStore.datetimerange
  } else {
    datetimerange.value = [
      dayjs(now).startOf('D').subtract(1, 'M').add(1, 'day').format('YYYY-MM-DD'),
      dayjs(now).startOf('D').format('YYYY-MM-DD'),
    ]
  }
  await refreshData()
})
</script>

<template>
  <h1>Status - Chiller</h1>

  <el-date-picker
    v-model="datetimerange"
    value-format="YYYY-MM-DD"
    type="daterange"
    range-separator="To"
    start-placeholder="Start date"
    end-placeholder="End date"
    :shortcuts="shortcuts"
    @change="onDatetimerangeChange"
  />

  <div v-loading="loading1">
    <VuePlotly :data="chartData1" :layout="layout1" :display-mode-bar="false"></VuePlotly>
  </div>

  <VuePlotly :data="chartData2" :layout="layout2" :display-mode-bar="false"></VuePlotly>
</template>
