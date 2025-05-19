<script setup lang="ts">
import { ref, watch } from 'vue'
import CustomNode from './CustomNode.vue'
import { useSettingsStore } from '@/stores/settings.store'
import { storeToRefs } from 'pinia'

import type { SafeAny } from '@/api/carnot'

const chillerMap = new Map([
  [1, 'CH1'],
  [2, 'CH3'],
  [3, 'CH4'],
])
const groupAPumpMap = new Map([
  [1, 'CDWP1'],
  [2, 'CDWP2'],
  [3, 'CDWP3'],
])
const groupATowerMap = new Map([
  [1, 'CT1'],
  [2, 'CT3'],
])
const roupBPumpMap = new Map([
  [1, 'CDWP4'],
  [2, 'CDWP5'],
])
const groupBTowerMap = new Map([[1, 'CT4']])

// 所有的边有方向
const edgeMap = new Map([
  ['CH1', new Set(['CDWP1', 'CDWP2', 'CDWP3'])],
  ['CH3', new Set(['CDWP1', 'CDWP2', 'CDWP3'])],
  ['CH4', new Set(['CDWP4', 'CDWP5'])],
  ['CDWP1', new Set(['CT1', 'CT3'])],
  ['CDWP2', new Set(['CT1', 'CT3'])],
  ['CDWP3', new Set(['CT1', 'CT3'])],
  ['CDWP4', new Set(['CT4'])],
  ['CDWP5', new Set(['CT4'])],
  ['CT1', new Set(['CH1', 'CH3'])],
  ['CT3', new Set(['CH1', 'CH3'])],
  ['CT4', new Set(['CH4'])],
])

const settingsStore = useSettingsStore()

const { lastStrategyRow } = storeToRefs(settingsStore)

const getPolylines = (pre = 'B', cls = '') => {
  return [
    // 8 边 CH to CDWP
    { id: `${pre}_CH1_CDWP1`, cls, points: '360 62 480 62 480 93 600 93 600 55.8 720 55.8' },
    { id: `${pre}_CH1_CDWP2`, cls, points: '360 62 480 62 480 93 720 93' },
    { id: `${pre}_CH1_CDWP3`, cls, points: '360 62 480 62 480 93 600 93 600 130.2 720 130.2' },

    { id: `${pre}_CH3_CDWP1`, cls, points: '360 124 480 124 480 93 600 93 600 55.8 720 55.8' },
    { id: `${pre}_CH3_CDWP2`, cls, points: '360 124 480 124 480 93 720 93' },
    { id: `${pre}_CH3_CDWP3`, cls, points: '360 124 480 124 480 93 600 93 600 130.2 720 130.2' },

    { id: `${pre}_CH4_CDWP4`, cls, points: '360 186 600 186 600 167.4 720 167.4' },
    { id: `${pre}_CH4_CDWP5`, cls, points: '360 186 600 186 600 204.6 720 204.6' },

    // 8 边 CDWP to CT
    { id: `${pre}_CDWP1_CT1`, cls, points: '720 55.8 840 55.8 840 93 960 93 960 62 1080 62' },
    { id: `${pre}_CDWP1_CT3`, cls, points: '720 55.8 840 55.8 840 93 960 93 960 124 1080 124' },

    { id: `${pre}_CDWP2_CT1`, cls, points: '720 93 960 93 960 62 1080 62' },
    { id: `${pre}_CDWP2_CT3`, cls, points: '720 93 960 93 960 124 1080 124' },

    { id: `${pre}_CDWP3_CT1`, cls, points: '720 130.2 840 130.2 840 93 960 93 960 62 1080 62' },
    { id: `${pre}_CDWP3_CT3`, cls, points: '720 130.2 840 130.2 840 93 960 93 960 124 1080 124' },

    { id: `${pre}_CDWP4_CT4`, cls, points: '720 167.4 840 167.4 840 186 1080 186' },
    { id: `${pre}_CDWP5_CT4`, cls, points: '720 204.6 840 204.6 840 186 1080 186' },

    // 5 边 CT to CH
    {
      id: `${pre}_CT1_CH1`,
      cls,
      points: '1080 62 1200 62 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 62 360 62',
    },
    {
      id: `${pre}_CT1_CH3`,
      cls,
      points: '1080 62 1200 62 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 124 360 124',
    },

    {
      id: `${pre}_CT3_CH1`,
      cls,
      points: '1080 124 1200 124 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 62 360 62',
    },
    {
      id: `${pre}_CT3_CH3`,
      cls,
      points: '1080 124 1200 124 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 124 360 124',
    },

    { id: `${pre}_CT4_CH4`, cls, points: '1080 186 1200 186 1200 241.8 240 241.8 240 186 360 186' },
  ]
}
const getNodes = () => {
  return [
    { id: 'CH1', cls: '', loadingRate: '', supplyTemp: '', cx: 360, cy: 62 }, // progress-ring
    { id: 'CH3', cls: '', loadingRate: '', supplyTemp: '', cx: 360, cy: 124 },
    { id: 'CH4', cls: '', loadingRate: '', supplyTemp: '', cx: 360, cy: 186 },

    { id: 'CDWP1', cls: '', cx: 720, cy: 55.8 },
    { id: 'CDWP2', cls: '', cx: 720, cy: 93 },
    { id: 'CDWP3', cls: '', cx: 720, cy: 130.2 },
    { id: 'CDWP4', cls: '', frequency: '', cx: 720, cy: 167.4 },
    { id: 'CDWP5', cls: '', frequency: '', cx: 720, cy: 204.8 },

    { id: 'CT1', cls: '', cx: 1080, cy: 62 },
    { id: 'CT3', cls: '', cx: 1080, cy: 124 },
    { id: 'CT4', cls: '', speed: '', cx: 1080, cy: 186 },
  ]
}

const coolingDemand = ref('')
const predictedLoad = ref('')
const totalEnergy = ref('')

const backPolylines = getPolylines('B', 'back-line')
const polylines = ref(getPolylines('L', '')) // flowing-line

const circles = ref(getNodes())

const updateNodes = (
  activeChillers: number[],
  loadingRates: number[],
  supplyTemps: number[],

  groupAPumpsActive: number[],
  groupATowersActive: number[],

  groupBPumpsActive: number[],
  groupBPumpFrequency: number[],

  groupBTowersActive: number[],
  groupBTowerSpeed: number[],
) => {
  const activeChillerIds = activeChillers.map((chiller, index) => ({
    id: chillerMap.get(chiller),
    index,
  }))

  const activeGroupAPumpIds = groupAPumpsActive.map((pump) => groupAPumpMap.get(pump))
  const activeGroupATowerIds = groupATowersActive.map((tower) => groupATowerMap.get(tower))
  const activeGroupBPumpIds = groupBPumpsActive.map((pump, index) => ({
    id: roupBPumpMap.get(pump),
    index,
  }))
  const activeGroupBTowerIds = groupBTowersActive.map((tower, index) => ({
    id: groupBTowerMap.get(tower),
    index,
  }))

  // console.log({ groupBPumpFrequency, groupBTowerSpeed })

  const activeNodeIds = [
    ...activeChillerIds.map((item) => item.id),
    ...activeGroupAPumpIds,
    ...activeGroupATowerIds,
    ...activeGroupBPumpIds.map((item) => item.id),
    ...activeGroupBTowerIds.map((item) => item.id),
  ] as string[]

  const _circles = getNodes()
  _circles.forEach((circle) => {
    if (activeNodeIds.includes(circle.id)) {
      circle.cls = 'progress-ring'
      // chiller
      if (['CH1', 'CH3', 'CH4'].includes(circle.id)) {
        const activeChiller = activeChillerIds.find((item) => item.id === circle.id)
        if (activeChiller) {
          circle.loadingRate = loadingRates[activeChiller.index].toFixed(1)
          circle.supplyTemp = supplyTemps[activeChiller.index].toFixed(1)
        }
      } else if (['CDWP4', 'CDWP5'].includes(circle.id)) {
        const activeGroupBPump = activeGroupBPumpIds.find((item) => item.id === circle.id)
        if (activeGroupBPump) {
          circle.frequency = groupBPumpFrequency[activeGroupBPump.index].toFixed(0)
        }
      } else if (['CT4'].includes(circle.id)) {
        const activeGroupBTower = activeGroupBTowerIds.find((item) => item.id === circle.id)
        if (activeGroupBTower) {
          circle.speed = groupBTowerSpeed[activeGroupBTower.index].toFixed(0)
        }
      }
    } else {
      circle.cls = ''
    }
  })

  circles.value = _circles

  return activeNodeIds
}

const updateEdges = (activeNodeIds: string[]) => {
  const ids: string[] = []
  edgeMap.forEach((endSet, start) => {
    if (activeNodeIds.includes(start)) {
      endSet.forEach((end) => {
        if (activeNodeIds.includes(end)) {
          ids.push(`L_${start}_${end}`)
        }
      })
    }
  })

  const _polylines = getPolylines('L', '')
  _polylines.forEach((polyline) => {
    if (ids.includes(polyline.id)) {
      polyline.cls = 'flowing-line'
    } else {
      polyline.cls = ''
    }
  })

  polylines.value = _polylines
}

/*
{
  "时间戳": "5/19/2025 14:45",
  "冷量需求(kW)": "1188",
  "运行机组": "[2,3]",
  "负载率(%)": "[77,42]",
  "供水温度(°C)": "[10.2,11.1]",
  "机组能耗(kW)": "[158.99,60.52]",
  "COP": "[5.14,6.17]",
  "水泵_A": "[1]",
  "冷却塔_A": "[2]",
  "水泵能耗_A(kW)": "[15]",
  "冷却塔能耗_A(kW)": "[10.6]",
  "水泵_B": "[2]",
  "冷却塔_B": "[1]",
  "水泵频频率": "[26.4]",
  "冷却塔转速": "[25]",
  "水泵能耗_B(kW)": "[3.4]",
  "冷却塔能耗_B(kW)": "[3.5]",
  "冷量预测(kW)": "1188"
}
*/
const analyzeTheRecord = (record: SafeAny) => {
  coolingDemand.value = record['冷量需求(kW)'] || ''
  predictedLoad.value = record['冷量预测(kW)'] || ''

  // 运行机组
  const activeChillers = JSON.parse(record['运行机组'])
  const chillerPower = JSON.parse(record['机组能耗(kW)'])
  // const copValues = JSON.parse(record['COP'])
  const loadingRates = JSON.parse(record['负载率(%)'])
  const supplyTemps = JSON.parse(record['供水温度(°C)'])

  const groupAPumpsActive = JSON.parse(record['水泵_A'])
  // const groupAPumpsPower = JSON.parse(record['水泵能耗_A(kW)'])
  const groupATowersActive = JSON.parse(record['冷却塔_A'])
  // const groupATowersPower = JSON.parse(record['冷却塔能耗_A(kW)'])
  const groupBPumpsActive = JSON.parse(record['水泵_B'])
  // const groupBPumpsPower = JSON.parse(record['水泵能耗_B(kW)'])
  const groupBPumpFrequency = JSON.parse(record['水泵频频率'])
  const groupBTowersActive = JSON.parse(record['冷却塔_B'])
  // const groupBTowersPower = JSON.parse(record['冷却塔能耗_B(kW)'])
  const groupBTowerSpeed = JSON.parse(record['冷却塔转速'])

  totalEnergy.value = chillerPower.reduce((acc: number, cur: number) => acc + cur, 0).toFixed(2)

  // console.log({
  //   activeChillers,
  //   chillerPower,
  //   // copValues,
  //   loadingRates,
  //   supplyTemps,

  //   groupAPumpsActive,
  //   // groupAPumpsPower,
  //   groupATowersActive,
  //   // groupATowersPower,
  //   groupBPumpsActive,
  //   // groupBPumpsPower,
  //   groupBPumpFrequency,
  //   groupBTowersActive,
  //   // groupBTowersPower,
  //   groupBTowerSpeed,
  // })

  // 更新节点
  const activeNodeIds = updateNodes(
    activeChillers,
    loadingRates,
    supplyTemps,

    groupAPumpsActive,
    groupATowersActive,

    groupBPumpsActive,
    groupBPumpFrequency,

    groupBTowersActive,
    groupBTowerSpeed,
  )
  updateEdges(activeNodeIds)
}

watch(
  () => lastStrategyRow.value,
  (newVal) => {
    if (!newVal?.row) return
    analyzeTheRecord(newVal.row)
  },
)
</script>

<template>
  <div style="width: 100%; overflow-x: auto">
    <svg width="1440" height="252">
      <text x="160" y="10" fill="#999" font-size="12" font-family="Arial">
        {{ `冷量预测: ${predictedLoad} kW` }}
      </text>

      <text x="320" y="10" fill="#999" font-size="12" font-family="Arial">
        {{ `冷量需求: ${coolingDemand} kW` }}
      </text>

      <text x="480" y="10" fill="#999" font-size="12" font-family="Arial">
        {{ `机组总能耗: ${totalEnergy} kW` }}
      </text>

      <!-- 边打底 -->
      <polyline
        v-for="pl in backPolylines"
        :key="pl.id"
        :class="pl.cls"
        :points="pl.points"
        stroke-width="4"
      />

      <!-- 边 -->
      <polyline
        v-for="pl in polylines"
        :key="pl.id"
        :class="pl.cls"
        :points="pl.points"
        stroke-width="4"
      />

      <!-- 冷冻侧 -->
      <path
        d="M360 62 V86 H250 A10 10 0 0 0 230 86 H130 A10 10 0 0 0 110 86 H0"
        fill="none"
        stroke="#eee"
        stroke-width="4"
      />

      <path d="M360 124 V148 H0" fill="none" stroke="#eee" stroke-width="4" />

      <path
        d="M360 186 V210 H250 A10 10 0 0 0 230 210 H0"
        fill="none"
        stroke="#eee"
        stroke-width="4"
      />

      <!-- 节点 -->
      <CustomNode v-for="cc in circles" :key="cc.id" :cc="cc" />
    </svg>
  </div>
</template>

<style>
circle {
  fill: #eee;
  stroke: #eee;
}

polyline {
  fill: none;
}

.back-line {
  stroke: #eee;
}

/* 定义绘制动画 */
@keyframes flow {
  from {
    stroke-dashoffset: 20;
  }

  to {
    stroke-dashoffset: 0;
    /* 虚线周期总长度（实线+间隙） */
  }
}

.flowing-line {
  stroke: #13ce66;
  stroke-dasharray: 10 10;
  /* 实线长20px，间隙20px */
  animation: flow 1s linear infinite;
}
</style>
