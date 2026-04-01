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
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  theme: 'dark'
})

// 定义 emit 事件
const emit = defineEmits<{
  (e: 'chartClick', data: any): void
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 初始化图表
function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.option)

  // 添加点击事件监听
  chartInstance.on('click', (params) => {
    emit('chartClick', params)
  })

  // 添加响应式监听
  window.addEventListener('resize', handleResize)
}

// 处理大小变化
function handleResize() {
  chartInstance?.resize()
}

// 更新图表配置
watch(() => props.option, (newOption) => {
  if (chartInstance) {
    nextTick(() => {
      chartInstance?.setOption(newOption, true)
      chartInstance?.resize()
    })
  }
}, { deep: true })

// 销毁图表
function disposeChart() {
  if (chartInstance) {
    // 移除点击事件监听
    chartInstance.off('click')
    chartInstance.dispose()
    chartInstance = null
    window.removeEventListener('resize', handleResize)
  }
}

// 导出图表为PNG
function exportAsImage(fileName: string = 'chart.png') {
  if (!chartInstance) return

  try {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#0f0c29'
    })

    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    link.click()
  } catch (error) {
    console.error('导出图表失败:', error)
  }
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  disposeChart()
})

// 暴露方法供外部调用
defineExpose({
  getInstance: () => chartInstance,
  resize: () => chartInstance?.resize(),
  clear: () => chartInstance?.clear(),
  setOption: (option: EChartsOption) => chartInstance?.setOption(option),
  exportAsImage
})
</script>

<style scoped>
div {
  min-height: 300px;
}
</style>