<script setup lang="ts">
import { onMounted, ref } from 'vue'
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

// 记录当前选中行的 ID
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

// 点击行事件处理
const rowEventHandlers = {
  onClick: ({ rowData }: { rowData: SafeAny }) => {
    if (fromCsv.value) return

    selectedRow.value = rowData
  },
}

// 动态行类名（高亮逻辑）
const getRowClass = ({ rowData }: { rowData: SafeAny }) => {
  if (fromCsv.value) return ''

  return rowData.id === selectedRow.value?.id ? 'highlight-row' : ''
}

onMounted(() => {
  navigator.storage.estimate().then((estimate) => {
    usage.value = formatBytes(estimate.usage!)
    quota.value = formatBytes(estimate.quota!)
  })

  refreshTable()
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

  <div style="height: 400px">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          :columns="columns"
          :data="data"
          :width="width"
          :height="height"
          fixed
          :row-class="getRowClass"
          :row-event-handlers="rowEventHandlers"
        />
      </template>
    </el-auto-resizer>
  </div>
</template>

<style>
.highlight-row {
  background-color: var(--el-color-success-light-5) !important;
}
</style>
