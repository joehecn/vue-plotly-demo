<script setup lang="ts">
defineProps<{
  cc: {
    id: string
    cls: string
    cx: number
    cy: number
    metrics?: Array<{ label: string; value: string; unit: string }>
  }
}>()
</script>

<template>
  <!-- Outer flowing dashed circle -->
  <circle :class="cc.cls" :cx="cc.cx" :cy="cc.cy" r="10" />

  <!-- Inner static solid circle -->
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

  <template v-if="cc.metrics">
    <text
      v-for="(metric, index) in cc.metrics"
      :key="metric.label"
      :x="cc.cx + 14"
      :y="cc.cy - 8 + index * 14"
      text-anchor="start"
      fill="#13ce66"
      font-size="12"
      font-family="Arial"
    >
      {{ `${metric.label}: ${metric.value}${metric.unit}` }}
    </text>
  </template>
</template>

<style scoped>
.progress-ring-text {
  fill: #13ce66;
}

.progress-ring {
  --radius: 10;
  --circumference: 62.8;
  fill: none;
  stroke: #13ce66;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: calc(var(--circumference) / 4) calc(var(--circumference) / 4);
  animation: flow 2s linear infinite;
}

@keyframes flow {
  from {
    stroke-dashoffset: var(--circumference);
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
