<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings.store'
import SystemState from './SystemState.vue'
import { secondsToTime } from '@/tool/time'
import type { SafeAny } from '@/api/carnot'

const props = defineProps<{
  selectedRow: SafeAny | null
}>()

const settingsStore = useSettingsStore()
const { lastStrategyRow } = storeToRefs(settingsStore)

watch(
  () => props.selectedRow,
  (newValue: SafeAny | null) => {
    // console.log(newValue)
    // console.log(lastStrategyRow.value)
    if (newValue) {
      lastStrategyRow.value = {
        time: Math.floor(new Date(newValue['时间戳']).getTime() / 1000),
        row: newValue,
        requestTime: Math.floor(Date.now() / 1000),
      }
    }
  },
)
</script>

<template>
  <h2>
    AI 策略
    <span class="sub-title">
      {{ lastStrategyRow?.time ? `生成时间: ${secondsToTime(lastStrategyRow.time)}` : '' }}
    </span>
    <span class="sub-title">
      {{
        lastStrategyRow?.requestTime
          ? `请求时间: ${secondsToTime(lastStrategyRow.requestTime)}`
          : ''
      }}
    </span>
  </h2>
  <SystemState />
</template>

<style scoped>
.sub-title {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
  font-weight: normal;
}
</style>
