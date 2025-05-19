<script setup lang="ts">
defineProps<{
  cc: {
    id: string
    cls: string
    loadingRate?: string
    supplyTemp?: string
    frequency?: string
    speed?: string
    cx: number
    cy: number
  }
}>()
</script>

<template>
  <!-- 外层流动虚线圆环 -->
  <circle :class="cc.cls" :cx="cc.cx" :cy="cc.cy" r="10" />

  <!-- 内层静态实心圆 -->
  <circle :cx="cc.cx" :cy="cc.cy" r="8" fill="#fff" />

  <text
    :class="`${cc.cls}-text`"
    :x="cc.cx"
    :y="cc.cy - 14"
    text-anchor="end"
    fill="#ddd"
    font-size="12"
    font-family="Arial"
  >
    {{ cc.id }}
  </text>

  <text :x="cc.cx + 32" :y="cc.cy - 8" fill="#13ce66" font-size="12" font-family="Arial">
    {{ cc.loadingRate ? `负载: ${cc.loadingRate}%` : '' }}
  </text>
  <text :x="cc.cx + 32" :y="cc.cy - 8" fill="#13ce66" font-size="12" font-family="Arial">
    {{ cc.frequency ? `频率: ${cc.frequency}hZ` : '' }}
  </text>
  <text :x="cc.cx + 32" :y="cc.cy - 8" fill="#13ce66" font-size="12" font-family="Arial">
    {{ cc.speed ? `频率: ${cc.speed}hZ` : '' }}
  </text>

  <text
    :x="8"
    :y="cc.cy + 18"
    text-anchor="start"
    fill="#409eff"
    font-size="12"
    font-family="Arial"
  >
    {{ cc.supplyTemp ? `供水温度: ${cc.supplyTemp}°C` : '' }}
  </text>
</template>

<style scoped>
.progress-ring-text {
  fill: #13ce66;
}

/* 计算圆周长的工具函数（实际开发中可通过JS计算） */
.progress-ring {
  --radius: 10;
  /* 匹配 r 值 */
  --circumference: 62.8;
  /* 2πr ≈ 2 * 3.14 * 10 */

  fill: none;
  stroke: #13ce66;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: calc(var(--circumference) / 4) calc(var(--circumference) / 4);
  /* 25%实线+25%间隙 */
  animation: flow 2s linear infinite;
}

@keyframes flow {
  from {
    stroke-dashoffset: var(--circumference);
    /* 完整移动一个周期 */
  }

  to {
    stroke-dashoffset: 0;
  }
}
</style>
