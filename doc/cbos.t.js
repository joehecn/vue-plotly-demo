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
  const fluxQuery = `
    from(bucket: "Buckets_saas_test_yin")
      |> range(start: 0)
      |> filter(fn: (r) => r["_measurement"] == "chiller_strategy")
      |> sort(columns: ["_time"])
      |> first()
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
  console.log(data)
})
