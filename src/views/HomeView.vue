<script setup lang="ts">
import { onMounted, ref, shallowRef, reactive, nextTick, onBeforeUpdate } from 'vue'
import { formatBytes } from '@/tool/format_bytes'
import FromCsv from '@/components/FromCsv.vue'
import ChillerStrategy from '@/components/ChillerStrategy.vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings.store'
import { ElMessage } from 'element-plus'
import { useDebounceFn } from '@vueuse/core'

import type { SafeAny } from '@/api/carnot'

interface TableRow {
  id: string
  parentId: string | null
  [key: string]: SafeAny
}

// 存储相关
const settingsStore = useSettingsStore()
const { fromCsv } = storeToRefs(settingsStore)

// 存储配额状态
const storageInfo = reactive({
  usage: '0 B',
  quota: '0 B',
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

// 防抖处理（100ms）
const debouncedScroll = useDebounceFn((index: number) => {
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
const handleRowSelection = (newIndex: number) => {
  if (fromCsv.value) return

  // 边界处理（循环）
  if (newIndex < 0) newIndex = data.value.length - 1
  if (newIndex >= data.value.length) newIndex = 0

  currentIndex.value = newIndex
  selectedRow.value = data.value[newIndex] || null
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
  try {
    if (value) {
      settingsStore.setCsv('')
    } else {
      await settingsStore.handleUploadCsvFromIndexedDB()
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

// 生命周期
onMounted(async () => {
  // 获取存储信息
  try {
    const estimate = await navigator.storage.estimate()
    storageInfo.usage = formatBytes(estimate.usage ?? 0)
    storageInfo.quota = formatBytes(estimate.quota ?? 0)
  } catch (error) {
    console.error('Storage estimate failed:', error)
  }

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
</script>

<template>
  <div class="storage-info">
    <span>已用空间: {{ storageInfo.usage }} / 总配额: {{ storageInfo.quota }}</span>
  </div>

  <div class="data-source">
    <h2>配置数据来源</h2>
    <el-switch
      v-model="fromCsv"
      :style="{
        '--el-switch-on-color': '#ff4949',
        '--el-switch-off-color': '#13ce66',
      }"
      active-text="从 CSV 文件"
      inactive-text="从 AI 策略"
      @change="handleFromCsvChange"
    />
  </div>

  <FromCsv v-if="fromCsv" @change="refreshTable" />
  <ChillerStrategy v-else :selected-row="selectedRow" />

  <div
    ref="tableContainer"
    tabindex="0"
    class="virtual-table-container"
    @keydown="handleKeyDown"
    style="height: 400px"
  >
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          ref="tableRef"
          :columns="columns"
          :data="data"
          :width="width"
          :height="height"
          :estimated-row-height="40"
          :buffer-size="20"
          :row-class="getRowClass"
          :row-event-handlers="{ onClick: unifiedEventHandlers.click }"
          fixed
        >
          <template #empty>
            <div class="empty-table">
              <el-empty description="暂无数据" />
            </div>
          </template>
        </el-table-v2>
      </template>
    </el-auto-resizer>
  </div>
</template>

<style>
.storage-info {
  margin-bottom: 1rem;
  color: var(--el-text-color-secondary);
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
</style>
