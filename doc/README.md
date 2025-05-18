// 时间戳
json.timestamp,
// 冷量需求(kW)
json.cooling_demand,
// 运行机组
JSON.stringify(json.active_chillers),
// 负载率(%)
JSON.stringify(json.loading_rates),
// 供水温度(°C)
JSON.stringify(json.supply_temps),
// 机组能耗(kW)
JSON.stringify(json.chiller_power),
// COP
JSON.stringify(json.cop_values),
// 水泵_A
JSON.stringify(json.cooling_system.group_a.pumps.active),
// 冷却塔_A
JSON.stringify(json.cooling_system.group_a.towers.active),
// 水泵能耗_A(kW)
JSON.stringify(json.cooling_system.group_a.pumps.power),
// 冷却塔能耗_A(kW)
JSON.stringify(json.cooling_system.group_a.towers.power),
// 水泵_B
JSON.stringify(json.cooling_system.group_b.pumps.active),
// 冷却塔_B
JSON.stringify(json.cooling_system.group_b.towers.active),
// 水泵频频率
JSON.stringify(json.cooling_system.group_b.pumps.frequency),
// 冷却塔转速
JSON.stringify(json.cooling_system.group_b.towers.speed),
// 水泵能耗_B(kW)
JSON.stringify(json.cooling_system.group_b.pumps.power),
// 冷却塔能耗_B(kW)
JSON.stringify(json.cooling_system.group_b.towers.power),
// 冷量预测(kW)
json.predicted_load