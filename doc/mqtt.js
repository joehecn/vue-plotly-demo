function chillerA(index1, index3, supplyTemps) {
  if (index1 === -1 && index3 === -1) {
    return [
      {
        tagCode: 'w_CH_A_Request',
        val: '0'
      },
    ]
  }

  if (index1 > -1 && index3 > -1) {
    return [
      {
        tagCode: 'w_CH_A_Request',
        val: '2'
      },
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
        val: supplyTemps[index1].toString()
      },
      {
        tagCode: 'CH3_CHWST_SP_Control',
        val: supplyTemps[index3].toString()
      },
    ]
  }

  if (index1 > -1) {
    const val = supplyTemps[index1].toString()
    return [
      {
        tagCode: 'w_CH_A_Request',
        val: '1'
      },
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
        val
      },
      {
        tagCode: 'CH3_CHWST_SP_Control',
        val
      },
    ]
  }

  const val = supplyTemps[index3].toString()
  return [
    {
      tagCode: 'w_CH_A_Request',
      val: '1'
    },
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
      val
    },
    {
      tagCode: 'CH3_CHWST_SP_Control',
      val
    },
  ]
}
function chillerB(index, supplyTemps) {
  if (index === -1) {
    return [
      {
        tagCode: 'w_CH_B_Request',
        val: '0'
      },
    ]
  }

  return [
    {
      tagCode: 'w_CH_B_Request',
      val: '1'
    },
    {
      tagCode: 'w_CH_4_Priority',
      val: '1'
    },
    {
      tagCode: 'CH4_CHWST_SP_Control',
      val: supplyTemps[index].toString()
    },
  ]
}
function chillers(active, supplyTemps) {
  const index1 = active.indexOf(1)
  const index3 = active.indexOf(2)
  const index = active.indexOf(3)

  const chA = chillerA(index1, index3, supplyTemps)
  const chB = chillerB(index, supplyTemps)

  return [
    ...chA,
    ...chB,
  ]
}

function pumpA(active) {
  const result = [
    {
      tagCode: 'w_CDWP_A_Request',
      val: active.length.toString()
    },
  ]

  if (active.length === 0) return result

  const stops = [1, 2, 3].filter(i => !active.includes(i))
  const all = [...active, ...stops]

  return [
    ...result,
    ...all.map((sn, index) => ({
      tagCode: `w_CDWP_${sn}_Priority`,
      val: (index + 1).toString()
    }))
  ]
}
function pumpB(active, frequency) {
  const index4 = active.indexOf(1)
  const index5 = active.indexOf(2)

  if (index4 === -1 && index5 === -1) {
    return [
      {
        tagCode: 'w_CDWP_B_Request',
        val: '0'
      },
    ]
  }

  if (index4 > -1 && index5 > -1) {
    return [
      {
        tagCode: 'w_CDWP_B_Request',
        val: '2'
      },
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
        val: (frequency[index4] * 20).toFixed(0)
      },
      {
        tagCode: 'CDWP_5_Speed_Control',
        val: (frequency[index5] * 20).toFixed(0)
      }
    ]
  }

  if (index4 > -1) {
    const val = (frequency[index4] * 20).toFixed(0)
    return [
      {
        tagCode: 'w_CDWP_B_Request',
        val: '1'
      },
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
        val
      },
      {
        tagCode: 'CDWP_5_Speed_Control',
        val
      }
    ]
  }

  const val = (frequency[index5] * 20).toFixed(0)
  return [
    {
      tagCode: 'w_CDWP_B_Request',
      val: '1'
    },
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
      val
    },
    {
      tagCode: 'CDWP_5_Speed_Control',
      val
    }
  ]
}

function towerA(active) {
  const index1 = active.indexOf(1)
  const index3 = active.indexOf(2)

  if (index1 === -1 && index3 === -1) {
    return [
      {
        tagCode: 'w_CT_A_Request',
        val: '0'
      },
    ]
  }

  if (index1 > -1 && index3 > -1) {
    return [
      {
        tagCode: 'w_CT_A_Request',
        val: '2'
      },
      {
        tagCode: 'w_CT_1_Priority',
        val: '1'
      },
      {
        tagCode: 'w_CT_3_Priority',
        val: '2'
      }
    ]
  }

  if (index1 > -1) {
    return [
      {
        tagCode: 'w_CT_A_Request',
        val: '1'
      },
      {
        tagCode: 'w_CT_1_Priority',
        val: '1'
      },
      {
        tagCode: 'w_CT_3_Priority',
        val: '2'
      }
    ]
  }

  return [
    {
      tagCode: 'w_CT_A_Request',
      val: '1'
    },
    {
      tagCode: 'w_CT_1_Priority',
      val: '2'
    },
    {
      tagCode: 'w_CT_3_Priority',
      val: '1'
    }
  ]
}
function towerB(active, speed) {
  if (active.length === 0) {
    return [
      {
        tagCode: 'w_CT_B_Request',
        val: '0'
      },
    ]
  }

  return [
    {
      tagCode: 'w_CT_B_Request',
      val: '1'
    },
    {
      tagCode: 'w_CT_4_Priority',
      val: '1'
    },
    {
      tagCode: 'CT_4_Speed_Control',
      val: (speed[0] * 20).toFixed(0)
    }
  ]
}

function main() {
  const item = $input.first().json.results[0]

  const chs = chillers(item.active_chillers, item.supply_temps)
  const pa = pumpA(item.cooling_system.group_a.pumps.active)
  const pb = pumpB(item.cooling_system.group_b.pumps.active, item.cooling_system.group_b.pumps.frequency)
  const ta = towerA(item.cooling_system.group_a.towers.active)
  const tb = towerB(item.cooling_system.group_b.towers.active, item.cooling_system.group_b.towers.speed)

  const data = [
    // 1: AI 控制, 0: PLC 模式
    {
      tagCode: 'b_Optimization_Mode',
      val: '0'
    },
    // 0: 非冬季模式
    {
      tagCode: 'b_Winter_Mode',
      val: '0'
    },
    ...chs,
    ...pa,
    ...pb,
    ...ta,
    ...tb,
  ].map(item => ({
    operate: 'write',
    deviceCode: 'Device1',
    ...item,
  }))

  return [{ data: JSON.stringify(data) }]
}

return main()
