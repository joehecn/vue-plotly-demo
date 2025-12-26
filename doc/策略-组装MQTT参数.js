/**
 * 优化：
 * 从 errArr 取反上次控制不成功的状态，实际上是取上次策略的期望值。
 * 目的：
 *   1.解决控不成功，因为request和状态不一致;
 *   2.HVAC监控面板设备请求数量的板块的显示数据混乱
 */

// const MIN_SUPPLY_TEMP = 7.0
// const MAX_SUPPLY_TEMP = 10.5
const MIN_SUPPLY_TEMP = 8
const MAX_SUPPLY_TEMP = 10

const deviceGroups = {
  ch_a: [[0, 0], [0, 0], [0, 0]],
  ch_b: [[0], [0], [0]],
  cdwp_a: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
  cdwp_b: [[0, 0], [0, 0], [0, 0]],
  ct_a: [[0, 0], [0, 0], [0, 0]],
  ct_b: [[0], [0], [0]],
}

const isSameArr = (arr1, arr) => {
  return arr1.every((val, index) => val === arr[index])
}

// 比较 deviceGroups 前态和中间态 是否相同
const isSameStatus = (obj) => {
  return Object.values(obj).every(([before, middle]) => isSameArr(before, middle))
}

// 只看后态是否全组全关
const isAllOff = (ch, cdwp, ct) => {
  return [...ch, ...cdwp, ...ct].every(val => val === 0)
}

const getDeviceMap = (index) => new Map([
  ['device_mqttpayload_data_CH1_Current_Draw', { arr: deviceGroups.ch_a[index], index: 0 }],
  ['device_mqttpayload_data_CH3_Current_Draw', { arr: deviceGroups.ch_a[index], index: 1 }],
  ['device_mqttpayload_data_CH4_Current_Draw', { arr: deviceGroups.ch_b[index], index: 0 }],
  ['device_mqttpayload_data_CDWP_1_OnOff_Sta', { arr: deviceGroups.cdwp_a[index], index: 0 }],
  ['device_mqttpayload_data_CDWP_2_OnOff_Sta', { arr: deviceGroups.cdwp_a[index], index: 1 }],
  ['device_mqttpayload_data_CDWP_3_OnOff_Sta', { arr: deviceGroups.cdwp_a[index], index: 2 }],
  ['device_mqttpayload_data_CDWP_4_OnOff_Sta', { arr: deviceGroups.cdwp_b[index], index: 0 }],
  ['device_mqttpayload_data_CDWP_5_OnOff_Sta', { arr: deviceGroups.cdwp_b[index], index: 1 }],
  ['device_mqttpayload_data_CT_1_OnOff_Sta', { arr: deviceGroups.ct_a[index], index: 0 }],
  ['device_mqttpayload_data_CT_3_OnOff_Sta', { arr: deviceGroups.ct_a[index], index: 1 }],
  ['device_mqttpayload_data_CT_4_OnOff_Sta', { arr: deviceGroups.ct_b[index], index: 0 }],
])

const getOptimizeStatus = (item) => {
  return [
    {
      "_measurement": "device_mqttpayload_data_CH1_Current_Draw",
      "_value": item.active_chillers.indexOf(1) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CH3_Current_Draw",
      "_value": item.active_chillers.indexOf(2) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CH4_Current_Draw",
      "_value": item.active_chillers.indexOf(3) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CDWP_1_OnOff_Sta",
      "_value": item.cooling_system.group_a.pumps.active.indexOf(1) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CDWP_2_OnOff_Sta",
      "_value": item.cooling_system.group_a.pumps.active.indexOf(2) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CDWP_3_OnOff_Sta",
      "_value": item.cooling_system.group_a.pumps.active.indexOf(3) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CDWP_4_OnOff_Sta",
      "_value": item.cooling_system.group_b.pumps.active.indexOf(1) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CDWP_5_OnOff_Sta",
      "_value": item.cooling_system.group_b.pumps.active.indexOf(2) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CT_1_OnOff_Sta",
      "_value": item.cooling_system.group_a.towers.active.indexOf(1) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CT_3_OnOff_Sta",
      "_value": item.cooling_system.group_a.towers.active.indexOf(2) > -1 ? 1 : 0
    },
    {
      "_measurement": "device_mqttpayload_data_CT_4_OnOff_Sta",
      "_value": item.cooling_system.group_b.towers.active.indexOf(1) > -1 ? 1 : 0
    }
  ]
}

// 中间态
const setMiddleStatus = () => {
  // 遍历 deviceGroups 中的每个设备组
  for (const [groupKey, group] of Object.entries(deviceGroups)) {
    // 检查数组是否存在且长度一致
    if (!Array.isArray(group[0]) || !Array.isArray(group[1]) || !Array.isArray(group[2]) ||
      group[0].length !== group[1].length || group[1].length !== group[2].length) {
      console.warn(`Invalid group structure for ${groupKey}`);
      continue;
    }

    // 遍历每个设备组中的每个设备（中间状态的每个位置）
    for (let i = 0; i < group[1].length; i++) {
      // 规则：前一个数组和下一个数组的项任意一个为1就是1，否则为0
      group[1][i] = (group[0][i] === 1 || group[2][i] === 1) ? 1 : 0;
    }
  }
}

// 比较两个数组是否相等
const isEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

// 数组求和
const sumArr = (arr) => arr.reduce((acc, cur) => acc + cur, 0);

// 数组排序
// 接收一个数组，如 1, 0, 1
// 将数组索引视为 sn（sn1, sn2, sn3）
// 根据数组值进行排序，值为1的排在前面
// 返回排序后的 sn 组合，如 1, 3, 2

const sortArr = (arr) => {
  // 创建一个包含索引和值的数组
  const devices = arr.map((value, index) => ({
    sn: index + 1, // 设备编号从1开始
    status: value
  }));

  // 根据状态值排序，1在前，0在后
  devices.sort((a, b) => b.status - a.status);

  // 返回排序后的设备编号
  return devices.map(device => device.sn);
}

function isIgnore(_measurement, lastStatus) {
  const it = lastStatus.find(item => _measurement === item._measurement)
  return it ? it._ignore : false
}

// 只开一台的情况下，两台机出水温度和开机的那台一致
function chillerA(before, indexs, active, supplyTemps, lastStatus) {
  const active1 = active.indexOf(1)
  const active3 = active.indexOf(2)

  const val1 = (supplyTemps[active1] || 'NaN').toString()
  const val3 = (supplyTemps[active3] || 'NaN').toString()

  if (isEqual(before, indexs)) return [
    {
      tagCode: 'CH1_CHWST_SP_Control',
      val: val1
    },
    {
      tagCode: 'CH3_CHWST_SP_Control',
      val: val3
    },
  ]

  const index1 = indexs[0]
  const index3 = indexs[1]

  if (index1 === 0 && index3 === 0) {
    return [
      {
        tagCode: 'w_CH_A_Request',
        val: '0'
      },
    ]
  }

  if (index1 === 1 && index3 === 1) {
    return [
      {
        tagCode: 'w_CH_1_Priority',
        val: '2'
      },
      {
        tagCode: 'w_CH_3_Priority',
        val: '1'
      },
      {
        tagCode: 'CH1_CHWST_SP_Control',
        val: val1
      },
      {
        tagCode: 'CH3_CHWST_SP_Control',
        val: val3
      },
      {
        tagCode: 'w_CH_A_Request',
        val: '2'
      },
    ]
  }

  if (index1 === 1) {
    return [
      {
        tagCode: 'w_CH_1_Priority',
        val: '1'
      },
      {
        tagCode: 'w_CH_3_Priority',
        val: '2'
      },
      {
        tagCode: 'CH1_CHWST_SP_Control',
        val: val1
      },
      {
        tagCode: 'CH3_CHWST_SP_Control',
        val: isIgnore('device_mqttpayload_data_CH3_Current_Draw', lastStatus) ? 'NaN' : val1
      },
      {
        tagCode: 'w_CH_A_Request',
        val: '1'
      },
    ]
  }

  return [
    {
      tagCode: 'w_CH_1_Priority',
      val: '2'
    },
    {
      tagCode: 'w_CH_3_Priority',
      val: '1'
    },
    {
      tagCode: 'CH1_CHWST_SP_Control',
      val: isIgnore('device_mqttpayload_data_CH1_Current_Draw', lastStatus) ? 'NaN' : val3
    },
    {
      tagCode: 'CH3_CHWST_SP_Control',
      val: val3
    },
    {
      tagCode: 'w_CH_A_Request',
      val: '1'
    },
  ]
}
function chillerB(before, indexs, active, supplyTemps) {
  const active4 = active.indexOf(3)
  const val4 = (supplyTemps[active4] || 'NaN').toString()

  if (isEqual(before, indexs)) return [
    {
      tagCode: 'CH4_CHWST_SP_Control',
      val: val4
    },
  ]

  const index4 = indexs[0]

  if (index4 === 0) {
    return [
      {
        tagCode: 'w_CH_B_Request',
        val: '0'
      },
    ]
  }

  return [
    {
      tagCode: 'w_CH_4_Priority',
      val: '1'
    },
    {
      tagCode: 'CH4_CHWST_SP_Control',
      val: val4
    },
    {
      tagCode: 'w_CH_B_Request',
      val: '1'
    },
  ]
}

function pumpA(before, indexs) {
  if (isEqual(before, indexs)) return []

  const sum = sumArr(indexs)

  const result = [
    {
      tagCode: 'w_CDWP_A_Request',
      val: sum.toString()
    },
  ]

  if (sum === 0) return result

  const all = sortArr(indexs)

  return [
    ...all.map((sn, index) => ({
      tagCode: `w_CDWP_${sn}_Priority`,
      val: (index + 1).toString()
    })),
    ...result,
  ]
}
// 只开一台的情况下，两台机速度和开机的那台一致
function pumpB(before, indexs, active, frequency, lastStatus) {
  const active4 = active.indexOf(1)
  const active5 = active.indexOf(2)

  const val4 = (frequency[active4] * 20).toFixed(0)
  const val5 = (frequency[active5] * 20).toFixed(0)

  if (isEqual(before, indexs)) return [
    {
      tagCode: 'CDWP_4_Speed_Control',
      val: val4
    },
    {
      tagCode: 'CDWP_5_Speed_Control',
      val: val5
    },
  ]

  const index4 = indexs[0]
  const index5 = indexs[1]

  if (index4 === 0 && index5 === 0) {
    return [
      {
        tagCode: 'w_CDWP_B_Request',
        val: '0'
      },
    ]
  }

  if (index4 === 1 && index5 === 1) {
    return [
      {
        tagCode: 'w_CDWP_4_Priority',
        val: '1'
      },
      {
        tagCode: 'w_CDWP_5_Priority',
        val: '2'
      },
      {
        tagCode: 'CDWP_4_Speed_Control',
        val: val4
      },
      {
        tagCode: 'CDWP_5_Speed_Control',
        val: val5
      },
      {
        tagCode: 'w_CDWP_B_Request',
        val: '2'
      },
    ]
  }

  if (index4 === 1) {
    return [
      {
        tagCode: 'w_CDWP_4_Priority',
        val: '1'
      },
      {
        tagCode: 'w_CDWP_5_Priority',
        val: '2'
      },
      {
        tagCode: 'CDWP_4_Speed_Control',
        val: val4
      },
      {
        tagCode: 'CDWP_5_Speed_Control',
        val: isIgnore('device_mqttpayload_data_CDWP_5_OnOff_Sta', lastStatus) ? 'NaN' : val4
      },
      {
        tagCode: 'w_CDWP_B_Request',
        val: '1'
      },
    ]
  }

  return [
    {
      tagCode: 'w_CDWP_4_Priority',
      val: '2'
    },
    {
      tagCode: 'w_CDWP_5_Priority',
      val: '1'
    },
    {
      tagCode: 'CDWP_4_Speed_Control',
      val: isIgnore('device_mqttpayload_data_CDWP_4_OnOff_Sta', lastStatus) ? 'NaN' : val5
    },
    {
      tagCode: 'CDWP_5_Speed_Control',
      val: val5
    },
    {
      tagCode: 'w_CDWP_B_Request',
      val: '1'
    },
  ]
}

function towerA(before, indexs) {
  if (isEqual(before, indexs)) return []

  const index1 = indexs[0]
  const index3 = indexs[1]

  if (index1 === 0 && index3 === 0) {
    return [
      {
        tagCode: 'w_CT_A_Request',
        val: '0'
      },
    ]
  }

  if (index1 === 1 && index3 === 1) {
    return [
      {
        tagCode: 'w_CT_1_Priority',
        val: '1'
      },
      {
        tagCode: 'w_CT_3_Priority',
        val: '2'
      },
      {
        tagCode: 'w_CT_A_Request',
        val: '2'
      },
    ]
  }

  if (index1 === 1) {
    return [
      {
        tagCode: 'w_CT_1_Priority',
        val: '1'
      },
      {
        tagCode: 'w_CT_3_Priority',
        val: '2'
      },
      {
        tagCode: 'w_CT_A_Request',
        val: '1'
      },
    ]
  }

  return [
    {
      tagCode: 'w_CT_1_Priority',
      val: '2'
    },
    {
      tagCode: 'w_CT_3_Priority',
      val: '1'
    },
    {
      tagCode: 'w_CT_A_Request',
      val: '1'
    },
  ]
}
function towerB(before, indexs, speed) {
  const val = (speed[0] * 20).toFixed(0)

  if (isEqual(before, indexs)) return [
    {
      tagCode: 'CT_4_Speed_Control',
      val
    },
  ]

  const index4 = indexs[0]

  if (index4 === 0) {
    return [
      {
        tagCode: 'w_CT_B_Request',
        val: '0'
      },
    ]
  }

  return [
    {
      tagCode: 'w_CT_4_Priority',
      val: '1'
    },
    {
      tagCode: 'CT_4_Speed_Control',
      val
    },
    {
      tagCode: 'w_CT_B_Request',
      val: '1'
    },
  ]
}

function run(lastStatus, optimize) {
  // 过滤全关
  if (optimize.active_chillers.length === 0) {
    return [
      // 1: AI 控制, 0: PLC 模式
      {
        tagCode: 'b_Optimization_Mode',
        val: '1'
      },
      // 0: 非冬季模式
      {
        tagCode: 'b_Winter_Mode',
        val: '0'
      }
    ]
  }

  // 上一次状态
  // _ignore 手动，维修, 当成0
  const lastDeviceMap = getDeviceMap(0)
  lastStatus.forEach(({ _measurement, _value, _ignore }) => {
    const it = lastDeviceMap.get(_measurement)
    it.arr[it.index] = _ignore ? 0 : _value
  });

  // 本次策略
  const optimizeStatus = getOptimizeStatus(optimize)
  const optimizeDeviceMap = getDeviceMap(2)
  optimizeStatus.forEach(({ _measurement, _value }) => {
    const it = optimizeDeviceMap.get(_measurement)
    it.arr[it.index] = _value
  });

  // 中间态
  setMiddleStatus()

  const supplyTemps = optimize.supply_temps.map(temp => temp > MAX_SUPPLY_TEMP ? MAX_SUPPLY_TEMP : temp < MIN_SUPPLY_TEMP ? MIN_SUPPLY_TEMP : temp)

  let caPlus = []
  let cbPlus = []
  let paPlus = []
  let pbPlus = []
  let taPlus = []
  let tbPlus = []
  let caSub = []
  let cbSub = []
  let paSub = []
  let pbSub = []
  let taSub = []
  let tbSub = []
  let allOff = []
  if (isSameStatus(deviceGroups)) {
    // 前态和中间态未变化，单纯减机
    // ch_a, ch_b, cdwp_a, cdwp_b, ct_a, ct_b
    caSub = chillerA(deviceGroups.ch_a[1], deviceGroups.ch_a[2], optimize.active_chillers, supplyTemps, lastStatus)
    cbSub = chillerB(deviceGroups.ch_b[1], deviceGroups.ch_b[2], optimize.active_chillers, supplyTemps)
    paSub = pumpA(deviceGroups.cdwp_a[1], deviceGroups.cdwp_a[2])
    pbSub = pumpB(deviceGroups.cdwp_b[1], deviceGroups.cdwp_b[2], optimize.cooling_system.group_b.pumps.active, optimize.cooling_system.group_b.pumps.frequency, lastStatus)
    taSub = towerA(deviceGroups.ct_a[1], deviceGroups.ct_a[2])
    tbSub = towerB(deviceGroups.ct_b[1], deviceGroups.ct_b[2], optimize.cooling_system.group_b.towers.speed)

    if (isAllOff(deviceGroups.ch_a[2], deviceGroups.cdwp_a[2], deviceGroups.ct_a[2])) {
      // A组全关
      allOff = [
        {
          tagCode: 'w_CH_A_Request',
          val: '0'
        },
        {
          tagCode: 'w_CDWP_A_Request',
          val: '0'
        },
        {
          tagCode: 'w_CT_A_Request',
          val: '0'
        },
      ]
    } else if (isAllOff(deviceGroups.ch_b[2], deviceGroups.cdwp_b[2], deviceGroups.ct_b[2])) {
      // B组全关
      allOff = [
        {
          tagCode: 'w_CH_B_Request',
          val: '0'
        },
        {
          tagCode: 'w_CDWP_B_Request',
          val: '0'
        },
        {
          tagCode: 'w_CT_B_Request',
          val: '0'
        },
      ]
    }
  } else {
    // 单纯加机
    // ct_b, ct_a, cdwp_b, cdwp_a, ch_b, ch_a
    caPlus = chillerA(deviceGroups.ch_a[0], deviceGroups.ch_a[1], optimize.active_chillers, supplyTemps, lastStatus)
    cbPlus = chillerB(deviceGroups.ch_b[0], deviceGroups.ch_b[1], optimize.active_chillers, supplyTemps)
    paPlus = pumpA(deviceGroups.cdwp_a[0], deviceGroups.cdwp_a[1])
    pbPlus = pumpB(deviceGroups.cdwp_b[0], deviceGroups.cdwp_b[1], optimize.cooling_system.group_b.pumps.active, optimize.cooling_system.group_b.pumps.frequency, lastStatus)
    taPlus = towerA(deviceGroups.ct_a[0], deviceGroups.ct_a[1])
    tbPlus = towerB(deviceGroups.ct_b[0], deviceGroups.ct_b[1], optimize.cooling_system.group_b.towers.speed)
  }

  const data = [
    // 1: AI 控制, 0: PLC 模式
    {
      tagCode: 'b_Optimization_Mode',
      val: '1'
    },
    // 0: 非冬季模式
    {
      tagCode: 'b_Winter_Mode',
      val: '0'
    },
    ...tbPlus,
    ...taPlus,
    ...pbPlus,
    ...paPlus,
    ...cbPlus,
    ...caPlus,
    ...caSub,
    ...cbSub,
    ...paSub,
    ...pbSub,
    ...taSub,
    ...tbSub,
    ...allOff,
  ].filter(optimize => optimize.val !== 'NaN')
    // 去重逻辑：基于所有字段进行比较，所有字段相等的情况下保留第一次出现的指令
    .filter((item, index, self) =>
      index === self.findIndex(t => t.tagCode === item.tagCode && t.val === item.val)
    )
    .map(optimize => ({
      operate: 'write',
      deviceCode: 'Device1',
      ...optimize,
    }))

  let heartbeatVal = 100
  // 每10条数据插入一个心跳包
  for (let i = 10; i < data.length; i += 11) {
    data.splice(i, 0, {
      operate: 'write',
      deviceCode: 'Device1',
      tagCode: 'w_heartbeat_2',
      val: (heartbeatVal++).toString()
    })
  }

  return [{ data: JSON.stringify(data), group: JSON.stringify(deviceGroups) }]
}

function main() {
  const lastStatus = $('组装参数').first().json.lastStatus
  const optimize = $input.first().json.results[0]

  return run(lastStatus, optimize)
}

return main()
