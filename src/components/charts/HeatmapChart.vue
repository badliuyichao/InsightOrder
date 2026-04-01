<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  option: EChartsOption
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '500px'
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, 'dark')
  chartInstance.setOption(props.option)

  window.addEventListener('resize', handleResize)
}

function handleResize() {
  chartInstance?.resize()
}

watch(() => props.option, (newOption) => {
  if (chartInstance) {
    nextTick(() => {
      chartInstance?.setOption(newOption, true)
      chartInstance?.resize()
    })
  }
}, { deep: true })

function disposeChart() {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
    window.removeEventListener('resize', handleResize)
  }
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  disposeChart()
})

defineExpose({
  getInstance: () => chartInstance,
  resize: () => chartInstance?.resize()
})
</script>

<style scoped>
div {
  min-height: 400px;
}
</style>