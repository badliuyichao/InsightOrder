import type { EChartsOption } from 'echarts'

/**
 * 图表配置组合式函数
 */
export function useCharts() {
  /**
   * 获取通用图表主题配置
   */
  function getBaseTheme() {
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#fff'
      }
    }
  }

  /**
   * 创建折线图配置
   */
  function createLineChart(data: {
    xAxis: string[]
    series: Array<{ name: string; data: number[]; color?: string }>
    title?: string
  }): EChartsOption {
    return {
      ...getBaseTheme(),
      title: data.title ? {
        text: data.title,
        textStyle: { color: '#fff', fontSize: 18 }
      } : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#1890ff',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: data.series.map(s => s.name),
        textStyle: { color: '#fff' },
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.xAxis,
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#fff' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#fff' },
        splitLine: { lineStyle: { color: '#2d2d2d' } }
      },
      series: data.series.map(s => ({
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: true,
        itemStyle: { color: s.color || '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: s.color ? `${s.color}40` : 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0)' }
            ]
          }
        }
      }))
    }
  }

  /**
   * 创建柱状图配置
   */
  function createBarChart(data: {
    xAxis?: string[]
    yAxis?: string[]
    series: number[]
    horizontal?: boolean
    title?: string
    color?: string
  }): EChartsOption {
    const isHorizontal = data.horizontal || false

    return {
      ...getBaseTheme(),
      title: data.title ? {
        text: data.title,
        textStyle: { color: '#fff', fontSize: 18 }
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#1890ff',
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: isHorizontal ? 'value' : 'category',
        data: isHorizontal ? undefined : data.xAxis,
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#fff' },
        splitLine: isHorizontal ? { lineStyle: { color: '#2d2d2d' } } : undefined
      } as any,
      yAxis: {
        type: isHorizontal ? 'category' : 'value',
        data: isHorizontal ? data.yAxis : undefined,
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#fff' },
        splitLine: isHorizontal ? undefined : { lineStyle: { color: '#2d2d2d' } }
      } as any,
      series: [{
        type: 'bar',
        data: data.series,
        itemStyle: {
          color: {
            type: 'linear',
            x: isHorizontal ? 0 : 0,
            y: isHorizontal ? 0 : 1,
            x2: isHorizontal ? 1 : 0,
            y2: isHorizontal ? 0 : 0,
            colorStops: [
              { offset: 0, color: data.color || '#1890ff' },
              { offset: 1, color: '#722ed1' }
            ]
          }
        },
        barWidth: '60%'
      }]
    }
  }

  /**
   * 创建饼图配置
   */
  function createPieChart(data: {
    series: Array<{ name: string; value: number }>
    title?: string
    radius?: string | [string, string]
    roseType?: boolean
  }): EChartsOption {
    return {
      ...getBaseTheme(),
      title: data.title ? {
        text: data.title,
        textStyle: { color: '#fff', fontSize: 18 }
      } : undefined,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#1890ff',
        textStyle: { color: '#fff' }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: '#fff' },
        top: 'middle'
      },
      series: [{
        type: 'pie',
        radius: data.radius || '70%',
        center: ['60%', '50%'],
        roseType: data.roseType ? 'area' : undefined,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {d}%',
          color: '#fff'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data.series
      }],
      color: ['#1890ff', '#722ed1', '#13c2c2', '#52c41a', '#faad14', '#f5222d', '#eb2f96', '#fa8c16']
    }
  }

  return {
    getBaseTheme,
    createLineChart,
    createBarChart,
    createPieChart
  }
}