<script setup lang="ts">
import { onBeforeUpdate, onMounted, ref } from 'vue'
import { formatBytes } from '@/tool/format_bytes'
import FromCsv from '@/components/FromCsv.vue'
import ChillerStrategy from '@/components/ChillerStrategy.vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings.store'

import type { SafeAny } from '@/api/carnot'

const settingsStore = useSettingsStore()
const { fromCsv } = storeToRefs(settingsStore)

const usage = ref('')
const quota = ref('')

const columns = ref<SafeAny[]>([])
const data = ref<SafeAny[]>([])

// 记录当前选中行
const currentIndex = ref(-1) // 当前选中行索引
const tableContainer = ref<HTMLElement | null>(null) // 表格容器引用
const tableRef = ref<SafeAny>(null) // 表格引用
const selectedRow = ref<SafeAny | null>(null)

const handleFromCsvChange = async (value: boolean) => {
  if (value) {
    settingsStore.setCsv('') // 清空 CSV 数据
  } else {
    await settingsStore.handleUploadCsvFromIndexedDB()
  }

  refreshTable()

  localStorage.setItem('vue-plotly-demo-from-csv', String(value))
}

const refreshTable = () => {
  const generateColumns = (heads: string[]) =>
    heads.map((head) => ({
      key: head,
      dataKey: head,
      title: head,
      width: 180,
    }))
  const generateData = (records: SafeAny[], prefix = 'row-') =>
    records.map((record, rowIndex) => ({
      ...record,
      id: `${prefix}${rowIndex}`,
      parentId: null,
    }))

  columns.value = generateColumns(settingsStore.heads)
  data.value = generateData(settingsStore.records)

  if (!fromCsv.value) {
    selectedRow.value = data.value[0] || null
  }
}

// 统一行选择逻辑
const handleRowSelection = (newIndex: number) => {
  if (fromCsv.value || newIndex < 0 || newIndex >= data.value.length) return

  currentIndex.value = newIndex
  selectedRow.value = data.value[newIndex]
  scrollToCurrentRow()
}

// 合并事件处理逻辑
const unifiedEventHandlers = {
  // 键盘事件
  keyboard: {
    ArrowDown: () => handleRowSelection(currentIndex.value + 1),
    ArrowUp: () => handleRowSelection(currentIndex.value - 1),
  },
  // 鼠标点击事件
  click: ({ rowIndex }: { rowIndex: number }) => handleRowSelection(rowIndex),
}

// 滚动到选中行
const scrollToCurrentRow = () => {
  // 调用虚拟表格的滚动方法（假设已通过 ref 获取表格实例）
  tableRef.value?.scrollToRow(currentIndex.value, 'start')
}

// 动态行类名（优化后）
const getRowClass = ({ rowIndex }: { rowIndex: number }) =>
  fromCsv.value ? '' : rowIndex === currentIndex.value ? 'highlight-row' : ''

// 模板事件绑定
const handleKeyDown = (e: KeyboardEvent) => {
  if (unifiedEventHandlers.keyboard[e.key as keyof typeof unifiedEventHandlers.keyboard]) {
    unifiedEventHandlers.keyboard[e.key as keyof typeof unifiedEventHandlers.keyboard]()
  }
}

onMounted(() => {
  navigator.storage.estimate().then((estimate) => {
    usage.value = formatBytes(estimate.usage!)
    quota.value = formatBytes(estimate.quota!)
  })

  refreshTable()
})

onBeforeUpdate(() => {
  // 确保容器获取焦点
  tableContainer.value?.focus()
})
</script>

<template>
  <div>
    <span>已用空间: </span>
    <span>{{ usage }}</span>
    <span> / 总配额: </span>
    <span>{{ quota }}</span>
  </div>
  <div>
    <h2>配置数据来源</h2>
    <el-switch
      v-model="fromCsv"
      style="--el-switch-on-color: #ff4949; --el-switch-off-color: #13ce66"
      active-text="从 CSV 文件"
      inactive-text="从 AI 策略"
      @change="handleFromCsvChange"
    />
  </div>

  <FromCsv v-if="fromCsv" @change="refreshTable" />

  <ChillerStrategy v-else :selected-row="selectedRow" />

  <div ref="tableContainer" tabindex="0" @keydown="handleKeyDown" style="height: 400px">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          ref="tableRef"
          :columns="columns"
          :data="data"
          :width="width"
          :height="height"
          fixed
          :row-class="getRowClass"
          :row-event-handlers="{ onClick: unifiedEventHandlers.click }"
        />
      </template>
    </el-auto-resizer>
  </div>
</template>

<style>
.highlight-row {
  background-color: var(--el-color-success-light-5) !important;
}

/* 使容器可聚焦 */
div[tabindex='0']:focus {
  outline: none;
}
</style>
