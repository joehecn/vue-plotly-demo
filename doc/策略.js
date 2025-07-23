// // eslint-disable no-console
// const mega = require('mega')

// function getMeasurementMap(measurementArr) {
//   return new Map(measurementArr.map(item => [
//     item._measurement, item._value
//   ]))
// }

// function convertToEast8(date) {
//   // 添加8小时时差
//   const adjustedTime = date.getTime() + 8 * 3600 * 1000; // 添加东八区偏移量[1,5](@ref)
//   const east8Date = new Date(adjustedTime);

//   // 提取时间组件
//   const month = east8Date.getUTCMonth() + 1;  // UTC月份需+1[4](@ref)
//   const day = east8Date.getUTCDate();
//   const year = east8Date.getUTCFullYear();
//   const hours = east8Date.getUTCHours();
//   const minutes = String(east8Date.getUTCMinutes()).padStart(2, '0'); // 分钟补零[7](@ref)

//   // 组合成目标格式
//   return `${month}/${day}/${year} ${hours}:${minutes}`;
// }

// function getNearestQuarterTime() {
//   const now = new Date()
//   const currentMinutes = now.getMinutes()

//   // 计算最近的15分钟间隔点（向前取整）
//   const nearest = Math.floor(currentMinutes / 15) * 15

//   // 创建调整后的时间对象
//   now.setMinutes(nearest, 0, 0)  // 秒和毫秒归零

//   return now
// }

// async function main() {
//   const weather = $input.first().json.now

//   const curTime = getNearestQuarterTime()

//   // const query = `
//   //   from(bucket: "Buckets_saas_test_yin")
//   //     |> range(start: ${curTime.toISOString()})
//   //     |> filter(fn: (r) => r._measurement == "predicted_load")
//   //     |> sort(columns: ["_time"])
//   //     |> first()
//   //     |> yield(name: "predictedLoad")

//   //   from(bucket: "Buckets_saas_test_yin")
//   //     |> range(start: -1h)
//   //     |> filter(fn: (r) =>
//   //       r._measurement == "device_mqttpayload_data_CH_1_Control"
//   //       or r._measurement == "device_mqttpayload_data_CH_3_Control"
//   //       or r._measurement == "device_mqttpayload_data_CH_4_Control"
//   //       or r._measurement == "device_mqttpayload_data_CH1_CHWS_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH3_CHWS_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH4_CHWS_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH1_CHWR_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH3_CHWR_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH4_CHWR_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH1_CDWR_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH3_CDWR_Temp"
//   //       or r._measurement == "device_mqttpayload_data_CH4_CDWR_Temp"
//   //     )
//   //     |> sort(columns: ["_time"])
//   //     |> last()
//   //     |> yield(name: "others")
//   // `
//   const query = `
//     from(bucket: "Buckets_saas_test_yin")
//       |> range(start: ${curTime.toISOString()})
//       |> filter(fn: (r) => r._measurement == "predicted_load")
//       |> sort(columns: ["_time"])
//       |> first()
//       |> yield(name: "predictedLoad")

//     from(bucket: "Buckets_saas_test_yin")
//       |> range(start: -1h)
//       |> filter(fn: (r) =>
//         r._measurement == "device_mqttpayload_data_CH1_Current_Draw"
//         or r._measurement == "device_mqttpayload_data_CH3_Current_Draw"
//         or r._measurement == "device_mqttpayload_data_CH4_Current_Draw"
//         or r._measurement == "device_mqttpayload_data_CH1_CHWS_Temp"
//         or r._measurement == "device_mqttpayload_data_CH3_CHWS_Temp"
//         or r._measurement == "device_mqttpayload_data_CH4_CHWS_Temp"
//         or r._measurement == "device_mqttpayload_data_CH1_CHWR_Temp"
//         or r._measurement == "device_mqttpayload_data_CH3_CHWR_Temp"
//         or r._measurement == "device_mqttpayload_data_CH4_CHWR_Temp"
//         or r._measurement == "device_mqttpayload_data_CH1_CDWR_Temp"
//         or r._measurement == "device_mqttpayload_data_CH3_CDWR_Temp"
//         or r._measurement == "device_mqttpayload_data_CH4_CDWR_Temp"
//       )
//       |> sort(columns: ["_time"])
//       |> last()
//       |> yield(name: "others")
//   `

//   const measurementArr = await mega.influx.queryInflux(55, query)
//   const measurementMap = getMeasurementMap(measurementArr)

//   // return {
//   //   data: {
//   //     // measurementArr,
//   //     "DT": convertToEast8(curTime), // 预测时间
//   //     "Temperature": Number(weather.temp), // 实时温度
//   //     "Humidity": Number(weather.humidity), // 实时湿度
//   //     "T_wb": 0, // （湿球温度）固定值 0, 占位
//   //     "Pred_Q": measurementMap.get('predicted_load'), // coolingload
//   //     // 开关机状态
//   //     "Chiller1":
//   //       !!measurementMap.get('device_mqttpayload_data_CH_1_Control'),
//   //     "Chiller3":
//   //       !!measurementMap.get('device_mqttpayload_data_CH_3_Control'),
//   //     "Chiller4":
//   //       !!measurementMap.get('device_mqttpayload_data_CH_4_Control'),
//   //     // 冷冻水供水温度
//   //     'SupplyTemp1':
//   //       measurementMap.get('device_mqttpayload_data_CH1_CHWS_Temp'),
//   //     'SupplyTemp3':
//   //       measurementMap.get('device_mqttpayload_data_CH3_CHWS_Temp'),
//   //     'SupplyTemp4':
//   //       measurementMap.get('device_mqttpayload_data_CH4_CHWS_Temp'),
//   //     // 冷冻水回水温度
//   //     'EnteringTemp1':
//   //       measurementMap.get('device_mqttpayload_data_CH1_CHWR_Temp'),
//   //     'EnteringTemp3':
//   //       measurementMap.get('device_mqttpayload_data_CH3_CHWR_Temp'),
//   //     'EnteringTemp4':
//   //       measurementMap.get('device_mqttpayload_data_CH4_CHWR_Temp'),
//   //     // 冷凝水回水温度
//   //     'EnteringTemp_CD1':
//   //       measurementMap.get('device_mqttpayload_data_CH1_CDWR_Temp'),
//   //     'EnteringTemp_CD3':
//   //       measurementMap.get('device_mqttpayload_data_CH3_CDWR_Temp'),
//   //     'EnteringTemp_CD4':
//   //       measurementMap.get('device_mqttpayload_data_CH4_CDWR_Temp'),
//   //   }
//   // }
//   return {
//     data: {
//       // measurementArr,
//       "DT": convertToEast8(curTime), // 预测时间
//       "Temperature": Number(weather.temp), // 实时温度
//       "Humidity": Number(weather.humidity), // 实时湿度
//       "T_wb": 0, // （湿球温度）固定值 0, 占位
//       "Pred_Q": measurementMap.get('predicted_load'), // coolingload
//       // 开关机状态
//       "Chiller1":
//         !!measurementMap.get('device_mqttpayload_data_CH1_Current_Draw'),
//       "Chiller3":
//         !!measurementMap.get('device_mqttpayload_data_CH3_Current_Draw'),
//       "Chiller4":
//         !!measurementMap.get('device_mqttpayload_data_CH4_Current_Draw'),
//       // 冷冻水供水温度
//       'SupplyTemp1':
//         measurementMap.get('device_mqttpayload_data_CH1_CHWS_Temp'),
//       'SupplyTemp3':
//         measurementMap.get('device_mqttpayload_data_CH3_CHWS_Temp'),
//       'SupplyTemp4':
//         measurementMap.get('device_mqttpayload_data_CH4_CHWS_Temp'),
//       // 冷冻水回水温度
//       'EnteringTemp1':
//         measurementMap.get('device_mqttpayload_data_CH1_CHWR_Temp'),
//       'EnteringTemp3':
//         measurementMap.get('device_mqttpayload_data_CH3_CHWR_Temp'),
//       'EnteringTemp4':
//         measurementMap.get('device_mqttpayload_data_CH4_CHWR_Temp'),
//       // 冷凝水回水温度
//       'EnteringTemp_CD1':
//         measurementMap.get('device_mqttpayload_data_CH1_CDWR_Temp'),
//       'EnteringTemp_CD3':
//         measurementMap.get('device_mqttpayload_data_CH3_CDWR_Temp'),
//       'EnteringTemp_CD4':
//         measurementMap.get('device_mqttpayload_data_CH4_CDWR_Temp'),
//     }
//   }
// }

// return main()
