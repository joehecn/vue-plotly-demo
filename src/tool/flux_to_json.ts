import { isoToLocalFormat } from '../tool/time'
import type { SafeAny } from '../api/carnot'
import type { FluxRow } from '../worker/cron_job.worker'

const DEVICE_CONFIG: SafeAny = {
  CH1: {
    active: 'active_chillers',
    loading_rates: 'loading_rates',
    supply_temps: 'supply_temps',
    chiller_power: 'chiller_power',
    cop_values: 'cop_values',
    index: 0,
  },
  CH3: {
    active: 'active_chillers',
    loading_rates: 'loading_rates',
    supply_temps: 'supply_temps',
    chiller_power: 'chiller_power',
    cop_values: 'cop_values',
    index: 1,
  },
  CH4: {
    active: 'active_chillers',
    loading_rates: 'loading_rates',
    supply_temps: 'supply_temps',
    chiller_power: 'chiller_power',
    cop_values: 'cop_values',
    index: 2,
  },
  CDWP1: {
    active: 'cooling_system.group_a.pumps.active',
    power: 'cooling_system.group_a.pumps.power',
    index: 0,
  },
  CDWP2: {
    active: 'cooling_system.group_a.pumps.active',
    power: 'cooling_system.group_a.pumps.power',
    index: 1,
  },
  CDWP3: {
    active: 'cooling_system.group_a.pumps.active',
    power: 'cooling_system.group_a.pumps.power',
    index: 2,
  },
  CDWP4: {
    active: 'cooling_system.group_b.pumps.active',
    power: 'cooling_system.group_b.pumps.power',
    frequency: 'cooling_system.group_b.pumps.frequency',
    index: 0,
  },
  CDWP5: {
    active: 'cooling_system.group_b.pumps.active',
    power: 'cooling_system.group_b.pumps.power',
    frequency: 'cooling_system.group_b.pumps.frequency',
    index: 1,
  },
  CT1: {
    active: 'cooling_system.group_a.towers.active',
    power: 'cooling_system.group_a.towers.power',
    index: 0,
  },
  CT3: {
    active: 'cooling_system.group_a.towers.active',
    power: 'cooling_system.group_a.towers.power',
    index: 1,
  },
  CT4: {
    active: 'cooling_system.group_b.towers.active',
    power: 'cooling_system.group_b.towers.power',
    speed: 'cooling_system.group_b.towers.speed',
    index: 0,
  },
}

const replaceActive = (arr: SafeAny[]) => {
  return arr.map((item, index) => {
    if (item === 1) return index + 1
    return 0
  })
}

const filterActiveIndexs = (arr: SafeAny[]) => {
  return arr.map((item, index) => (item !== 0 ? index : -1)).filter((index) => index !== -1)
}

const filterValues = (arr: SafeAny[], nullIndexs: number[]) => {
  return arr.filter((_, index) => {
    return nullIndexs.includes(index)
  })
}

export const fluxToJson = (key: string, value: FluxRow[]) => {
  const { start, timestamp } = isoToLocalFormat(key)

  const data = {
    key: start,
    json: {
      // 运行机组
      active_chillers: [null as number | null, null as number | null, null as number | null],
      // 机组能耗(kW)
      chiller_power: [null as number | null, null as number | null, null as number | null],
      // 冷量需求(kW)
      cooling_demand: null,

      cooling_system: {
        group_a: {
          pumps: {
            // 水泵_A
            active: [null as number | null, null as number | null, null as number | null],
            // 水泵能耗_A(kW)
            power: [null as number | null, null as number | null, null as number | null],
          },
          towers: {
            // 冷却塔_A
            active: [null as number | null, null as number | null],
            // 冷却塔能耗_A(kW)
            power: [null as number | null, null as number | null],
          },
        },
        group_b: {
          pumps: {
            // 水泵_B
            active: [null as number | null, null as number | null],
            // 水泵频频率
            frequency: [null as number | null, null as number | null],
            // 水泵能耗_B(kW)
            power: [null as number | null, null as number | null],
          },
          towers: {
            // 冷却塔_B
            active: [null as number | null],
            // 冷却塔能耗_B(kW)
            power: [null as number | null],
            // 冷却塔转速
            speed: [null as number | null],
          },
        },
      },
      // COP
      cop_values: [null as number | null, null as number | null, null as number | null],
      // 负载率(%)
      loading_rates: [null as number | null, null as number | null, null as number | null],
      // 冷量预测(kW)
      predicted_load: null,
      // 供水温度(°C)
      supply_temps: [null as number | null, null as number | null, null as number | null],
      // 时间戳
      timestamp,
      // chiller_power 机组能耗(kW) 之和
      total_energy: null,
    },
    request: [],
    mqtt: [],
  }

  // 解析数据
  for (let i = 0, len = value.length; i < len; i++) {
    const { device, _field, _value } = value[i]
    if (device === 'group') continue;

    if (device === 'system') {
      // 处理系统数据
      ; (data.json as Record<string, SafeAny>)[_field] = _value
      continue
    }

    // 处理 request 数据
    if (device === 'request') {
      ; (data.request as SafeAny[]).push({ _field, _value })
      continue
    }

    // 处理 mqtt 数据
    if (device === 'mqtt') {
      // console.log({ _field, _value })
      ; (data.mqtt as SafeAny[]) = JSON.parse(_value as string)
      continue
    }

    const configPath = DEVICE_CONFIG[device][_field]
    // console.log({ device, _field, configPath })
    const activeDevices = configPath
      .split('.')
      .reduce((obj: SafeAny, key: string) => obj?.[key], data.json)
    activeDevices[DEVICE_CONFIG[device].index] = _value
  }

  data.json.active_chillers = replaceActive(data.json.active_chillers)
  const chillerActiveIndexs = filterActiveIndexs(data.json.active_chillers)
  data.json.active_chillers = filterValues(data.json.active_chillers, chillerActiveIndexs)
  data.json.loading_rates = filterValues(data.json.loading_rates, chillerActiveIndexs)
  data.json.supply_temps = filterValues(data.json.supply_temps, chillerActiveIndexs)
  data.json.chiller_power = filterValues(data.json.chiller_power, chillerActiveIndexs)
  data.json.cop_values = filterValues(data.json.cop_values, chillerActiveIndexs)

  data.json.cooling_system.group_a.pumps.active = replaceActive(
    data.json.cooling_system.group_a.pumps.active,
  )
  const pumpAActiveIndexs = filterActiveIndexs(data.json.cooling_system.group_a.pumps.active)
  data.json.cooling_system.group_a.pumps.active = filterValues(
    data.json.cooling_system.group_a.pumps.active,
    pumpAActiveIndexs,
  )
  data.json.cooling_system.group_a.pumps.power = filterValues(
    data.json.cooling_system.group_a.pumps.power,
    pumpAActiveIndexs,
  )

  data.json.cooling_system.group_a.towers.active = replaceActive(
    data.json.cooling_system.group_a.towers.active,
  )
  const towerAActiveIndexs = filterActiveIndexs(data.json.cooling_system.group_a.towers.active)
  data.json.cooling_system.group_a.towers.active = filterValues(
    data.json.cooling_system.group_a.towers.active,
    towerAActiveIndexs,
  )
  data.json.cooling_system.group_a.towers.power = filterValues(
    data.json.cooling_system.group_a.towers.power,
    towerAActiveIndexs,
  )

  data.json.cooling_system.group_b.pumps.active = replaceActive(
    data.json.cooling_system.group_b.pumps.active,
  )
  const pumpBActiveIndexs = filterActiveIndexs(data.json.cooling_system.group_b.pumps.active)
  data.json.cooling_system.group_b.pumps.active = filterValues(
    data.json.cooling_system.group_b.pumps.active,
    pumpBActiveIndexs,
  )
  data.json.cooling_system.group_b.pumps.power = filterValues(
    data.json.cooling_system.group_b.pumps.power,
    pumpBActiveIndexs,
  )
  data.json.cooling_system.group_b.pumps.frequency = filterValues(
    data.json.cooling_system.group_b.pumps.frequency,
    pumpBActiveIndexs,
  )

  data.json.cooling_system.group_b.towers.active = replaceActive(
    data.json.cooling_system.group_b.towers.active,
  )
  const towerBActiveIndexs = filterActiveIndexs(data.json.cooling_system.group_b.towers.active)
  data.json.cooling_system.group_b.towers.active = filterValues(
    data.json.cooling_system.group_b.towers.active,
    towerBActiveIndexs,
  )
  data.json.cooling_system.group_b.towers.power = filterValues(
    data.json.cooling_system.group_b.towers.power,
    towerBActiveIndexs,
  )
  data.json.cooling_system.group_b.towers.speed = filterValues(
    data.json.cooling_system.group_b.towers.speed,
    towerBActiveIndexs,
  )

  return data
}
