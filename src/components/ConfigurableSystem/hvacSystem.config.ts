export const hvacSystemConfig = {
  nodes: [
    { id: 'CH1', type: 'chiller', cx: 360, cy: 62 },
    { id: 'CH3', type: 'chiller', cx: 360, cy: 124 },
    { id: 'CH4', type: 'chiller', cx: 360, cy: 186 },

    { id: 'CDWP1', type: 'pumpA', cx: 720, cy: 55.8 },
    { id: 'CDWP2', type: 'pumpA', cx: 720, cy: 93 },
    { id: 'CDWP3', type: 'pumpA', cx: 720, cy: 130.2 },
    { id: 'CDWP4', type: 'pumpB', cx: 720, cy: 167.4 },
    { id: 'CDWP5', type: 'pumpB', cx: 720, cy: 204.8 },

    { id: 'CT1', type: 'towerA', cx: 1080, cy: 62 },
    { id: 'CT3', type: 'towerA', cx: 1080, cy: 124 },
    { id: 'CT4', type: 'towerB', cx: 1080, cy: 186 },
  ],
  edges: [
    // CH to CDWP
    { id: 'L_CH1_CDWP1', from: 'CH1', to: 'CDWP1', points: '360 62 480 62 480 93 600 93 600 55.8 720 55.8' },
    { id: 'L_CH1_CDWP2', from: 'CH1', to: 'CDWP2', points: '360 62 480 62 480 93 720 93' },
    { id: 'L_CH1_CDWP3', from: 'CH1', to: 'CDWP3', points: '360 62 480 62 480 93 600 93 600 130.2 720 130.2' },
    { id: 'L_CH3_CDWP1', from: 'CH3', to: 'CDWP1', points: '360 124 480 124 480 93 600 93 600 55.8 720 55.8' },
    { id: 'L_CH3_CDWP2', from: 'CH3', to: 'CDWP2', points: '360 124 480 124 480 93 720 93' },
    { id: 'L_CH3_CDWP3', from: 'CH3', to: 'CDWP3', points: '360 124 480 124 480 93 600 93 600 130.2 720 130.2' },
    { id: 'L_CH4_CDWP4', from: 'CH4', to: 'CDWP4', points: '360 186 600 186 600 167.4 720 167.4' },
    { id: 'L_CH4_CDWP5', from: 'CH4', to: 'CDWP5', points: '360 186 600 186 600 204.6 720 204.6' },
    // CDWP to CT
    { id: 'L_CDWP1_CT1', from: 'CDWP1', to: 'CT1', points: '720 55.8 840 55.8 840 93 960 93 960 62 1080 62' },
    { id: 'L_CDWP1_CT3', from: 'CDWP1', to: 'CT3', points: '720 55.8 840 55.8 840 93 960 93 960 124 1080 124' },
    { id: 'L_CDWP2_CT1', from: 'CDWP2', to: 'CT1', points: '720 93 960 93 960 62 1080 62' },
    { id: 'L_CDWP2_CT3', from: 'CDWP2', to: 'CT3', points: '720 93 960 93 960 124 1080 124' },
    { id: 'L_CDWP3_CT1', from: 'CDWP3', to: 'CT1', points: '720 130.2 840 130.2 840 93 960 93 960 62 1080 62' },
    { id: 'L_CDWP3_CT3', from: 'CDWP3', to: 'CT3', points: '720 130.2 840 130.2 840 93 960 93 960 124 1080 124' },
    { id: 'L_CDWP4_CT4', from: 'CDWP4', to: 'CT4', points: '720 167.4 840 167.4 840 186 1080 186' },
    { id: 'L_CDWP5_CT4', from: 'CDWP5', to: 'CT4', points: '720 204.6 840 204.6 840 186 1080 186' },
    // CT to CH
    { id: 'L_CT1_CH1', from: 'CT1', to: 'CH1', points: '1080 62 1200 62 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 62 360 62' },
    { id: 'L_CT1_CH3', from: 'CT1', to: 'CH3', points: '1080 62 1200 62 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 124 360 124' },
    { id: 'L_CT3_CH1', from: 'CT3', to: 'CH1', points: '1080 124 1200 124 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 62 360 62' },
    { id: 'L_CT3_CH3', from: 'CT3', to: 'CH3', points: '1080 124 1200 124 1200 93 1320 93 1320 18.6 120 18.6 120 93 240 93 240 124 360 124' },
    { id: 'L_CT4_CH4', from: 'CT4', to: 'CH4', points: '1080 186 1200 186 1200 241.8 240 241.8 240 186 360 186' },
  ],
  dataMap: {
    activeNodes: {
      chiller: { dataKey: '运行机组', idMap: { 1: 'CH1', 2: 'CH3', 3: 'CH4' } },
      pumpA: { dataKey: '水泵_A', idMap: { 1: 'CDWP1', 2: 'CDWP2', 3: 'CDWP3' } },
      towerA: { dataKey: '冷却塔_A', idMap: { 1: 'CT1', 2: 'CT3' } },
      pumpB: { dataKey: '水泵_B', idMap: { 1: 'CDWP4', 2: 'CDWP5' } },
      towerB: { dataKey: '冷却塔_B', idMap: { 1: 'CT4' } },
    },
    nodeMetrics: {
      chiller: [
        { label: '负载', key: '负载率(%)', unit: '%', precision: 1 },
        { label: '供温', key: '供水温度(°C)', unit: '°C', precision: 1 },
      ],
      pumpA: [
        // 为 pumpA 类型添加指标配置，保持逻辑一致性
        { label: '频率', key: '水泵_A_频率', unit: 'Hz', precision: 0 },
      ],
      pumpB: [
        { label: '频率', key: '水泵频频率', unit: 'Hz', precision: 0 },
      ],
      towerA: [
        // 为 towerA 类型添加指标配置，保持逻辑一致性
        { label: '转速', key: '冷却塔_A_转速', unit: 'rpm', precision: 0 },
      ],
      towerB: [
        { label: '转速', key: '冷却塔转速', unit: 'rpm', precision: 0 },
      ],
    },
    systemMetrics: [
      { label: '冷量预测', key: '冷量预测(kW)', unit: 'kW' },
      { label: '冷量需求', key: '冷量需求(kW)', unit: 'kW' },
      { label: '机组总能耗', key: '机组能耗(kW)', unit: 'kW', aggregate: 'sum', precision: 2 },
    ]
  },
};
