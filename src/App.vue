<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useSettingsStore } from './stores/settings.store'
import { getCurrentUser, loginCarnot } from './api/carnot'
import CronJobWorker from '@/worker/cron_job.worker?worker'

import emitter from '@/tool/mitt'

const route = useRoute()
const settingsStore = useSettingsStore()

const worker = new CronJobWorker()

worker.onmessage = async (event) => {
  if (event.data.type === 'heartbeat') {
    if (!settingsStore.fromCsv) {
      // await settingsStore.handleUploadCsvFromIndexedDB() // event.data.time
      // 通知
      emitter.emit('heartbeat')
    }
  }
}

worker.onerror = (error) => {
  console.error('Worker error:', error)
}

const routeName = ref('')

const asideWidth = computed(() => {
  return settingsStore.isCollapse ? '64px' : '240px'
})

watch(route, (to) => {
  routeName.value = to.name as string
})

onMounted(async () => {
  worker.postMessage({ method: 'start' })

  const user = await getCurrentUser()

  if (!user) {
    await loginCarnot()
  }
})

onBeforeUnmount(() => {
  worker.postMessage({ method: 'stop' })
  worker.terminate()
})
</script>

<template>
  <el-container>
    <el-aside :width="asideWidth">
      <!-- <el-affix :offset="16"> -->
      <div class="toggle-btn" @click="settingsStore.setIsCollapse(!settingsStore.isCollapse)">
        <el-icon v-if="!settingsStore.isCollapse">
          <fold />
        </el-icon>

        <el-icon v-else>
          <expand />
        </el-icon>
      </div>

      <el-menu :default-active="routeName" :collapse="settingsStore.isCollapse" router>
        <el-menu-item index="home" route="/">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>Settings</template>
        </el-menu-item>

        <el-menu-item index="chiller" route="/chiller">
          <el-icon>
            <money />
          </el-icon>
          <template #title>Status - Chiller</template>
        </el-menu-item>

        <el-menu-item index="cdwp" route="/cdwp">
          <el-icon>
            <goblet />
          </el-icon>
          <template #title>Status - CDWP</template>
        </el-menu-item>

        <el-menu-item index="cooling-tower" route="/cooling-tower">
          <el-icon>
            <van />
          </el-icon>
          <template #title>Status - Cooling Tower</template>
        </el-menu-item>

        <el-menu-item index="chiller-power" route="/chiller-power">
          <el-icon>
            <mic />
          </el-icon>
          <template #title>Power - Chiller</template>
        </el-menu-item>

        <el-menu-item index="cdwp-power" route="/cdwp-power">
          <el-icon>
            <memo />
          </el-icon>
          <template #title>Power - CDWP</template>
        </el-menu-item>

        <el-menu-item index="ct-power" route="/ct-power">
          <el-icon>
            <files />
          </el-icon>
          <template #title>Power - Cooling Tower</template>
        </el-menu-item>

        <el-menu-item index="cooling-load" route="/cooling-load">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <template #title>Cooling Load</template>
        </el-menu-item>
      </el-menu>
      <!-- </el-affix> -->
    </el-aside>

    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.toggle-btn {
  padding-left: 24px;
  cursor: pointer;
}
</style>
