<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VuePlotly } from 'vue3-plotly'
import dayjs from 'dayjs'
import { getRun } from '@/api/cbos'
// import { useSettingsStore } from '@/stores/settings.store'
import type { ChartDataRow } from '@/stores/settings.store'

// const settingsStore = useSettingsStore()

const datetimerange = ref<string[]>([])
const shortcuts = [
  {
    text: 'Today',
    value: () => {
      const start = new Date()
      return [start, start]
    },
  },
  {
    text: 'Yesterday',
    value: () => {
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

const loading = ref(true)
const chartData = ref<ChartDataRow[]>([])
const layout = {
  title: 'AI Running',
  barmode: 'stack',
  height: 300, // 设置图表高度
  responsive: true, // 启用自适应
  yaxis: {
    type: 'category', // 将 y 轴设置为分类轴
    categoryorder: 'array', // 按自定义顺序排序
    categoryarray: [false, true], // 指定分类顺序
    range: [0, 3], // 设置 y 轴范围
  },
  legend: {
    x: 0, // 图例的水平位置 (0 表示左对齐，1 表示右对齐)
    y: -0.24, // 图例的垂直位置 (0 表示底部，1 表示顶部)
    xanchor: 'left', // 水平对齐方式 ('left', 'center', 'right')
    yanchor: 'top', // 垂直对齐方式 ('top', 'middle', 'bottom')
    orientation: 'h', // 图例方向 ('v' 表示垂直, 'h' 表示水平)
  },
}

const refreshData = async () => {
  loading.value = true
  try {
    const [startTime, endTime] = datetimerange.value
    const _endTime = `${endTime} 23:59:59`

    console.log('Fetching data from:', startTime, 'to:', _endTime)

    const data = await getRun(dayjs(startTime).valueOf() / 1000, dayjs(_endTime).valueOf() / 1000)
    console.log('Fetched data:', data)

    const x = data.map((item: { _time: string }) => dayjs(item._time).format('YYYY-MM-DD HH:mm:ss'))
    const y = data.map((item: { _value: number }) => !!item._value)
    chartData.value = [{ name: 'Running', type: 'bar', x, y }]

    // const dataMega = settingsStore.getMegaData('chillerRunningStatus', [startTime, _endTime])
    // console.log(dataMega)
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const onDatetimerangeChange = async (value: string[]) => {
  if (!value) return
  await refreshData()
}

onMounted(async () => {
  const now = new Date()

  datetimerange.value = [
    dayjs(now).startOf('D').subtract(1, 'day').format('YYYY-MM-DD'),
    dayjs(now).startOf('D').format('YYYY-MM-DD'),
  ]

  await refreshData()
})
</script>

<template>
  <h1>Running</h1>

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

  <div v-loading="loading">
    <VuePlotly :data="chartData" :layout="layout" :display-mode-bar="false"></VuePlotly>
  </div>
</template>
