<script setup lang="ts">
// import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings.store'
import { IndexedDB } from '@/api/indexed_db'

const emit = defineEmits(['change'])

const settingsStore = useSettingsStore()

// onMounted(() => { })
const handleUploadCsv = async () => {
  const rows = await IndexedDB.getAll()
  const csv = rows.map(item => item.row)
  settingsStore.setCsv([
    '时间戳,冷量需求(kW),运行机组,负载率(%),供水温度(°C),机组能耗(kW),COP,水泵_A,冷却塔_A,水泵能耗_A(kW),冷却塔能耗_A(kW),水泵_B,冷却塔_B,水泵频频率,冷却塔转速,水泵能耗_B(kW),冷却塔能耗_B(kW),冷量预测(kW)',
    ...csv
  ].join('\n'))

  emit('change')
}
</script>

<template>
  <h2>AI 策略</h2>
  <div style="height: 242px"></div>
  <el-button type="primary" @click="handleUploadCsv">加载 AI 策略</el-button>
</template>
