import type { SafeAny } from './carnot'

const fetchFluxData = async (fluxQuery: string) => {
  const url = new URL('https://cbosv3-sandbox.cloud-building.com/api/v1/internal/query')
  const organization = '55'
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI3IiwiaWRUeXBlIjoiYXBwbGljYXRpb24iLCJpYXQiOjE3NDc1NTcwNjA3NDcsImV4cGlyZSI6MjA2MjkxNzA2MDc0N30.MDj5wYRk461YZdyC53zljEFR9GklXVYAEugrlleiyz0'

  // 设置 URL 参数
  url.searchParams.append('fluxQuery', fluxQuery)

  const response = await fetch(url, {
    headers: {
      accept: 'application/json', // 指定返回 JSON 格式
      organization, // 组织 ID
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  // 获取数据
  const data: SafeAny = await response.json()
  return data.data
}

export const getFirstStrategy = async () => {
  const fluxQuery = `
    from(bucket: "Buckets_saas_test_yin")
      |> range(start: 0)
      |> filter(fn: (r) => r["_measurement"] == "chiller_strategy_v2" and r["_field"] == "predicted_load")
      |> sort(columns: ["_time"])
      |> first()
  `

  return await fetchFluxData(fluxQuery)
}

// 2025-05-16T10:00:00Z 或 1747389600 妙
export const getStrategys = async (start: number, stop: number) => {
  const fluxQuery = `
    from(bucket: "Buckets_saas_test_yin")
      |> range(start: ${start}, stop: ${stop})
      |> filter(fn: (r) => r["_measurement"] == "chiller_strategy_v2")
      |> sort(columns: ["_time"])
  `

  return await fetchFluxData(fluxQuery)
}

export const getRun = async (start: number, stop: number) => {
  const fluxQuery = `
    from(bucket: "Buckets_saas_test_yin")
      |> range(start: ${start}, stop: ${stop})
      |> filter(fn: (r) => r["_measurement"] == "device_mqttpayload_data_b_Optimization_Mode")
      |> sort(columns: ["_time"])
  `
  console.log(fluxQuery)
  return await fetchFluxData(fluxQuery)
}
