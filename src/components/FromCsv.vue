<script setup lang="ts">
import { ref } from 'vue'
import { genFileId } from 'element-plus'
import { useSettingsStore } from '@/stores/settings.store'
import { UploadFilled } from '@element-plus/icons-vue'
import { parse } from 'csv-parse/browser/esm'

import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import type { SafeAny } from '@/api/carnot'

const emit = defineEmits(['change'])

const settingsStore = useSettingsStore()

const upload = ref<UploadInstance>()

const columns = ref<SafeAny[]>([])
const data = ref<SafeAny[]>([])

// const refreshTable = () => {
//   const generateColumns = (heads: string[]) =>
//     heads.map((head) => ({
//       key: head,
//       dataKey: head,
//       title: head,
//       width: 180,
//     }))
//   const generateData = (records: SafeAny[], prefix = 'row-') =>
//     records.map((record, rowIndex) => ({
//       ...record,
//       id: `${prefix}${rowIndex}`,
//       parentId: null,
//     }))

//   columns.value = generateColumns(settingsStore.heads)
//   data.value = generateData(settingsStore.records)
// }

const handleExceed: UploadProps['onExceed'] = (files) => {
  // console.log('[joe] onExceed', files)
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
        (err) => {
          if (err) {
            console.error('[joe] parse error', err)
            return
          }
          settingsStore.setCsv(content)

          emit('change')
        },
      )
    }
  }
}

const handleRemoveCsv = () => {
  upload.value!.clearFiles()
  settingsStore.setCsv('')

  emit('change')
}
</script>

<template>
  <!-- <div style="height: 332px;"> -->
  <h2>CSV 文件</h2>
  <div style="height: 242px">
    <el-upload
      ref="upload"
      drag
      accept="text/csv"
      :auto-upload="false"
      :limit="1"
      :on-exceed="handleExceed"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">Drop .csv file here or <em>click to upload</em></div>
      <template #tip>
        <div class="el-upload__tip">Only support .csv files</div>
      </template>
    </el-upload>
  </div>
  <el-button type="danger" @click="handleRemoveCsv">清除 CSV 数据</el-button>
  <!-- </div> -->
</template>
