// node doc/flux.t.js

const fetchFluxData = async () => {
  const url = new URL('https://influxdb2-sandbox.cloud-building.com/api/v2/query')
  const org = 'Test_yin'
  const token = 'BEGxvxG-uMJrGEXPlEdP6osekGiLbJ_i1zwW6ena5Ibf9ZSypZBE050m0SGDkIjQlNVBiDTy-0xtBAa_npWsvg=='
  const fluxQuery = `
    from(bucket: "Buckets_saas_test_yin")
      |> range(start: 0)
      |> filter(fn: (r) => r["_measurement"] == "chiller_strategy")
      |> sort(columns: ["_time"])
      |> first()
  `

  // 设置 URL 参数
  url.searchParams.append('org', org)

  try {
    const response = await fetch(url, {
      method: 'POST',          // InfluxDB 2.x 要求查询用 POST
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/vnd.flux', // 可选（纯文本查询）
        'Accept': 'application/csv'            // 指定返回 JSON 格式
      },
      body: fluxQuery          // 直接发送 Flux 脚本
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 获取原始 CSV 数据
    const rawCSV = await response.text()
    // console.log("原始 CSV 响应:", rawCSV)

    // const data = await response.json()
    return rawCSV
  } catch (error) {
    console.error(error)
  }
}

fetchFluxData()
  .then(data => {
    console.log(data)
  })
