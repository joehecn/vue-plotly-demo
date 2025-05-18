<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const totalPower1 = computed(() => {
  return chartData1.value.reduce((acc, item) => {
    const powers = item.y as number[]
    const total = powers.reduce((sum, power) => {
      return sum + (isNaN(power) ? 0 : power)
    }, 0)

    return acc + (isNaN(total) ? 0 : total)
  }, 0)

  // return total
  //   ? `Carnot's Total Power: ${total.toFixed(0)}`
  //   : `Carnot's Total Power: No data`
})
const layout1 = {
  title: 'Chiller Power (Carnot)',
  barmode: 'stack',
  height: 400, // 设置图表高度
  responsive: true, // 启用自适应
  yaxis: {
    tickformat: 'd', // 设置刻度格式为整数
    dtick: 100, // 设置刻度间隔
    range: [0, 500], // 设置 y 轴范围
  },
  legend: {
    x: 0, // 图例的水平位置 (0 表示左对齐，1 表示右对齐)
    y: -0.24, // 图例的垂直位置 (0 表示底部，1 表示顶部)
    xanchor: 'left', // 水平对齐方式 ('left', 'center', 'right')
    yanchor: 'top', // 垂直对齐方式 ('top', 'middle', 'bottom')
    orientation: 'h', // 图例方向 ('v' 表示垂直, 'h' 表示水平)
    // traceorder: 'reversed', // 图例顺序反转
  },
  // annotations: [
  //   {
  //     text: 'Total Power: 1234',
  //     x: 20,
  //     y: 500, // 注释的 y 坐标
  //     showarrow: false,
  //     font: {
  //       size: 16,
  //       color: '#000',
  //     },
  //   },
  // ],
}

const chartData2 = ref<ChartDataRow[]>([])
const totalPower2 = computed(() => {
  return chartData2.value.reduce((acc, item) => {
    const powers = item.y as number[]
    const total = powers.reduce((sum, power) => {
      return sum + (isNaN(power) ? 0 : power)
    }, 0)

    return acc + (isNaN(total) ? 0 : total)
  }, 0)

  // return total
  //   ? `Mega's Total Power: ${total.toFixed(0)}`
  //   : `Mega's Total Power: No data`
})
const layout2 = {
  title: 'Chiller Power (Mega)',
  barmode: 'stack',
  height: 400, // 设置图表高度
  responsive: true, // 启用自适应
  yaxis: {
    tickformat: 'd', // 设置刻度格式为整数
    dtick: 100, // 设置刻度间隔
    range: [0, 500], // 设置 y 轴范围
  },
  legend: {
    x: 0, // 图例的水平位置 (0 表示左对齐，1 表示右对齐)
    y: -0.24, // 图例的垂直位置 (0 表示底部，1 表示顶部)
    xanchor: 'left', // 水平对齐方式 ('left', 'center', 'right')
    yanchor: 'top', // 垂直对齐方式 ('top', 'middle', 'bottom')
    orientation: 'h', // 图例方向 ('v' 表示垂直, 'h' 表示水平)
    // traceorder: 'reversed', // 图例顺序反转
  },
}

const refreshData = async () => {
  loading1.value = true
  try {
    const [startTime, endTime] = datetimerange.value
    const _endTime = `${endTime} 23:59:59`

    const dataCarnot = await fetchCarnotData('chillerPower', [startTime, _endTime])
    // console.log('dataCarnot', dataCarnot)
    chartData1.value = dataCarnot as ChartDataRow[]

    const dataMega = settingsStore.getMegaData('chillerPower', [startTime, _endTime])
    // console.log('dataMega', dataMega)
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
  <h1>Power - Chiller</h1>

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
  <div style="margin: 16px">
    <div>
      <span style="display: inline-block; width: 200px">Carnot's Total Power: </span
      >{{ totalPower1 ? `${totalPower1.toFixed(0)}` : 'No data' }} kW
    </div>
    <div>
      <span style="display: inline-block; width: 200px">Mega's Total Power: </span
      >{{ totalPower2 ? `${totalPower2.toFixed(0)}` : 'No data' }} kW
    </div>
    <div>
      <span style="display: inline-block; width: 200px">Difference: </span
      >{{ (totalPower1 - totalPower2).toFixed(0) }} kW
    </div>
  </div>

  <div v-loading="loading1">
    <VuePlotly :data="chartData1" :layout="layout1" :display-mode-bar="false"></VuePlotly>
  </div>

  <VuePlotly :data="chartData2" :layout="layout2" :display-mode-bar="false"></VuePlotly>
</template>
