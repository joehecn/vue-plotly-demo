/*
{
  // 运行机组
  "active_chillers": [
    1
  ],
  // 机组能耗(kW)
  "chiller_power": [
    107.1
  ],
  // 冷量需求(kW)
  "cooling_demand": 869,

  "cooling_system": {
    "group_a": {
      "pumps": {
        // 水泵_A
        "active": [
          3
        ],
        // 水泵能耗_A(kW)
        "power": [
          15
        ]
      },
      "towers": {
        // 冷却塔_A
        "active": [
          1,
          2
        ],
        // 冷却塔能耗_A(kW)
        "power": [
          10.6,
          10.6
        ]
      }
    },
    "group_b": {
      "pumps": {
        // 水泵_B
        "active": [],
        // 水泵频频率
        "frequency": [],
        // 水泵能耗_B(kW)
        "power": []
      },
      "towers": {
        // 冷却塔_B
        "active": [],
        // 冷却塔能耗_B(kW)
        "power": [],
        // 冷却塔转速
        "speed": []
      }
    }
  },
  // COP
  "cop_values": [
    9.31
  ],
  // 负载率(%)
  "loading_rates": [
    94
  ],
  // 冷量预测(kW)
  "predicted_load": 869,
  // 供水温度(°C)
  "supply_temps": [
    12.3
  ],
  // 时间戳
  "timestamp": "2023-05-13 16:00:00",
  // chiller_power 机组能耗(kW) 之和
  "total_energy": 107.1
}

时间戳	冷量需求(kW)	运行机组	负载率(%)	供水温度(°C)	机组能耗(kW)	COP	水泵_A	冷却塔_A	水泵能耗_A(kW)	冷却塔能耗_A(kW)	水泵_B	冷却塔_B	水泵频频率	冷却塔转速	水泵能耗_B(kW)	冷却塔能耗_B(kW)	冷量预测(kW)
4/16/2025 0:00	382.6	[3]	['43.6']	['10.0']	['59.74']	['6.42']	[]	[]	[]	[]	[2]	[1]	['33.6']	['37.9']	['10.7']	['9.5']	301.6976425
*/

import type { SafeAny } from '../api/carnot'

export const jsonToCsvRow = (json: SafeAny) => {
  const row = [
    // 时间戳
    json.timestamp,
    // 冷量需求(kW)
    json.cooling_demand,
    // 运行机组
    `"${JSON.stringify(json.active_chillers)}"`,
    // 负载率(%)
    `"${JSON.stringify(json.loading_rates)}"`,
    // 供水温度(°C)
    `"${JSON.stringify(json.supply_temps)}"`,
    // 机组能耗(kW)
    `"${JSON.stringify(json.chiller_power)}"`,
    // COP
    `"${JSON.stringify(json.cop_values)}"`,
    // 水泵_A
    `"${JSON.stringify(json.cooling_system.group_a.pumps.active)}"`,
    // 冷却塔_A
    `"${JSON.stringify(json.cooling_system.group_a.towers.active)}"`,
    // 水泵能耗_A(kW)
    `"${JSON.stringify(json.cooling_system.group_a.pumps.power)}"`,
    // 冷却塔能耗_A(kW)
    `"${JSON.stringify(json.cooling_system.group_a.towers.power)}"`,
    // 水泵_B
    `"${JSON.stringify(json.cooling_system.group_b.pumps.active)}"`,
    // 冷却塔_B
    `"${JSON.stringify(json.cooling_system.group_b.towers.active)}"`,
    // 水泵频频率
    `"${JSON.stringify(json.cooling_system.group_b.pumps.frequency)}"`,
    // 冷却塔转速
    `"${JSON.stringify(json.cooling_system.group_b.towers.speed)}"`,
    // 水泵能耗_B(kW)
    `"${JSON.stringify(json.cooling_system.group_b.pumps.power)}"`,
    // 冷却塔能耗_B(kW)
    `"${JSON.stringify(json.cooling_system.group_b.towers.power)}"`,
    // 冷量预测(kW)
    json.predicted_load,
  ]

  return row.join(',')
}
