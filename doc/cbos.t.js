// node doc/cbos.t.js
/*
curl -X 'GET' \
  'https://cbosv3-sandbox.cloud-building.com/api/v1/internal/query?fluxQuery=from%28bucket%3A%20%22Buckets_saas_test_yin%22%29%20%20%20%20%20%20%20%7C%3E%20range%28start%3A%200%29%20%20%20%20%20%20%20%7C%3E%20filter%28fn%3A%20%28r%29%20%3D%3E%20r%5B%22_measurement%22%5D%20%3D%3D%20%22chiller_strategy%22%29%20%20%20%20%20%20%20%7C%3E%20sort%28columns%3A%20%5B%22_time%22%5D%29%20%20%20%20%20%20%20%7C%3E%20first%28%29' \
  -H 'accept: application/json' \
  -H 'organization: 55' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI3IiwiaWRUeXBlIjoiYXBwbGljYXRpb24iLCJpYXQiOjE3NDc1NTcwNjA3NDcsImV4cGlyZSI6MjA2MjkxNzA2MDc0N30.MDj5wYRk461YZdyC53zljEFR9GklXVYAEugrlleiyz0'
*/
const fetchFluxData = async () => {
  const url = new URL('https://cbosv3-sandbox.cloud-building.com/api/v1/internal/query')
  const organization = '55'
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI3IiwiaWRUeXBlIjoiYXBwbGljYXRpb24iLCJpYXQiOjE3NDc1NTcwNjA3NDcsImV4cGlyZSI6MjA2MjkxNzA2MDc0N30.MDj5wYRk461YZdyC53zljEFR9GklXVYAEugrlleiyz0'
  // const fluxQuery = `
  //   from(bucket: "Buckets_saas_test_yin")
  //     |> range(start: 0)
  //     |> filter(fn: (r) => r["_measurement"] == "chiller_strategy")
  //     |> sort(columns: ["_time"])
  //     |> first()
  // `
  const fluxQuery = `
// 最近一次预测
from(bucket: "Buckets_saas_test_yin")
  |> range(start: 2025-10-24T08:30:00.000Z)
  |> filter(fn: (r) => r._measurement == "predicted_load")
  |> sort(columns: ["_time"])
  |> first()
  |> yield(name: "predictedLoad")

// 最后一次状态
from(bucket: "Buckets_saas_test_yin")
  |> range(start: -10m)
  |> filter(fn: (r) =>
    r._measurement == "device_mqttpayload_data_b_Optimization_Mode" or
    r._measurement == "device_mqttpayload_data_CH1_Current_Draw" or
    r._measurement == "device_mqttpayload_data_CH1_CHWS_Temp" or
    r._measurement == "device_mqttpayload_data_CH1_CHWR_Temp" or
    r._measurement == "device_mqttpayload_data_CH1_CDWR_Temp" or
    r._measurement == "device_mqttpayload_data_CH1_CHWST_SP_Control" or
    r._measurement == "device_mqttpayload_data_CHWP_1_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CHWP_1_Trip" or
    r._measurement == "device_mqttpayload_data_CH3_Current_Draw" or
    r._measurement == "device_mqttpayload_data_CH3_CHWS_Temp" or
    r._measurement == "device_mqttpayload_data_CH3_CHWR_Temp" or
    r._measurement == "device_mqttpayload_data_CH3_CDWR_Temp" or
    r._measurement == "device_mqttpayload_data_CH3_CHWST_SP_Control" or
    r._measurement == "device_mqttpayload_data_CHWP_3_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CHWP_3_Trip" or
    r._measurement == "device_mqttpayload_data_CH4_Current_Draw" or
    r._measurement == "device_mqttpayload_data_CH4_CHWS_Temp" or
    r._measurement == "device_mqttpayload_data_CH4_CHWR_Temp" or
    r._measurement == "device_mqttpayload_data_CH4_CDWR_Temp" or
    r._measurement == "device_mqttpayload_data_CH4_CHWST_SP_Control" or
    r._measurement == "device_mqttpayload_data_CHWP_4_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CHWP_4_Trip" or
    r._measurement == "device_mqttpayload_data_CDWP_1_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_1_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_1_Trip" or
    r._measurement == "device_mqttpayload_data_CDWP_2_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_2_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_2_Trip" or
    r._measurement == "device_mqttpayload_data_CDWP_3_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_3_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_3_Trip" or
    r._measurement == "device_mqttpayload_data_CDWP_4_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_4_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_4_Trip" or
    r._measurement == "device_mqttpayload_data_CDWP_4_Speed_Control" or
    r._measurement == "device_mqttpayload_data_CDWP_5_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_5_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CDWP_5_Trip" or
    r._measurement == "device_mqttpayload_data_CDWP_5_Speed_Control" or
    r._measurement == "device_mqttpayload_data_CT_1_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CT_1_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CT_1_Trip" or
    r._measurement == "device_mqttpayload_data_CT_3_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CT_3_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CT_3_Trip" or
    r._measurement == "device_mqttpayload_data_CT_4_OnOff_Sta" or
    r._measurement == "device_mqttpayload_data_CT_4_Auto_Sta" or
    r._measurement == "device_mqttpayload_data_CT_4_Trip" or
    r._measurement == "device_mqttpayload_data_CT_4_Speed_Control"
  )
  |> sort(columns: ["_time"])
  |> last()
  |> yield(name: "others")

// 过去运行时间
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
  |> map(fn: (r) => ({
    _measurement: r._measurement,
    duration_min: float(v: uint(v: now()) - uint(v: r._time)) / 60000000000.0
  }))
  |> yield(name: "runtime")

// 上一次控制
from(bucket: "Buckets_saas_test_yin")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "chiller_strategy_v2")
  |> sort(columns: ["_time"])
  |> last()
  |> yield(name: "mqtt")
  `


  // 设置 URL 参数
  url.searchParams.append('fluxQuery', fluxQuery)

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',            // 指定返回 JSON 格式
        organization,                          // 组织 ID
        Authorization: `Bearer ${token}`,
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 获取数据
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

fetchFluxData().then(data => {
  console.log(JSON.stringify(data))
})
