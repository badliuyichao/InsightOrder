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
  height: '400px'
})

// 定义 emit 事件
const emit = defineEmits<{
  (e: 'chartClick', data: any): void
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, 'dark')
  chartInstance.setOption(props.option)

  // 添加点击事件监听
  chartInstance.on('click', (params) => {
    emit('chartClick', params)
  })

  window.addEventListener('resize', handleResize)
}

function handleResize() {
  chartInstance?.resize()
}

watch(() => props.option, (newOption) => {
  if (chartInstance) {
    nextTick(() => {
      chartInstance?.setOption(newOption, true)
    })
  }
}, { deep: true })

function disposeChart() {
  if (chartInstance) {
    // 移除点击事件监听
    chartInstance.off('click')
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
  getInstance: () => chartInstance
})
</script>

<style scoped>
div {
  min-height: 300px;
}
</style>