import { IndexedDB } from '../api/indexed_db'
import { getFirstStrategy, getStrategys } from '../api/cbos'
import { isoToLocalFormat } from '../tool/time'
import { fluxToJson } from '../tool/flux_to_json'
import { jsonToCsvRow } from '../tool/json_to_csv'

import type { SafeAny } from '../api/carnot'

export type FluxRow = {
  _time: string // 主键字段（时间戳）
  device: string
  _field: string
  _measurement: string
  _value: number
}

class WorkerDB extends IndexedDB {
  static override async getDB() {
    if (!self.window) {
      return super.getDB()
    }
    throw new Error('请在 Web Worker 中使用')
  }
}

class TimerJob {
  private static readonly INTERVAL = 1000 * 60 * 5 // 5分钟
  private static instance: number | null = null
  private static running = false

  private static async getStart() {
    let start = 0

    // 查找 indexedDB 最后一条数据
    const latestStrategy: SafeAny = await WorkerDB.getLast()

    if (!latestStrategy) {
      // 如果没有数据，查找云端第一条数据
      const firstCloudStrategy: SafeAny = await getFirstStrategy()

      const _time = firstCloudStrategy[0]?._time
      if (_time) {
        const localTime = isoToLocalFormat(_time)
        start = localTime.start
      }
    } else {
      start = latestStrategy.time + 60 * 15 // + 15分钟
    }

    if (start === 0) {
      throw new Error('云端数据为空')
    }

    return start
  }

  // 分页查询时间范围 60 * 60 * 24 = 86400 秒 一天
  private static async paginateTimeRange(start: number, interval = 60 * 60 * 24) {
    // 验证输入有效性
    if (typeof start !== 'number') {
      throw new Error('Invalid timestamp format')
    }

    const stop = Math.floor(Date.now() / 1000) // 当前时间戳

    // 计算页数
    const pages = []

    // 生成分页数据
    let currentStart = start
    while (currentStart < stop) {
      const currentStop = Math.min(currentStart + interval, stop)
      pages.push({
        start: currentStart,
        stop: currentStop,
      })
      currentStart = currentStop
    }

    return pages
  }

  private static async getStrategys(start: number, stop: number) {
    const result = await getStrategys(start, stop)

    const timeMap = new Map<string, FluxRow[]>()
    result.forEach((item: FluxRow) => {
      const time = item._time
      if (!timeMap.has(time)) {
        timeMap.set(time, [])
      }
      timeMap.get(time)?.push(item)
    })

    const timeMapEntries = Array.from(timeMap.entries())

    const strategies = timeMapEntries.map(([key, value]) => {
      const { key: time, json, request } = fluxToJson(key, value)
      const row = jsonToCsvRow(json)
      return { time, row, request: JSON.stringify(request) }
    })

    // 保存数据到 indexedDB
    // console.log({ strategies })
    await WorkerDB.batchUpsert(strategies)
  }

  static async doJob() {
    try {
      if (this.running) return
      this.running = true

      const start = await this.getStart()

      const pages = await this.paginateTimeRange(start)

      for (let i = 0, len = pages.length; i < len; i++) {
        const page = pages[i]
        // console.log({ page })
        // 处理数据
        await this.getStrategys(page.start, page.stop)
      }
    } catch (error: SafeAny) {
      self.postMessage({ method: 'doJobBack', type: 'error', message: error.message })
    } finally {
      this.running = false
      self.postMessage({ method: 'doJobBack', type: 'heartbeat', time: Date.now() })
    }
  }

  static start() {
    if (this.instance) return
    // 使用箭头函数保持 this 上下文
    this.instance = self.setInterval(() => {
      this.doJob()
    }, this.INTERVAL)
    this.doJob() // 立即执行一次
  }

  static stop() {
    if (!this.instance) return

    self.clearInterval(this.instance)
    this.instance = null
  }
}

self.addEventListener('message', (e) => {
  // 接收主线程消息
  const data = e.data

  switch (data.method) {
    case 'start':
      TimerJob.start()
      break
    case 'stop':
      TimerJob.stop()
      break
    default:
      self.postMessage({ data, message: 'Unknown method' })
  }
})
