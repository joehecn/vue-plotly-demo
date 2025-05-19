import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { parse } from 'csv-parse/browser/esm/sync'
import dayjs from 'dayjs'
import { IndexedDB } from '@/api/indexed_db'

import type { SafeAny } from '@/api/carnot'
import { csvHeader } from '@/config'

export type ChartDataRow = {
  x: string[]
  y: (boolean | number)[]
  name: string
  type: string
}

export const useSettingsStore = defineStore('settings', () => {
  const fromCsv = ref(localStorage.getItem('vue-plotly-demo-from-csv') === 'true')

  const isCollapse = ref(localStorage.getItem('vue-plotly-demo-is-collapse') === 'true')

  const lastStrategyRow = ref<{ requestTime: number; time: number; row: SafeAny } | null>(null)

  const setIsCollapse = (collapse: boolean) => {
    localStorage.setItem('vue-plotly-demo-is-collapse', String(collapse))
    isCollapse.value = collapse
  }

  const _carnotToken = ref(localStorage.getItem('vue-plotly-demo-carnot-token') ?? '')
  const getCarnotToken = () => _carnotToken.value
  const setCarnotToken = (token: string) => {
    localStorage.setItem('vue-plotly-demo-carnot-token', token)
    _carnotToken.value = token
  }

  const _csv = ref(localStorage.getItem('vue-plotly-demo-csv') ?? '')

  const _getRecords = (content: string) => {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    })
    return records
  }

  const getCsv = () => _csv.value
  const setCsv = (content: string) => {
    localStorage.setItem('vue-plotly-demo-csv', content)
    _csv.value = content
  }

  const records = computed(() => {
    const content = getCsv()
    if (!content) {
      return []
    }

    const records = _getRecords(content)
    return records
  })

  const recordMap = computed(() => {
    const map = new Map<string, SafeAny>()
    records.value.forEach((record: SafeAny) => {
      let recordTime = record['时间戳'] // 3/5/2025 16:00
      if (recordTime.length === 19) {
        recordTime = dayjs(recordTime, 'YYYY-MM-DD HH:mm').format('M/D/YYYY H:mm')
      }

      map.set(recordTime, record)
    })
    return map
  })

  const datetimerange = computed(() => {
    if (records.value.length === 0) return []
    const startTime = records.value[0]['时间戳']
    const endTime = records.value[records.value.length - 1]['时间戳']

    if (startTime.length === 19) {
      return [
        dayjs(startTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD'),
        dayjs(endTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD'),
      ].sort((a, b) => (a > b ? 1 : -1))
    }

    return [
      dayjs(startTime, 'M/D/YYYY H:mm').format('YYYY-MM-DD'),
      dayjs(endTime, 'M/D/YYYY H:mm').format('YYYY-MM-DD'),
    ].sort((a, b) => (a > b ? 1 : -1))
  })

  const heads = computed(() => {
    // 提取表头
    return records.value[0] ? Object.keys(records.value[0]) : []
  })

  // 运行机组 [1,2,3] -> [Chiller1, Chiller3, Chiller4]
  const filterChillerData = ([startTime, endTime]: string[]) => {
    const Chiller1: (boolean | null)[] = []
    const Chiller3: (boolean | null)[] = []
    const Chiller4: (boolean | null)[] = []
    const timestamp: string[] = []

    const chillerMap = new Map<number, (boolean | null)[]>([
      [1, Chiller1],
      [2, Chiller3],
      [3, Chiller4],
    ])

    for (
      let time = dayjs(startTime, 'YYYY-MM-DD');
      dayjs(time).isBefore(dayjs(endTime, 'YYYY-MM-DD HH:mm:ss'));
      time = time.add(15, 'minute')
    ) {
      timestamp.push(time.format('YYYY-MM-DD HH:mm:ss'))
      const recordTime = time.format('M/D/YYYY H:mm')

      if (recordMap.value.has(recordTime)) {
        const record = recordMap.value.get(recordTime)

        // console.log(record['运行机组'])
        const chillers = JSON.parse(record['运行机组'] || '[]')
        ;[1, 2, 3].forEach((chiller: number) => {
          if (chillers.includes(chiller)) {
            chillerMap.get(chiller)!.push(true)
          } else {
            chillerMap.get(chiller)!.push(false)
          }
        })
      } else {
        ;[1, 2, 3].forEach((chiller: number) => {
          chillerMap.get(chiller)!.push(null)
        })
      }
    }

    return [
      {
        x: timestamp,
        y: Chiller1,
        name: 'Chiller1',
        type: 'bar',
      },
      {
        x: timestamp,
        y: Chiller3,
        name: 'Chiller3',
        type: 'bar',
      },
      {
        x: timestamp,
        y: Chiller4,
        name: 'Chiller4',
        type: 'bar',
      },
    ]
  }
  // 水泵_A+水泵_B [1,2,3][1,2] -> [CDWP1, CDWP2, CDWP3, CDWP4, CDWP5]
  const filterCdwpData = ([startTime, endTime]: string[]) => {
    const CDWP1: (number | null)[] = []
    const CDWP2: (number | null)[] = []
    const CDWP3: (number | null)[] = []
    const CDWP4: (number | null)[] = []
    const CDWP5: (number | null)[] = []
    const timestamp: string[] = []

    const cdwpMap = new Map<string, (number | null)[]>([
      ['水泵_A1', CDWP1],
      ['水泵_A2', CDWP2],
      ['水泵_A3', CDWP3],
      ['水泵_B1', CDWP4],
      ['水泵_B2', CDWP5],
    ])

    for (
      let time = dayjs(startTime, 'YYYY-MM-DD');
      dayjs(time).isBefore(dayjs(endTime, 'YYYY-MM-DD HH:mm:ss'));
      time = time.add(15, 'minute')
    ) {
      timestamp.push(time.format('YYYY-MM-DD HH:mm:ss'))
      const recordTime = time.format('M/D/YYYY H:mm')

      if (recordMap.value.has(recordTime)) {
        const record = recordMap.value.get(recordTime)

        const cdwpAs = JSON.parse(record['水泵_A'] || '[]')
        ;[1, 2, 3].forEach((chiller: number) => {
          if (cdwpAs.includes(chiller)) {
            cdwpMap.get(`水泵_A${chiller}`)!.push(1.0)
          } else {
            cdwpMap.get(`水泵_A${chiller}`)!.push(0.0)
          }
        })

        const cdwpBs = JSON.parse(record['水泵_B'] || '[]')
        ;[1, 2].forEach((chiller: number) => {
          if (cdwpBs.includes(chiller)) {
            cdwpMap.get(`水泵_B${chiller}`)!.push(1.0)
          } else {
            cdwpMap.get(`水泵_B${chiller}`)!.push(0.0)
          }
        })
      } else {
        ;[1, 2, 3].forEach((chiller: number) => {
          cdwpMap.get(`水泵_A${chiller}`)!.push(null)
        })
        ;[1, 2].forEach((chiller: number) => {
          cdwpMap.get(`水泵_B${chiller}`)!.push(null)
        })
      }
    }

    return [
      {
        x: timestamp,
        y: CDWP1,
        name: 'CDWP1',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP2,
        name: 'CDWP2',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP3,
        name: 'CDWP3',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP4,
        name: 'CDWP4',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP5,
        name: 'CDWP5',
        type: 'bar',
      },
    ]
  }
  // 冷却塔_A+冷却塔_B [1,2][1] -> [CT1, CT2, CT4]
  const filterCtData = ([startTime, endTime]: string[]) => {
    const CT1: (number | null)[] = []
    const CT2: (number | null)[] = []
    const CT4: (number | null)[] = []
    const timestamp: string[] = []

    const ctMap = new Map<string, (number | null)[]>([
      ['冷却塔_A1', CT1],
      ['冷却塔_A2', CT2],
      ['冷却塔_B1', CT4],
    ])

    for (
      let time = dayjs(startTime, 'YYYY-MM-DD');
      dayjs(time).isBefore(dayjs(endTime, 'YYYY-MM-DD HH:mm:ss'));
      time = time.add(15, 'minute')
    ) {
      timestamp.push(time.format('YYYY-MM-DD HH:mm:ss'))
      const recordTime = time.format('M/D/YYYY H:mm')

      if (recordMap.value.has(recordTime)) {
        const record = recordMap.value.get(recordTime)

        const ctAs = JSON.parse(record['冷却塔_A'] || '[]')
        ;[1, 2].forEach((chiller: number) => {
          if (ctAs.includes(chiller)) {
            ctMap.get(`冷却塔_A${chiller}`)!.push(1.0)
          } else {
            ctMap.get(`冷却塔_A${chiller}`)!.push(0.0)
          }
        })

        const ctBs = JSON.parse(record['冷却塔_B'] || '[]')
        ;[1].forEach((chiller: number) => {
          if (ctBs.includes(chiller)) {
            ctMap.get(`冷却塔_B${chiller}`)!.push(1.0)
          } else {
            ctMap.get(`冷却塔_B${chiller}`)!.push(0.0)
          }
        })
      } else {
        ;[1, 2].forEach((chiller: number) => {
          ctMap.get(`冷却塔_A${chiller}`)!.push(null)
        })
        ;[1].forEach((chiller: number) => {
          ctMap.get(`冷却塔_B${chiller}`)!.push(null)
        })
      }
    }

    return [
      {
        x: timestamp,
        y: CT1,
        name: 'CT1',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CT2,
        name: 'CT2',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CT4,
        name: 'CT4',
        type: 'bar',
      },
    ]
  }
  // 机组能耗(kW) 运行机组[1,2,3] -> [Chiller1, Chiller3, Chiller4]
  const filterChillerPowerData = ([startTime, endTime]: string[]) => {
    const Chiller1: (number | null)[] = []
    const Chiller3: (number | null)[] = []
    const Chiller4: (number | null)[] = []
    const timestamp: string[] = []

    const chillerMap = new Map<number, (number | null)[]>([
      [1, Chiller1],
      [2, Chiller3],
      [3, Chiller4],
    ])

    for (
      let time = dayjs(startTime, 'YYYY-MM-DD');
      dayjs(time).isBefore(dayjs(endTime, 'YYYY-MM-DD HH:mm:ss'));
      time = time.add(15, 'minute')
    ) {
      timestamp.push(time.format('YYYY-MM-DD HH:mm:ss'))
      const recordTime = time.format('M/D/YYYY H:mm')

      if (recordMap.value.has(recordTime)) {
        const record = recordMap.value.get(recordTime)

        const chillers = JSON.parse(record['运行机组'] || '[]')
        const recordKw = record['机组能耗(kW)'].replace(/'/g, '')
        const chillerKws = JSON.parse(recordKw || '[]')
        ;[1, 2, 3].forEach((chiller: number) => {
          const index = chillers.indexOf(chiller)
          if (index > -1) {
            chillerMap.get(chiller)!.push(chillerKws[index])
          } else {
            chillerMap.get(chiller)!.push(null)
          }
        })
      } else {
        ;[1, 2, 3].forEach((chiller: number) => {
          chillerMap.get(chiller)!.push(null)
        })
      }
    }

    return [
      {
        x: timestamp,
        y: Chiller4,
        name: 'Chiller4 - Power - Chiller Plant Power Log_Chiller 4kW, PowerMeter (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: Chiller1,
        name: 'Chiller1 - Power - Chiller Plant Power Log_Chiller 1kW, PowerMeter (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: Chiller3,
        name: 'Chiller3 - Power - Chiller Plant Power Log_Chiller 3kW, PowerMeter (kW)',
        type: 'bar',
      },
    ]
  }
  // 水泵能耗_A(kW)+水泵能耗_B(kW) 水泵_A+水泵_B[1,2,3][1,2] -> [CDWP1, CDWP2, CDWP3, CDWP4, CDWP5]
  const filterCdwpPowerData = ([startTime, endTime]: string[]) => {
    const CDWP1: (number | null)[] = []
    const CDWP2: (number | null)[] = []
    const CDWP3: (number | null)[] = []
    const CDWP4: (number | null)[] = []
    const CDWP5: (number | null)[] = []
    const timestamp: string[] = []

    const cdwpMap = new Map<string, (number | null)[]>([
      ['水泵_A1', CDWP1],
      ['水泵_A2', CDWP2],
      ['水泵_A3', CDWP3],
      ['水泵_B1', CDWP4],
      ['水泵_B2', CDWP5],
    ])

    for (
      let time = dayjs(startTime, 'YYYY-MM-DD');
      dayjs(time).isBefore(dayjs(endTime, 'YYYY-MM-DD HH:mm:ss'));
      time = time.add(15, 'minute')
    ) {
      timestamp.push(time.format('YYYY-MM-DD HH:mm:ss'))
      const recordTime = time.format('M/D/YYYY H:mm')

      if (recordMap.value.has(recordTime)) {
        const record = recordMap.value.get(recordTime)

        const cdwpAs = JSON.parse(record['水泵_A'] || '[]')
        const recordAKw = record['水泵能耗_A(kW)'].replace(/'/g, '')
        const cdwpAKws = JSON.parse(recordAKw || '[]')
        ;[1, 2, 3].forEach((chiller: number) => {
          const index = cdwpAs.indexOf(chiller)
          if (index > -1) {
            cdwpMap.get(`水泵_A${chiller}`)!.push(cdwpAKws[index])
          } else {
            cdwpMap.get(`水泵_A${chiller}`)!.push(null)
          }
        })

        const cdwpBs = JSON.parse(record['水泵_B'] || '[]')
        const recordBKw = record['水泵能耗_B(kW)'].replace(/'/g, '')
        const cdwpBKws = JSON.parse(recordBKw || '[]')
        ;[1, 2].forEach((chiller: number) => {
          const index = cdwpBs.indexOf(chiller)
          if (index > -1) {
            cdwpMap.get(`水泵_B${chiller}`)!.push(cdwpBKws[index])
          } else {
            cdwpMap.get(`水泵_B${chiller}`)!.push(null)
          }
        })
      } else {
        ;[1, 2, 3].forEach((chiller: number) => {
          cdwpMap.get(`水泵_A${chiller}`)!.push(null)
        })
        ;[1, 2].forEach((chiller: number) => {
          cdwpMap.get(`水泵_B${chiller}`)!.push(null)
        })
      }
    }

    return [
      {
        x: timestamp,
        y: CDWP1,
        name: 'CDWP1 - Power (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP2,
        name: 'CDWP2 - Power (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP3,
        name: 'CDWP3 - Power (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP4,
        name: 'CDWP4 - Power - Chiller Plant Power Log_CDWP 4kW, PowerMeter (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CDWP5,
        name: 'CDWP5 - Power - Chiller Plant Power Log_CDWP 5kW, PowerMeter (kW)',
        type: 'bar',
      },
    ]
  }
  // 冷却塔能耗_A(kW)+冷却塔能耗_B(kW) 冷却塔_A+冷却塔_B[1,2][1] -> [CT1, CT2, CT4]
  const filterCtPowerData = ([startTime, endTime]: string[]) => {
    const CT1: (number | null)[] = []
    const CT2: (number | null)[] = []
    const CT4: (number | null)[] = []
    const timestamp: string[] = []

    const ctMap = new Map<string, (number | null)[]>([
      ['冷却塔_A1', CT1],
      ['冷却塔_A2', CT2],
      ['冷却塔_B1', CT4],
    ])

    for (
      let time = dayjs(startTime, 'YYYY-MM-DD');
      dayjs(time).isBefore(dayjs(endTime, 'YYYY-MM-DD HH:mm:ss'));
      time = time.add(15, 'minute')
    ) {
      timestamp.push(time.format('YYYY-MM-DD HH:mm:ss'))
      const recordTime = time.format('M/D/YYYY H:mm')

      if (recordMap.value.has(recordTime)) {
        const record = recordMap.value.get(recordTime)

        const ctAs = JSON.parse(record['冷却塔_A'] || '[]')
        const recordAKw = record['冷却塔能耗_A(kW)'].replace(/'/g, '')
        const ctAKws = JSON.parse(recordAKw || '[]')
        ;[1, 2].forEach((chiller: number) => {
          const index = ctAs.indexOf(chiller)
          if (index > -1) {
            ctMap.get(`冷却塔_A${chiller}`)!.push(ctAKws[index])
          } else {
            ctMap.get(`冷却塔_A${chiller}`)!.push(null)
          }
        })

        const ctBs = JSON.parse(record['冷却塔_B'] || '[]')
        const recordBKw = record['冷却塔能耗_B(kW)'].replace(/'/g, '')
        const ctBKws = JSON.parse(recordBKw || '[]')
        ;[1].forEach((chiller: number) => {
          const index = ctBs.indexOf(chiller)
          if (index > -1) {
            ctMap.get(`冷却塔_B${chiller}`)!.push(ctBKws[index])
          } else {
            ctMap.get(`冷却塔_B${chiller}`)!.push(null)
          }
        })
      } else {
        ;[1, 2].forEach((chiller: number) => {
          ctMap.get(`冷却塔_A${chiller}`)!.push(null)
        })
        ;[1].forEach((chiller: number) => {
          ctMap.get(`冷却塔_B${chiller}`)!.push(null)
        })
      }
    }

    return [
      {
        x: timestamp,
        y: CT1,
        name: 'CT1 - Power - calculated_CT1_power (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CT2,
        name: 'CT2 - Power - calculated_CT2_power (kW)',
        type: 'bar',
      },
      {
        x: timestamp,
        y: CT4,
        name: 'CT4 - Power - Chiller Plant Power Log_CT 4kW, PowerMeter (kW)',
        type: 'bar',
      },
    ]
  }
  const filterCoolingLoadDiffData = ([startTime, endTime]: string[]) => {
    const coolingLoadReal: (number | null)[] = []
    const coolingLoadPredict: (number | null)[] = []
    const timestamp: string[] = []

    const coolingMap = new Map<string, (number | null)[]>([
      ['冷量需求(kW)', coolingLoadReal],
      ['冷量预测(kW)', coolingLoadPredict],
    ])

    for (
      let time = dayjs(startTime, 'YYYY-MM-DD');
      dayjs(time).isBefore(dayjs(endTime, 'YYYY-MM-DD HH:mm:ss'));
      time = time.add(15, 'minute')
    ) {
      timestamp.push(time.format('YYYY-MM-DD HH:mm:ss'))
      const recordTime = time.format('M/D/YYYY H:mm')

      if (recordMap.value.has(recordTime)) {
        const record = recordMap.value.get(recordTime)
        // console.log(record['冷量预测(kW)'])

        coolingMap.get('冷量需求(kW)')!.push(Number(record['冷量需求(kW)']))
        coolingMap
          .get('冷量预测(kW)')!
          .push(record['冷量预测(kW)'] ? Number(record['冷量预测(kW)']) : null)
      } else {
        coolingMap.get('冷量需求(kW)')!.push(null)
        coolingMap.get('冷量预测(kW)')!.push(null)
      }
    }
    // console.log({ coolingLoadReal, coolingLoadPredict })
    return [
      {
        x: timestamp,
        y: coolingLoadReal,
        name: '冷量需求(kW)',
        type: 'scatter',
        // mode: 'lines+markers', // 显示折线和点
        mode: 'lines', // 显示折线
      },
      {
        x: timestamp,
        y: coolingLoadPredict,
        name: '冷量预测(kW)',
        type: 'scatter',
        // mode: 'lines+markers', // 显示折线和点
        mode: 'lines', // 显示折线
      },
    ]
  }
  const dataMap = new Map<string, ([startTime, endTime]: string[]) => object>([
    ['chillerRunningStatus', filterChillerData],
    ['cdwpRunningStatus', filterCdwpData],
    ['coolingTowerRunningStatus', filterCtData],
    ['chillerPower', filterChillerPowerData],
    ['cdwpPower', filterCdwpPowerData],
    ['ctPower', filterCtPowerData],
    ['coolingLoadDiff', filterCoolingLoadDiffData],
  ])

  const getMegaData = (method: string, [startTime, endTime]: string[]) => {
    return dataMap.get(method)?.([startTime, endTime]) ?? []
  }

  const handleUploadCsvFromIndexedDB = async () => {
    let rows = await IndexedDB.getAll()
    rows = rows.sort((a, b) => b.time - a.time)

    // if (rows.length) {
    // const lastRow = rows[0]
    // const { time, row } = lastRow

    // const content = [csvHeader, row].join('\n')
    // const records = _getRecords(content)
    // lastStrategyRow.value = { time, row: records[0], requestTime: Math.floor(requestTime / 1000) }
    // }

    const csv = rows.map((item) => item.row)
    setCsv([csvHeader, ...csv].join('\n'))
  }

  return {
    fromCsv,
    isCollapse,
    lastStrategyRow,
    setIsCollapse,
    getCarnotToken,
    setCarnotToken,
    getCsv,
    setCsv,

    records,
    recordMap,
    datetimerange,
    heads,

    getMegaData,
    handleUploadCsvFromIndexedDB,
  }
})
