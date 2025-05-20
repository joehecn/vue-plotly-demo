/**
 * https://carnot-haeco2.web.app
 * username: mega
 * password: mega123
 */

import { useSettingsStore } from '@/stores/settings.store'
import { ElNotification } from 'element-plus'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any

const chillerRunningStatus = (startTime: string, endTime: string) => ({
  filters: {
    sensor_name: 'Compressor_Current_Draw_%',
    equipment_type: 'Chiller',
    facility_name: 'HAECO',
  },
  seriesOverrides: {
    type: 'bar',
    opacity: 1,
    xbins: {
      size: 1,
    },
    ybins: {
      size: 1,
    },
    horizontalBarMode: false,
    horizontalSummaryMode: false,
    customUnit: null,
  },
  pipeline: [
    {
      type: 'calculate_global',
      formula: 'df > 0',
    },
    {
      type: 'calculate_global',
      formula:
        "df.rename(columns = dict(zip(df.columns, df.columns.map(lambda x: x.split(' - ')[0])))) # remove sensor_name from column",
    },
  ],
  offsetRange: false,
  offsetRangeStartOnly: false,
  offsetType: 'months',
  offsetAmount: 1,
  showLayoutOptions: true,
  parameters: {},
  date_range: [startTime, endTime],
})
const cdwpRunningStatus = (startTime: string, endTime: string) => ({
  filters: {
    sensor_name: 'on',
    equipment_type: 'Condenser_Pump',
    facility_name: 'HAECO',
  },
  seriesOverrides: {
    type: 'bar',
    opacity: 1,
    xbins: {
      size: 1,
    },
    ybins: {
      size: 1,
    },
    horizontalBarMode: false,
    horizontalSummaryMode: false,
    customUnit: null,
  },
  pipeline: [
    {
      type: 'calculate_global',
      formula:
        "df.rename(columns = dict(zip(df.columns, df.columns.map(lambda x: x.split(' - ')[0])))) # remove sensor_name from column",
    },
  ],
  offsetRange: false,
  offsetRangeStartOnly: false,
  offsetType: 'months',
  offsetAmount: 1,
  showLayoutOptions: true,
  parameters: {},
  date_range: [startTime, endTime],
})
const coolingTowerRunningStatus = (startTime: string, endTime: string) => ({
  filters: {
    sensor_name: 'on',
    equipment_type: 'Cooling_Tower',
    facility_name: 'HAECO',
  },
  seriesOverrides: {
    type: 'bar',
    opacity: 1,
    xbins: {
      size: 1,
    },
    ybins: {
      size: 1,
    },
    horizontalBarMode: false,
    horizontalSummaryMode: false,
    customUnit: null,
  },
  pipeline: [
    {
      type: 'calculate_global',
      formula:
        "df.rename(columns = dict(zip(df.columns, df.columns.map(lambda x: x.split(' - ')[0])))) # remove sensor_name from column",
    },
  ],
  offsetRange: false,
  offsetRangeStartOnly: false,
  offsetType: 'months',
  offsetAmount: 1,
  showLayoutOptions: true,
  parameters: {},
  date_range: [startTime, endTime],
})
const chillerPower = (startTime: string, endTime: string) => ({
  filters: {
    sensor_name: 'Power',
    equipment_type: 'Chiller',
    facility_name: 'HAECO',
  },
  seriesOverrides: {
    type: 'scatter',
    opacity: 1,
    xbins: {
      size: 1,
    },
    ybins: {
      size: 1,
    },
    fill: 'tonexty',
    mode: 'none',
    stackgroup: 'One',
  },
  pipeline: [
    {
      type: 'select_series',
      series: ['Chiller4 - Power', 'Chiller1 - Power', 'Chiller3 - Power'],
    },
  ],
  offsetRange: false,
  offsetType: 'months',
  offsetAmount: 1,
  parameters: {},
  date_range: [startTime, endTime],
})
const cdwpPower = (startTime: string, endTime: string) => ({
  filters: {
    sensor_name: 'Power',
    equipment_type: 'Condenser_Pump',
    facility_name: 'HAECO',
  },
  seriesOverrides: {
    type: 'scatter',
    opacity: 1,
    xbins: {
      size: 1,
    },
    ybins: {
      size: 1,
    },
    fill: 'tonexty',
    mode: 'none',
    stackgroup: 'One',
  },
  pipeline: [],
  offsetRange: false,
  offsetType: 'months',
  offsetAmount: 1,
  parameters: {},
  date_range: [startTime, endTime],
})
const ctPower = (startTime: string, endTime: string) => ({
  filters: {
    sensor_name: 'Power',
    equipment_type: 'Cooling_Tower',
    facility_name: 'HAECO',
  },
  seriesOverrides: {
    type: 'scatter',
    opacity: 1,
    xbins: {
      size: 1,
    },
    ybins: {
      size: 1,
    },
    fill: 'tonexty',
    mode: 'none',
    stackgroup: 'One',
  },
  pipeline: [],
  offsetRange: false,
  offsetType: 'months',
  offsetAmount: 1,
  parameters: {},
  date_range: [startTime, endTime],
})
const methodMap = new Map<string, (startTime: string, endTime: string) => object>([
  ['chillerRunningStatus', chillerRunningStatus],
  ['cdwpRunningStatus', cdwpRunningStatus],
  ['coolingTowerRunningStatus', coolingTowerRunningStatus],
  ['chillerPower', chillerPower],
  ['cdwpPower', cdwpPower],
  ['ctPower', ctPower],
])

// 运行机组 [1,2,3] -> [Chiller1, Chiller3, Chiller4]
const coverChillerData = (data: SafeAny) => {
  const { Chiller1, Chiller3, Chiller4, timestamp } = data

  return [
    {
      x: timestamp,
      y: Chiller1.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'Chiller1',
      type: 'bar',
    },
    {
      x: timestamp,
      y: Chiller3.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'Chiller3',
      type: 'bar',
    },
    {
      x: timestamp,
      y: Chiller4.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'Chiller4',
      type: 'bar',
    },
  ]
}
// 水泵_A+水泵_B [1,2,3][1,2] -> [CDWP1, CDWP2, CDWP3, CDWP4, CDWP5]
const coverCdwpData = (data: SafeAny) => {
  const { CDWP1, CDWP2, CDWP3, CDWP4, CDWP5, timestamp } = data
  return [
    {
      x: timestamp,
      y: CDWP1.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CDWP1',
      type: 'bar',
    },
    {
      x: timestamp,
      y: CDWP2.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CDWP2',
      type: 'bar',
    },
    {
      x: timestamp,
      y: CDWP3.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CDWP3',
      type: 'bar',
    },
    {
      x: timestamp,
      y: CDWP4.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CDWP4',
      type: 'bar',
    },
    {
      x: timestamp,
      y: CDWP5.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CDWP5',
      type: 'bar',
    },
  ]
}
// 冷却塔_A+冷却塔_B [1,2][1] -> [CT1, CT2, CT4]
const coverCoolingTowerData = (data: SafeAny) => {
  const { CT1, CT2, CT4, timestamp } = data
  return [
    {
      x: timestamp,
      y: CT1.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CT1',
      type: 'bar',
    },
    {
      x: timestamp,
      y: CT2.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CT2',
      type: 'bar',
    },
    {
      x: timestamp,
      y: CT4.map((item: SafeAny) => (Number.isNaN(item) ? null : item)),
      name: 'CT4',
      type: 'bar',
    },
  ]
}
// 机组能耗(kW) 运行机组[1,2,3] -> [Chiller1, Chiller3, Chiller4]
const coverChillerPowerData = (data: SafeAny) => {
  const Chiller1 = data['Chiller1 - Power'].map((item: SafeAny) =>
    Number.isNaN(item) ? null : item,
  )
  const Chiller3 = data['Chiller3 - Power'].map((item: SafeAny) =>
    Number.isNaN(item) ? null : item,
  )
  const Chiller4 = data['Chiller4 - Power'].map((item: SafeAny) =>
    Number.isNaN(item) ? null : item,
  )
  const timestamp = data.timestamp
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
const coverCdwpPowerData = (data: SafeAny) => {
  const CDWP1 = data['CDWP1 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const CDWP2 = data['CDWP2 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const CDWP3 = data['CDWP3 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const CDWP4 = data['CDWP4 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const CDWP5 = data['CDWP5 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const timestamp = data.timestamp
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
const coverCtPowerData = (data: SafeAny) => {
  const CT1 = data['CT1 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const CT2 = data['CT2 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const CT4 = data['CT4 - Power'].map((item: SafeAny) => (Number.isNaN(item) ? null : item))
  const timestamp = data.timestamp
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
const dataMap = new Map<string, (data: SafeAny) => object>([
  ['chillerRunningStatus', coverChillerData],
  ['cdwpRunningStatus', coverCdwpData],
  ['coolingTowerRunningStatus', coverCoolingTowerData],
  ['chillerPower', coverChillerPowerData],
  ['cdwpPower', coverCdwpPowerData],
  ['ctPower', coverCtPowerData],
])

export const fetchCarnotData = async (method: string, [startTime, endTime]: string[]) => {
  try {
    const settingsStore = useSettingsStore()
    const token = settingsStore.getCarnotToken()

    if (!token) throw new Error('Carnot token is not set')

    const response = await fetch('https://haeco-demo-mrtzp2lq4q-df.a.run.app/data3/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(methodMap.get(method)?.(startTime, endTime) ?? {}),
    })

    // const data = await response.json()
    const data = eval('(' + (await response.text()) + ')')
    // console.log({ data })
    if (data.message) throw new Error(data.message)

    return dataMap.get(method)?.(data) ?? []
  } catch (error: SafeAny) {
    console.error(error)
    ElNotification({
      title: 'Error',
      message: error.message,
      type: 'error',
    })
  }
}

export const getCurrentUser = async () => {
  try {
    const settingsStore = useSettingsStore()
    const token = settingsStore.getCarnotToken()

    if (!token) throw new Error('Carnot token is not set')

    const response = await fetch('https://haeco-demo-mrtzp2lq4q-df.a.run.app/current-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    if (data.message) throw new Error(data.message)

    return data.user
  } catch (error: SafeAny) {
    console.error(error)
    return null
  }
}

export const loginCarnot = async () => {
  const username = 'mega'
  const password = 'mega123'

  try {
    const response = await fetch('https://haeco-demo-mrtzp2lq4q-df.a.run.app/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: username,
        password,
      }),
    })

    const data = await response.json()
    // console.log({ data })

    if (data.message) throw new Error(data.message)

    const settingsStore = useSettingsStore()
    settingsStore.setCarnotToken(data.token)
  } catch (error: SafeAny) {
    console.error(error)
    ElNotification({
      title: 'Error',
      message: error.message,
      type: 'error',
    })
  }
}
