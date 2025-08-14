<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VuePlotly } from 'vue3-plotly'
import dayjs from 'dayjs'
import { getRun } from '@/api/cbos'
import type { ChartDataRow } from '@/stores/settings.store'

const date = ref<string>('')
const shortcuts = [
  {
    text: 'Today',
    value: new Date(),
  },
  {
    text: 'Yesterday',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: 'A week ago',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
]
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

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
    range: [0, 2], // 设置 y 轴范围
    automargin: true,
    ticklabelposition: 'outside',
    tickpadding: 40,
    showticklabels: false, // 隐藏y轴刻度文字
  },
  bargap: 0, // 柱子间隙为0
}

const refreshData = async () => {
  loading.value = true
  try {
    const startTime = date.value
    const _endTime = `${startTime} 23:59:59`

    // console.log('Fetching data from:', startTime, 'to:', _endTime)

    const data = await getRun(dayjs(startTime).valueOf() / 1000, dayjs(_endTime).valueOf() / 1000)
    // console.log('Fetched data:', data)

    const x = data.map((item: { _time: string }) => dayjs(item._time).format('YYYY-MM-DD HH:mm:ss'))
    const y = data.map((item: { _value: number }) => !!item._value)
    chartData.value = [{ name: 'Running', type: 'bar', x, y }]
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const onDateChange = async (value: string) => {
  if (!value) return
  await refreshData()
}

onMounted(async () => {
  const now = new Date()
  date.value = dayjs(now).format('YYYY-MM-DD')

  await refreshData()
})
</script>

<template>
  <h1>Running</h1>

  <el-date-picker
    v-model="date"
    value-format="YYYY-MM-DD"
    type="date"
    placeholder="Pick a day"
    :shortcuts="shortcuts"
    :disabled-date="disabledDate"
    @change="onDateChange"
    :clearable="false"
  />

  <div v-loading="loading">
    <VuePlotly :data="chartData" :layout="layout" :display-mode-bar="false"></VuePlotly>
  </div>
</template>
