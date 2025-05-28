<script setup lang="ts">
import {
  onMounted,
  ref,
  shallowRef,
  reactive,
  nextTick,
  onBeforeUpdate,
  onBeforeUnmount,
} from 'vue'
import { formatBytes } from '@/tool/format_bytes'
import FromCsv from '@/components/FromCsv.vue'
import ChillerStrategy from '@/components/ChillerStrategy.vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings.store'
import { ElMessage } from 'element-plus'
import { useDebounceFn } from '@vueuse/core'
import { IndexedDB } from '@/api/indexed_db'
import emitter from '@/tool/mitt'

import type { SafeAny } from '@/api/carnot'

// Add type declaration for performance.memory
declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number
      totalJSHeapSize: number
      usedJSHeapSize: number
    }
  }
}

interface TableRow {
  id: string
  parentId: string | null
  [key: string]: SafeAny
}

// 存储相关
const settingsStore = useSettingsStore()
const { fromCsv } = storeToRefs(settingsStore)

const isPlay = ref(false)
let zero = 0 // 用于存储时间戳
let rafId = 0 // 动画帧ID

const isOpen = ref(false) // 是否显示 MQTT 控制指令

// 存储配额状态
const storageInfo = reactive({
  usage: '0 B',
  quota: '0 B',
})
// 在组件中新增内存信息响应式对象
const memoryInfo = reactive({
  jsHeapSizeLimit: '0 B',
  totalJSHeapSize: '0 B',
  usedJSHeapSize: '0 B',
})

// 表格相关
const columns = shallowRef<Array<{ key: string; dataKey: string; title: string; width: number }>>(
  [],
)
const data = shallowRef<TableRow[]>([]) // 使用 shallowRef 优化大数据性能
const currentIndex = ref(-1)
const tableContainer = ref<HTMLElement | null>(null)
const tableRef = ref<SafeAny>(null)
const selectedRow = ref<TableRow | null>(null)
const request = ref<SafeAny[]>([])
const mqtt = ref<SafeAny[]>([])

const fieldMap = new Map([
  ['Chiller1', 'CH1 上次启停状态'],
  ['Chiller3', 'CH3 上次启停状态'],
  ['Chiller4', 'CH4 上次启停状态'],
  ['SupplyTemp1', 'CH1 冷冻水供水温度(°C)'],
  ['SupplyTemp3', 'CH3 冷冻水供水温度(°C)'],
  ['SupplyTemp4', 'CH4 冷冻水供水温度(°C)'],
  ['EnteringTemp1', 'CH1 冷冻水回水温度(°C)'],
  ['EnteringTemp3', 'CH3 冷冻水回水温度(°C)'],
  ['EnteringTemp4', 'CH4 冷冻水回水温度(°C)'],
  ['EnteringTemp_CD1', 'CH1 冷凝水回水温度(°C)'],
  ['EnteringTemp_CD3', 'CH3 冷凝水回水温度(°C)'],
  ['EnteringTemp_CD4', 'CH4 冷凝水回水温度(°C)'],
  ['Pred_Q', '冷量预测(kW)'],
  ['Humidity', '实时湿度(%)'],
  ['Temperature', '实时温度(°C)'],
])
const fieldKeys = Array.from(fieldMap.keys())

const translateField = (field: string) => {
  return fieldMap.get(field) || field
}

const transitionValue = (field: string, value: number) => {
  if (field === 'Chiller1' || field === 'Chiller3' || field === 'Chiller4') {
    return value ? '开机' : '关机'
  }
  return value.toFixed(2)
}

// 防抖处理（100ms）
const debouncedScroll = useDebounceFn((index: number) => {
  if (!index) return
  tableRef.value?.scrollToRow(index, 'start')
}, 100)

// 生成冻结数据优化内存
const generateColumns = (heads: string[]) => {
  return heads.map((head) =>
    Object.freeze({
      key: head,
      dataKey: head,
      title: head,
      width: 180,
    }),
  )
}

const generateData = (records: SafeAny[]) => {
  return Object.freeze(
    records.map((record, rowIndex) =>
      Object.freeze({
        ...record,
        id: `row-${rowIndex}`,
        parentId: null,
      }),
    ),
  ) as TableRow[]
}

// 带错误处理的刷新逻辑
const refreshTable = async () => {
  try {
    performance.mark('refreshStart')

    if (!fromCsv.value) {
      await settingsStore.handleUploadCsvFromIndexedDB()
    }

    const newHeads = [...settingsStore.heads]
    const newData = generateData(settingsStore.records)

    // 保持引用不变性优化
    columns.value = generateColumns(newHeads)
    data.value = newData

    handleRowSelection(fromCsv.value ? -1 : 0)

    performance.measure('refreshTable', 'refreshStart')
  } catch (error) {
    console.error('Table refresh failed:', error)
    ElMessage.error(`数据加载失败: ${(error as Error).message}`)
  }
}

// 增强的滚动逻辑
const scrollToCurrentRow = () => {
  nextTick(() => {
    if (!tableContainer.value || currentIndex.value === -1) return

    const viewportHeight = tableContainer.value.clientHeight
    const rowHeight = 40 // 根据实际行高调整
    const visibleRows = Math.floor(viewportHeight / rowHeight)
    const targetIndex = Math.max(0, currentIndex.value - Math.floor(visibleRows / 2))

    debouncedScroll(targetIndex)
  })
}

// 改进的行选择逻辑（带循环）
const handleRowSelection = async (newIndex: number) => {
  if (fromCsv.value) return

  // 边界处理（循环）
  if (newIndex < 0) newIndex = data.value.length - 1
  if (newIndex >= data.value.length) newIndex = 0

  currentIndex.value = newIndex
  selectedRow.value = data.value[newIndex] || null

  // 查找 request 和 mqtt
  if (selectedRow.value) {
    const time = Math.floor(new Date(selectedRow.value['时间戳']).getTime() / 1000)
    const row = await IndexedDB.getByTime(time)
    const _request = row?.request ? JSON.parse(row.request) : []
    // const _mqtt = row?.mqtt ? JSON.parse(row.mqtt) : []

    request.value = fieldKeys.map((key) => {
      const value = _request.find((r: SafeAny) => r._field === key)
      return {
        _field: key,
        _value: value ? value._value : 0,
      }
    })

    mqtt.value = row?.mqtt ? JSON.parse(row.mqtt) : []
  }

  scrollToCurrentRow()
}

// 统一事件处理
const unifiedEventHandlers = {
  keyboard: {
    ArrowDown: () => handleRowSelection(currentIndex.value + 1),
    ArrowUp: () => handleRowSelection(currentIndex.value - 1),
    Home: () => handleRowSelection(0),
    End: () => handleRowSelection(data.value.length - 1),
  },
  click: ({ rowIndex }: { rowIndex: number }) => handleRowSelection(rowIndex),
}

// 动态行类名（优化后）
const getRowClass = ({ rowIndex }: { rowIndex: number }) =>
  fromCsv.value ? '' : rowIndex === currentIndex.value ? 'highlight-row' : ''

// 带防抖的键盘处理
const handleKeyDown = useDebounceFn((e: KeyboardEvent) => {
  const handler = unifiedEventHandlers.keyboard[e.key as keyof typeof unifiedEventHandlers.keyboard]
  handler?.()
}, 100)

// CSV切换处理
const handleFromCsvChange = async (value: boolean) => {
  isPlay.value = false

  try {
    if (value) {
      settingsStore.setCsv('')
    }

    localStorage.setItem('vue-plotly-demo-from-csv', String(value))
    await refreshTable()

    // 重置滚动位置
    nextTick(() => {
      tableRef.value?.scrollToTop(0)
    })
  } catch (error: SafeAny) {
    ElMessage.error(error.message || '切换数据源失败')
  }
}

const handleHeartbeat = () => {
  if (!fromCsv.value) {
    ElMessage.success('自动更新数据成功')

    refreshTable()

    // console.log('自动更新数据成功')
  }
}

const firstPlayStep = (timeStamp: number) => {
  zero = timeStamp
  playStep(timeStamp)
}

const playStep = (timeStamp: number) => {
  // console.log({ zero, timeStamp })
  if (timeStamp - zero > 3000) {
    if (!FromCsv.value && isPlay.value) {
      handleRowSelection(currentIndex.value - 1)
    }

    getSystemInfo()

    zero = timeStamp
  }

  rafId = requestAnimationFrame(playStep)
}

// 获取系统信息
const getSystemInfo = async () => {
  // 获取存储信息
  try {
    const estimate = await navigator.storage.estimate()
    storageInfo.usage = formatBytes(estimate.usage ?? 0)
    storageInfo.quota = formatBytes(estimate.quota ?? 0)

    if (performance.memory) {
      memoryInfo.jsHeapSizeLimit = formatBytes(performance.memory.jsHeapSizeLimit)
      memoryInfo.totalJSHeapSize = formatBytes(performance.memory.totalJSHeapSize)
      memoryInfo.usedJSHeapSize = formatBytes(performance.memory.usedJSHeapSize)
    }
  } catch (error) {
    console.error('Storage estimate failed:', error)
  }
}

// 生命周期
onMounted(async () => {
  rafId = requestAnimationFrame(firstPlayStep)

  emitter.on('heartbeat', handleHeartbeat)

  nextTick(() => {
    refreshTable()
  })
})

onBeforeUpdate(() => {
  // 自动聚焦
  nextTick(() => {
    tableContainer.value?.focus({ preventScroll: true })
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)

  emitter.off('heartbeat', handleHeartbeat)
})
</script>

<template>
  <div v-if="!fromCsv" class="request-wrapper">
    <div v-if="request.length" class="request-title">
      系统实时状态
      <span style="font-weight: 400;">
        {{ selectedRow!['时间戳'] }}
      </span>
    </div>
    <!-- <div style="max-height: 186px; overflow-y: auto;"> -->
    <div v-for="r in request" :key="r._field">
      <span class="request-field">{{ translateField(r._field) }}</span>
      <span class="request-value">{{ transitionValue(r._field, r._value) }}</span>
    </div>
    <!-- </div> -->
  </div>

  <div class="system-info">
    <span>已用空间: {{ storageInfo.usage }} / 总配额: {{ storageInfo.quota }}</span>
    <template v-if="memoryInfo.jsHeapSizeLimit !== '0 B'">
      <span>JS堆限制: {{ memoryInfo.jsHeapSizeLimit }} / 已用堆内存: {{ memoryInfo.usedJSHeapSize }} /
        总堆内存: {{ memoryInfo.totalJSHeapSize }}</span>
    </template>
  </div>

  <div class="data-source">
    <h2>配置数据来源</h2>

    <div style="height: 16px"></div>

    <el-switch inline-prompt v-model="fromCsv" :style="{
      '--el-switch-on-color': '#ff4949',
      '--el-switch-off-color': '#13ce66',
    }" active-text="从 CSV 文件" inactive-text="从 AI 策略" @change="handleFromCsvChange" />

    <el-switch v-if="!fromCsv" style="margin-left: 24px" inline-prompt v-model="isPlay" active-text="动画播放中..."
      inactive-text="动画已停止" />

    <el-switch v-if="!fromCsv" style="margin-left: 24px" inline-prompt v-model="isOpen" active-text="显示 MQTT 控制指令"
      inactive-text="隐藏 MQTT 控制指令" />
  </div>

  <FromCsv v-if="fromCsv" @change="refreshTable" />
  <ChillerStrategy v-else :selected-row="selectedRow" />

  <div ref="tableContainer" tabindex="0" class="virtual-table-container" @keydown="handleKeyDown" style="height: 400px">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2 ref="tableRef" :columns="columns" :data="data" :width="width" :height="height"
          :estimated-row-height="40" :buffer-size="20" :row-class="getRowClass"
          :row-event-handlers="{ onClick: unifiedEventHandlers.click }" fixed>
          <template #empty>
            <div class="empty-table">
              <el-empty description="暂无数据" />
            </div>
          </template>
        </el-table-v2>
      </template>
    </el-auto-resizer>
  </div>

  <el-drawer v-model="isOpen" direction="ltr" :modal="false" :size="320" class="mqtt-drawer" :append-to-body="true">
    <pre style="font-size: 12px;">{{ mqtt }}</pre>
  </el-drawer>
</template>

<style>
.request-title {
  margin: 4px 0 4px 0;
  font-weight: 500;
  font-size: 12px;
}

.request-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  color: #999;
  font-weight: 300;
  font-size: 12px;
}

.request-field {
  display: inline-block;
  width: 160px;
}

.request-value {
  display: inline-block;
  width: 80px;
}

.system-info {
  position: fixed;
  top: 4px;
  /* margin-bottom: 1rem; */
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.system-info span {
  margin-right: 1.5rem;
}

.data-source {
  margin: 1.5rem 0;

  h2 {
    margin-bottom: 0.8rem;
    font-size: 1.2rem;
  }
}

.virtual-table-container {
  height: 600px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--el-color-primary);
  }
}

.highlight-row {
  background-color: var(--el-color-success-light-5) !important;
  transition: background-color 0.3s ease;
}

.empty-table {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

div:has(.mqtt-drawer) {
  width: 320px;
}
</style>
