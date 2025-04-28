<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { genFileId } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { parse } from 'csv-parse/browser/esm'

import { useSettingsStore } from '@/stores/settings.store'
// import { ElNotification } from 'element-plus'

import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import type { SafeAny } from '@/api/carnot'

// const isEqualHeads = (heads: string[]) => {
//   const headTemplate = [
//     '时间戳',
//     '冷量需求(kW)',
//     '运行机组',
//     '负载率(%)',
//     '供水温度(°C)',
//     '机组能耗(kW)',
//     'COP',
//     '水泵_A',
//     '冷却塔_A',
//     '水泵能耗_A(kW)',
//     '冷却塔能耗_A(kW)',
//     '水泵_B',
//     '冷却塔_B',
//     '水泵频频率',
//     '冷却塔转速',
//     '水泵能耗_B(kW)',
//     '冷却塔能耗_B(kW)',
//     '冷量预测(kW)',
//   ]
//   // if (heads.length !== headTemplate.length) return false
//   // if (heads.some((head) => !headTemplate.includes(head))) return false
//   // if (headTemplate.some((head) => !heads.includes(head))) return false
//   return true
// }

const settingsStore = useSettingsStore()
const token = ref('')

const upload = ref<UploadInstance>()

const columns = ref<SafeAny[]>([])
const data = ref<SafeAny[]>([])

const setToken = (value: string) => {
  settingsStore.setCarnotToken(value)
}

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

const handleExceed: UploadProps['onExceed'] = (files) => {
  console.log('[joe] onExceed', files)
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

const handleChange: UploadProps['onChange'] = (file) => {
  if (file.status === 'ready') {
    columns.value = []
    data.value = []

    // 读取文件内容
    const reader = new FileReader()
    reader.readAsText(file.raw as Blob)
    reader.onload = (e) => {
      const content = e.target?.result as string
      // console.log(content)
      parse(
        content,
        {
          columns: true,
          skip_empty_lines: true,
        },
        (err, records) => {
          if (err) {
            console.error('[joe] parse error', err)
            return
          }

          // 提取表头
          const heads = records[0] ? Object.keys(records[0]) : []

          columns.value = generateColumns(heads)
          data.value = generateData(records)

          // // 保存
          // if (!isEqualHeads(heads)) {
          //   ElNotification({
          //     title: 'Error',
          //     message: '文件表头检测不通过',
          //     type: 'error',
          //   })
          //   return
          // }

          settingsStore.setCsv(content)
        },
      )
    }
  }
}

const handleRemoveCsv = () => {
  upload.value!.clearFiles()
  settingsStore.setCsv('')
  columns.value = []
  data.value = []
}

onMounted(() => {
  // 读取 token
  token.value = settingsStore.getCarnotToken()

  // csv
  columns.value = generateColumns(settingsStore.heads)
  data.value = generateData(settingsStore.records)
})
</script>

<template>
  <h2>Carnot Bearer Token</h2>
  <el-input v-model="token" @change="setToken"></el-input>
  <h2>上传 CSV 文件</h2>
  <el-upload ref="upload" drag accept="text/csv" :auto-upload="false" :limit="1" :on-exceed="handleExceed"
    :on-change="handleChange">
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">Drop .csv file here or <em>click to upload</em></div>
    <template #tip>
      <div class="el-upload__tip">Only support .csv files</div>
    </template>
  </el-upload>

  <div style="height: 400px">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2 :columns="columns" :data="data" :width="width" :height="height" fixed />
      </template>
    </el-auto-resizer>
  </div>

  <div style="height: 8px"></div>
  <el-button type="danger" @click="handleRemoveCsv">清除 CSV 数据</el-button>
</template>
