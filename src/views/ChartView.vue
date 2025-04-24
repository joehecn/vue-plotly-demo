<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { VuePlotly } from 'vue3-plotly'
import { fetchCarnotData } from '@/api/carnot'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'

import type { ChartDataRow } from '@/stores/settings.store'

const route = useRoute()

const routeMap = new Map([
  ['chiller', 'chillerRunningStatus'],
  ['cdwp', 'cdwpRunningStatus'],
  ['cooling-tower', 'coolingTowerRunningStatus'],
])

const titleMap = new Map([
  ['chiller', 'Status - Chiller'],
  ['cdwp', 'Status - CDWP'],
  ['cooling-tower', 'Status - Cooling Tower'],
])
const title = ref('')

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

const title1Map = new Map([
  ['chiller', 'Chiller Running Status (Carnot)'],
  ['cdwp', 'CDWP Running Status (Carnot)'],
  ['cooling-tower', 'Cooling Tower Running Status (Carnot)'],
])
const layout1 = ref({
  title: '',
  barmode: 'stack',
  yaxis: {
    tickformat: 'd', // 设置刻度格式为整数
    dtick: 1, // 设置刻度间隔为 1
  },
  legend: {
    x: 0, // 图例的水平位置 (0 表示左对齐，1 表示右对齐)
    y: -0.15, // 图例的垂直位置 (0 表示底部，1 表示顶部)
    xanchor: 'left', // 水平对齐方式 ('left', 'center', 'right')
    yanchor: 'top', // 垂直对齐方式 ('top', 'middle', 'bottom')
    orientation: 'h', // 图例方向 ('v' 表示垂直, 'h' 表示水平)
  },
})

watch(
  () => route.name,
  () => {
    // title
    title.value = titleMap.get(route.name as string) || 'Unknown'

    refreshData()
  },
)

const refreshData = async () => {
  loading1.value = true
  try {
    const [startTime, endTime] = datetimerange.value
    const _endTime = endTime.length === 19 ? endTime : `${endTime} 23:59:59`

    const method = routeMap.get(route.name as string)!
    const data = await fetchCarnotData(method, [startTime, _endTime])
    chartData1.value = data as ChartDataRow[]
    layout1.value.title = title1Map.get(route.name as string)!
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
  // title
  title.value = titleMap.get(route.name as string) || 'Unknown'

  const now = new Date()

  datetimerange.value = [
    dayjs(now).startOf('D').subtract(1, 'M').add(1, 'day').format('YYYY-MM-DD'),
    dayjs(now).startOf('D').format('YYYY-MM-DD'),
  ]
  await refreshData()
})
</script>

<template>
  <h1>{{ title }}</h1>

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
    <VuePlotly :data="chartData1" :layout="layout1" :display-mode-bar="false"> </VuePlotly>
  </div>
</template>
