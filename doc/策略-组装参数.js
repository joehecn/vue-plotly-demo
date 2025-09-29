const mega = require('mega')

function getMeasurementMap(measurementArr) {
  return new Map(measurementArr.map(item => [
    item._measurement, item._value
  ]))
}

function getNearestQuarterTime() {
  const now = new Date()
  const currentMinutes = now.getMinutes()

  // 计算最近的15分钟间隔点（向前取整）
  const nearest = Math.floor(currentMinutes / 15) * 15

  // 创建调整后的时间对象
  now.setMinutes(nearest, 0, 0)  // 秒和毫秒归零

  return now
}

async function getRuntime(measurementMap) {
  const measurements = [
    "device_mqttpayload_data_CH1_Current_Draw",
    "device_mqttpayload_data_CH3_Current_Draw",
    "device_mqttpayload_data_CH4_Current_Draw"
  ]

  const query = `
    from(bucket: "Buckets_saas_test_yin")
      |> range(start: -24h)
      |> filter(fn: (r) =>
        r._measurement == "device_mqttpayload_data_CH1_Current_Draw" or
        r._measurement == "device_mqttpayload_data_CH3_Current_Draw" or
        r._measurement == "device_mqttpayload_data_CH4_Current_Draw"
      )
      |> map(fn: (r) => ({
        r with
        state: if r._value > 0 then 1 else 0
      }))
      |> difference(columns: ["state"])
      |> filter(fn: (r) => r.state == -1)
      |> sort(columns: ["_time"], desc: true)
      |> first()
      // 计算持续时间（分钟）并包含 measurement
      |> map(fn: (r) => ({
        _measurement: r._measurement,
        duration_min: float(v: uint(v: now()) - uint(v: r._time)) / 60000000000.0
      }))
  `

  const measurementArr = await mega.influx.queryInflux(55, query)

  return measurements.map(measurement => {
    const isOff = !measurementMap.get(measurement)
    const duration = measurementArr.find(item => item._measurement === measurement)?.duration_min || 24 * 60
    return isOff ? 0 : parseInt(duration)
  })
}

async function main() {
  const weather = $input.first().json.now

  const curTime = getNearestQuarterTime()

  const query = `
    from(bucket: "Buckets_saas_test_yin")
      |> range(start: ${curTime.toISOString()})
      |> filter(fn: (r) => r._measurement == "predicted_load")
      |> sort(columns: ["_time"])
      |> first()
      |> yield(name: "predictedLoad")

    from(bucket: "Buckets_saas_test_yin")
      |> range(start: -1h)
      |> filter(fn: (r) =>
        r._measurement == "device_mqttpayload_data_CH1_Current_Draw"
        or r._measurement == "device_mqttpayload_data_CH3_Current_Draw"
        or r._measurement == "device_mqttpayload_data_CH4_Current_Draw"
        or r._measurement == "device_mqttpayload_data_CH1_CHWS_Temp"
        or r._measurement == "device_mqttpayload_data_CH3_CHWS_Temp"
        or r._measurement == "device_mqttpayload_data_CH4_CHWS_Temp"
        or r._measurement == "device_mqttpayload_data_CH1_CHWR_Temp"
        or r._measurement == "device_mqttpayload_data_CH3_CHWR_Temp"
        or r._measurement == "device_mqttpayload_data_CH4_CHWR_Temp"
        or r._measurement == "device_mqttpayload_data_CH1_CDWR_Temp"
        or r._measurement == "device_mqttpayload_data_CH3_CDWR_Temp"
        or r._measurement == "device_mqttpayload_data_CH4_CDWR_Temp"
        or r._measurement == "device_mqttpayload_data_b_Optimization_Mode"
        or r._measurement == "device_mqttpayload_data_CDWP_1_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_2_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_3_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_4_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_5_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CT_1_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CT_3_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CT_4_OnOff_Sta"
        or r._measurement == "device_mqttpayload_data_CHWP_1_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CHWP_1_Trip"
        or r._measurement == "device_mqttpayload_data_CHWP_3_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CHWP_3_Trip"
        or r._measurement == "device_mqttpayload_data_CHWP_4_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CHWP_4_Trip"
        or r._measurement == "device_mqttpayload_data_CDWP_1_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_1_Trip"
        or r._measurement == "device_mqttpayload_data_CDWP_2_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_2_Trip"
        or r._measurement == "device_mqttpayload_data_CDWP_3_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_3_Trip"
        or r._measurement == "device_mqttpayload_data_CDWP_4_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_4_Trip"
        or r._measurement == "device_mqttpayload_data_CDWP_5_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CDWP_5_Trip"
        or r._measurement == "device_mqttpayload_data_CT_1_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CT_1_Trip"
        or r._measurement == "device_mqttpayload_data_CT_3_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CT_3_Trip"
        or r._measurement == "device_mqttpayload_data_CT_4_Auto_Sta"
        or r._measurement == "device_mqttpayload_data_CT_4_Trip"
      )
      |> sort(columns: ["_time"])
      |> last()
      |> yield(name: "others")
  `

  const measurementArr = await mega.influx.queryInflux(55, query)
  const measurementMap = getMeasurementMap(measurementArr)

  const runTime = await getRuntime(measurementMap)

  return {
    optimizationMode: !!measurementMap.get('device_mqttpayload_data_b_Optimization_Mode'),
    updateStatusBody: {
      data: {
        "ch_status": [
          !!measurementMap.get('device_mqttpayload_data_CH1_Current_Draw'),
          !!measurementMap.get('device_mqttpayload_data_CH3_Current_Draw'),
          !!measurementMap.get('device_mqttpayload_data_CH4_Current_Draw')
        ],
        "cdwp_a_status": [
          !!measurementMap.get('device_mqttpayload_data_CDWP_1_OnOff_Sta'),
          !!measurementMap.get('device_mqttpayload_data_CDWP_2_OnOff_Sta'),
          !!measurementMap.get('device_mqttpayload_data_CDWP_3_OnOff_Sta'),
        ],
        "cdwp_b_status": [
          !!measurementMap.get('device_mqttpayload_data_CDWP_4_OnOff_Sta'),
          !!measurementMap.get('device_mqttpayload_data_CDWP_5_OnOff_Sta'),
        ],
        "ct_a_status": [
          !!measurementMap.get('device_mqttpayload_data_CT_1_OnOff_Sta'),
          !!measurementMap.get('device_mqttpayload_data_CT_3_OnOff_Sta'),
        ],
        "ct_b_status": [
          !!measurementMap.get('device_mqttpayload_data_CT_4_OnOff_Sta'),
        ]
      }
    },
    optimizeBody: {
      data: {
        // measurementArr,
        "DT": curTime.toISOString(), // convertToEast8(curTime), // 预测时间
        "Temperature": Number(weather.temp), // 实时温度
        "Humidity": Number(weather.humidity), // 实时湿度
        "T_wb": 0, // （湿球温度）固定值 0, 占位
        "Pred_Q": measurementMap.get('predicted_load'), // coolingload
        // 开关机状态
        "Chiller1":
          !!measurementMap.get('device_mqttpayload_data_CH1_Current_Draw'),
        "Chiller3":
          !!measurementMap.get('device_mqttpayload_data_CH3_Current_Draw'),
        "Chiller4":
          !!measurementMap.get('device_mqttpayload_data_CH4_Current_Draw'),
        // 冷冻水供水温度
        'SupplyTemp1':
          measurementMap.get('device_mqttpayload_data_CH1_CHWS_Temp'),
        'SupplyTemp3':
          measurementMap.get('device_mqttpayload_data_CH3_CHWS_Temp'),
        'SupplyTemp4':
          measurementMap.get('device_mqttpayload_data_CH4_CHWS_Temp'),
        // 冷冻水回水温度
        'EnteringTemp1':
          measurementMap.get('device_mqttpayload_data_CH1_CHWR_Temp'),
        'EnteringTemp3':
          measurementMap.get('device_mqttpayload_data_CH3_CHWR_Temp'),
        'EnteringTemp4':
          measurementMap.get('device_mqttpayload_data_CH4_CHWR_Temp'),
        // 冷凝水回水温度
        'EnteringTemp_CD1':
          measurementMap.get('device_mqttpayload_data_CH1_CDWR_Temp'),
        'EnteringTemp_CD3':
          measurementMap.get('device_mqttpayload_data_CH3_CDWR_Temp'),
        'EnteringTemp_CD4':
          measurementMap.get('device_mqttpayload_data_CH4_CDWR_Temp'),
        // 11台设备禁用标志（Auto_Sta + Trip）手动或者维修
        'ch_disabled': [
          !measurementMap.get('device_mqttpayload_data_CHWP_1_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CHWP_1_Trip'),
          !measurementMap.get('device_mqttpayload_data_CHWP_3_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CHWP_3_Trip'),
          !measurementMap.get('device_mqttpayload_data_CHWP_4_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CHWP_4_Trip')
        ],
        "cdwp_a_disabled": [
          !measurementMap.get('device_mqttpayload_data_CDWP_1_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CDWP_1_Trip'),
          !measurementMap.get('device_mqttpayload_data_CDWP_2_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CDWP_2_Trip'),
          !measurementMap.get('device_mqttpayload_data_CDWP_3_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CDWP_3_Trip')
        ],
        "cdwp_b_disabled": [
          !measurementMap.get('device_mqttpayload_data_CDWP_4_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CDWP_4_Trip'),
          !measurementMap.get('device_mqttpayload_data_CDWP_5_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CDWP_5_Trip')
        ],
        "ct_a_disabled": [
          !measurementMap.get('device_mqttpayload_data_CT_1_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CT_1_Trip'),
          !measurementMap.get('device_mqttpayload_data_CT_3_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CT_3_Trip')
        ],
        "ct_b_disabled": [
          !measurementMap.get('device_mqttpayload_data_CT_4_Auto_Sta') || !!measurementMap.get('device_mqttpayload_data_CT_4_Trip')
        ],

        // ch连续运行时长（分钟）
        "ch_runTime": runTime
      }
    }
  }
}

return main()
