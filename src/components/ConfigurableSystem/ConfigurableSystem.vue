<script setup lang="ts">
import { ref, watch } from 'vue'
import ConfigurableNode from './ConfigurableNode.vue'
import type { SafeAny } from '@/api/carnot'

const props = defineProps<{
  config: SafeAny
  dataRecord: SafeAny
}>()

const nodes = ref<SafeAny[]>([])
const edges = ref<SafeAny[]>([])
const systemMetrics = ref<Array<{ label: string, value: string }>>([])

const updateSystem = (record: SafeAny) => {
  if (!record || !props.config) return

  // Deep copy config to avoid modifying the original prop object
  const allNodes = JSON.parse(JSON.stringify(props.config.nodes))
  const allEdges = JSON.parse(JSON.stringify(props.config.edges))

  // --- 1. Determine active nodes ---
  const activeNodeIds = new Set<string>()
  const activeNodeData: { [key: string]: { ids: number[], data: { [key: string]: number[] } } } = {}

  for (const type in props.config.dataMap.activeNodes) {
    const { dataKey, idMap } = props.config.dataMap.activeNodes[type]
    const activeIdsFromRecord = JSON.parse(record[dataKey] || '[]')
    activeIdsFromRecord.forEach((id: number) => activeNodeIds.add(idMap[id]))

    activeNodeData[type] = { ids: activeIdsFromRecord, data: {} }

    // Pre-load metric data for this active group
    if (props.config.dataMap.nodeMetrics[type]) {
      props.config.dataMap.nodeMetrics[type].forEach((metric: SafeAny) => {
        activeNodeData[type].data[metric.key] = JSON.parse(record[metric.key] || '[]')
      })
    }
  }

  // --- 2. Update nodes with metrics ---
  allNodes.forEach((node: SafeAny) => {
    if (activeNodeIds.has(node.id)) {
      node.cls = 'progress-ring'
      node.metrics = []

      const nodeType = node.type
      const metricConfig = props.config.dataMap.nodeMetrics[nodeType]
      if (metricConfig) {
        const idMap = props.config.dataMap.activeNodes[nodeType].idMap
        const recordId = Object.keys(idMap).find(key => idMap[key] === node.id)
        const activeIds = activeNodeData[nodeType].ids
        // 修复类型错误：检查 recordId 是否存在
        if (recordId !== undefined) {
          const indexInRecord = activeIds.indexOf(parseInt(recordId, 10))

          if (indexInRecord !== -1) {
            metricConfig.forEach((metric: SafeAny) => {
              const value = activeNodeData[nodeType].data[metric.key][indexInRecord]
              if (value !== undefined) {
                node.metrics.push({
                  label: metric.label,
                  value: value.toFixed(metric.precision),
                  unit: metric.unit,
                })
              }
            })
          }
        }
      }
    }
  })

  // --- 3. Update edges ---
  allEdges.forEach((edge: SafeAny) => {
    if (activeNodeIds.has(edge.from) && activeNodeIds.has(edge.to)) {
      edge.cls = 'flowing-line'
    } else {
      edge.cls = ''
    }
  })

  // --- 4. Update system-level metrics ---
  const newSystemMetrics: Array<{ label: string, value: string }> = []
  props.config.dataMap.systemMetrics.forEach((metric: SafeAny) => {
    let value = record[metric.key];
    if (metric.aggregate === 'sum') {
      const values = JSON.parse(record[metric.key] || '[]');
      value = values.reduce((acc: number, cur: number) => acc + cur, 0).toFixed(metric.precision);
    }
    newSystemMetrics.push({
      label: `${metric.label}`,
      value: `${value} ${metric.unit}`
    })
  })

  nodes.value = allNodes
  edges.value = allEdges
  systemMetrics.value = newSystemMetrics
}

watch(
  () => props.dataRecord,
  (newRecord) => {
    updateSystem(newRecord)
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div style="width: 100%; overflow-x: auto">
    <svg width="1440" height="252">
      <!-- System Metrics -->
      <text v-for="(metric, index) in systemMetrics" :key="metric.label" :x="160 + index * 160" y="10" fill="#999"
        font-size="12" font-family="Arial">
        {{ `${metric.label}: ${metric.value}` }}
      </text>

      <!-- Background Edges -->
      <polyline v-for="pl in config.edges" :key="pl.id" class="back-line" :points="pl.points" stroke-width="4" />

      <!-- Flowing Edges -->
      <polyline v-for="pl in edges" :key="pl.id" :class="pl.cls" :points="pl.points" stroke-width="4" />

      <!-- Hardcoded paths for reference (can be moved to config later) -->
      <path d="M360 62 V86 H250 A10 10 0 0 0 230 86 H130 A10 10 0 0 0 110 86 H0" fill="none" stroke="#eee"
        stroke-width="4" />
      <path d="M360 124 V148 H0" fill="none" stroke="#eee" stroke-width="4" />
      <path d="M360 186 V210 H250 A10 10 0 0 0 230 210 H0" fill="none" stroke="#eee" stroke-width="4" />

      <!-- Nodes -->
      <ConfigurableNode v-for="cc in nodes" :key="cc.id" :cc="cc" />
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

@keyframes flow {
  from {
    stroke-dashoffset: 20;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.flowing-line {
  stroke: #13ce66;
  stroke-dasharray: 10 10;
  animation: flow 1s linear infinite;
}
</style>
