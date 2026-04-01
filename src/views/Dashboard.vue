<template>
  <div class="dashboard-container min-h-screen p-6">
    <!-- 时间范围选择器 -->
    <div v-if="hasData" class="mb-6">
      <TimeRangePicker />
    </div>

    <!-- 数据概览区 - 8个关键指标卡片 -->
    <div v-if="hasData" class="stats-grid mb-8">
      <StatCard
        title="工单总量"
        :value="basicStats?.totalCount || 0"
        icon="📊"
        description="所有工单记录总数"
      />
      <StatCard
        title="完成率"
        :value="basicStats?.completionRate || 0"
        unit="%"
        icon="✅"
        description="已完成工单占比"
        :trend="completionTrend"
      />
      <StatCard
        title="平均时长"
        :value="basicStats?.avgDuration || 0"
        unit="天"
        icon="⏱️"
        description="工单平均处理时长"
      />
      <StatCard
        title="中位数时长"
        :value="basicStats?.medianDuration || 0"
        unit="天"
        icon="📈"
        description="工单处理时长中位数"
      />
      <StatCard
        title="经办人数"
        :value="basicStats?.activeAssignees || 0"
        icon="👥"
        description="活跃经办人总数"
      />
      <StatCard
        title="项目数"
        :value="basicStats?.activeProjects || 0"
        icon="📁"
        description="活跃客户项目数"
      />
      <StatCard
        title="待处理"
        :value="basicStats?.pendingCount || 0"
        icon="⚠️"
        description="待分析工单数量"
      />
      <StatCard
        title="已完成"
        :value="basicStats?.completedCount || 0"
        icon="🎉"
        description="已完成工单数量"
      />
    </div>

    <!-- 主要图表区域 -->
    <div v-if="hasData" class="charts-section">
      <!-- 第一行：趋势图和工作量分布 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">工单趋势分析</h3>
          <BaseChart
            :option="trendChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'line', { filterField: 'createDate' })"
          />
        </div>
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">经办人工作量分布</h3>
          <BaseChart
            :option="assigneeChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'bar', { filterField: 'assignee' })"
          />
        </div>
      </div>

      <!-- 第二行：问题类型和客户分布 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">问题类型分布</h3>
          <BaseChart
            :option="issueTypeChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'pie', { filterField: 'customerIssueType' })"
          />
        </div>
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">领域模块分布</h3>
          <BaseChart
            :option="domainChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'pie', { filterField: 'domain' })"
          />
        </div>
      </div>

      <!-- 第三行：处理时效分析和状态转化漏斗 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">处理时效趋势</h3>
          <BaseChart
            :option="efficiencyTrendChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'line', { filterField: 'createDate' })"
          />
        </div>
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">状态转化漏斗</h3>
          <FunnelChart
            :option="statusFunnelChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'funnel', { filterField: 'status' })"
          />
        </div>
      </div>

      <!-- 第四行：处理时长分布和高频客户分析 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">处理时长分布</h3>
          <BaseChart
            :option="durationDistributionChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'bar', { filterField: 'duration' })"
          />
        </div>
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">高频客户 Top 15</h3>
          <BaseChart
            :option="topCustomersChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'bar', { filterField: 'projectName' })"
          />
        </div>
      </div>

      <!-- 第五行：紧急程度分析和经办人效率雷达图 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">紧急程度分布</h3>
          <BaseChart
            :option="priorityChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'pie', { filterField: 'priority' })"
          />
        </div>
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">经办人效率分析（Top 5）</h3>
          <RadarChart
            :option="assigneeRadarChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'radar', { filterField: 'assignee' })"
          />
        </div>
      </div>

      <!-- 第六行：经办人专业领域专注度 -->
      <div class="glass-effect p-6 rounded-xl mb-6">
        <h3 class="text-xl font-semibold mb-4">经办人专业领域专注度</h3>
        <BaseChart
          :option="assigneeDomainChartOption"
          height="500px"
          @chart-click="(data) => handleChartClick(data, 'bar', { filterField: 'assignee' })"
        />
      </div>

      <!-- 第七行：综合评分模型 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">客户价值评分 Top 10</h3>
          <BaseChart
            :option="customerScoreChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'bar', { filterField: 'projectName' })"
          />
        </div>
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">经办人效能评分 Top 10</h3>
          <BaseChart
            :option="assigneeScoreChartOption"
            height="400px"
            @chart-click="(data) => handleChartClick(data, 'bar', { filterField: 'assignee' })"
          />
        </div>
      </div>

      <!-- 第八行：问题热点矩阵图和超期风险散点图 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">问题热点矩阵（领域×类型）</h3>
          <BaseChart
            :option="issueHeatmapChartOption"
            height="500px"
            @chart-click="(data) => handleChartClick(data, 'heatmap')"
          />
        </div>
        <div class="glass-effect p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-4">超期风险识别</h3>
          <BaseChart
            :option="overdueRiskChartOption"
            height="500px"
            @chart-click="(data) => handleChartClick(data, 'scatter')"
          />
        </div>
      </div>

      <!-- 第九行：时间分布热力图 -->
      <div class="glass-effect p-6 rounded-xl mb-6">
        <h3 class="text-xl font-semibold mb-4">时间分布热力图（工单创建时间规律）</h3>
        <BaseChart
          :option="timeHeatmapChartOption"
          height="500px"
          @chart-click="(data) => handleChartClick(data, 'heatmap')"
        />
      </div>

      <!-- 第九行：桑基图关联分析 -->
      <div class="glass-effect p-6 rounded-xl">
        <h3 class="text-xl font-semibold mb-4">问题流转路径分析（桑基图）</h3>
        <SankeyChart
          :option="sankeyChartOption"
          height="600px"
          @chart-click="(data) => handleChartClick(data, 'sankey')"
        />
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-else class="no-data glass-effect p-8 rounded-xl text-center">
      <div class="mb-4">
        <span class="text-6xl">📁</span>
      </div>
      <h2 class="text-2xl font-semibold mb-4">欢迎使用工单分析系统</h2>
      <p class="text-gray-400 mb-6">请选择 Excel 文件开始分析</p>
      <p class="text-sm text-gray-500">
        支持格式: .xls, .xlsx | 数据将自动解析并可视化展示
      </p>
    </div>

    <!-- 工单详情对话框 -->
    <DetailDialog
      v-model="detailDialogVisible"
      :tickets="detailTickets"
      :filter-description="detailFilterDescription"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useUIStore } from '@/stores/uiStore'
import { calculateBasicStats, groupByDimension } from '@/utils/dataAnalyzer'
import {
  calculateEfficiencyTrend,
  calculateTopCustomers,
  calculateDurationDistribution,
  calculateStatusFunnel,
  calculatePriorityDistribution,
  calculateAssigneeEfficiency,
  calculateSankeyData,
  calculateAssigneeDomainFocus,
  calculateTimeHeatmap,
  calculateIssueHeatmap,
  calculateOverdueRiskData,
  calculateComprehensiveScores
} from '@/utils/advancedAnalyzer'
import { useChartClick } from '@/composables/useChartClick'
import { format } from 'date-fns'
import * as echarts from 'echarts'
import StatCard from '@/components/cards/StatCard.vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import RadarChart from '@/components/charts/RadarChart.vue'
import FunnelChart from '@/components/charts/FunnelChart.vue'
import SankeyChart from '@/components/charts/SankeyChart.vue'
import TimeRangePicker from '@/components/common/TimeRangePicker.vue'
import DetailDialog from '@/components/common/DetailDialog.vue'
import type { EChartsOption } from 'echarts'
import type { Ticket } from '@/types'

const dataStore = useDataStore()
const uiStore = useUIStore()

// 详情对话框状态
const detailDialogVisible = ref(false)
const detailTickets = ref<Ticket[]>([])
const detailFilterDescription = ref('')

// 图表点击处理
const { buildFilterCondition, filterTickets, buildFilterDescription } = useChartClick()

// 基础统计（使用筛选后的数据）
const basicStats = computed(() => {
  if (!dataStore.hasData) return null
  return calculateBasicStats(dataStore.filteredData)
})

const hasData = computed(() => dataStore.hasData)

// 趋势：简化版本
const completionTrend = computed(() => {
  if (!basicStats.value) return undefined
  return basicStats.value.completionRate > 90 ? 'up' : 'down'
})

// 监听时间范围变化，自动应用筛选
watch(() => uiStore.timeRange, (newRange) => {
  console.log('watch触发，新时间范围:', newRange)
  if (dataStore.hasData) {
    dataStore.applyTimeFilter(newRange)
  }
})

// 监听数据加载，应用当前时间筛选
watch(() => dataStore.rawData, () => {
  if (dataStore.hasData) {
    console.log('数据加载完成，应用时间筛选:', uiStore.timeRange)
    dataStore.applyTimeFilter(uiStore.timeRange)
  }
})

/**
 * 处理图表点击事件
 * @param clickData 点击事件数据
 * @param chartType 图表类型
 * @param chartMeta 图表元数据
 */
function handleChartClick(clickData: any, chartType: string, chartMeta?: any) {
  try {
    // 1. 构建筛选条件
    const conditions = buildFilterCondition(chartType, clickData, chartMeta)

    if (conditions.length === 0) {
      console.warn('无法构建筛选条件', { chartType, clickData })
      return
    }

    // 2. 过滤工单
    const tickets = filterTickets(conditions)

    // 3. 构建筛选描述
    const description = buildFilterDescription(conditions)

    // 4. 打开对话框
    detailTickets.value = tickets
    detailFilterDescription.value = description
    detailDialogVisible.value = true

    console.log('图表点击:', { chartType, conditions, ticketsCount: tickets.length })
  } catch (error) {
    console.error('处理图表点击事件失败:', error)
  }
}

// 工单趋势图表配置
const trendChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  // 按月份分组统计
  const monthlyData = new Map<string, { created: number; completed: number }>()

  dataStore.filteredData.forEach(ticket => {
    const month = format(ticket.createDate, 'yyyy-MM')
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { created: 0, completed: 0 })
    }
    const group = monthlyData.get(month)!
    group.created++
    if (ticket.status === '支持确认完成' || ticket.status === '研发已完成') {
      group.completed++
    }
  })

  const sortedMonths = Array.from(monthlyData.keys()).sort()
  const createdData = sortedMonths.map(m => monthlyData.get(m)?.created || 0)
  const completedData = sortedMonths.map(m => monthlyData.get(m)?.completed || 0)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['创建工单', '完成工单'],
      textStyle: { color: '#fff' },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedMonths,
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    series: [
      {
        name: '创建工单',
        type: 'line',
        data: createdData,
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0)' }
            ]
          }
        }
      },
      {
        name: '完成工单',
        type: 'line',
        data: completedData,
        smooth: true,
        itemStyle: { color: '#52c41a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0)' }
            ]
          }
        }
      }
    ]
  }
})

// 经办人工作量图表配置
const assigneeChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const assigneeGroups = groupByDimension(dataStore.filteredData, 'assignee')
  const top10 = assigneeGroups.slice(0, 10)

  return {
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
      type: 'value',
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    yAxis: {
      type: 'category',
      data: top10.map(g => g.name),
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' }
    },
    series: [{
      type: 'bar',
      data: top10.map(g => g.value),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#722ed1' }
          ]
        }
      },
      barWidth: '60%'
    }]
  }
})

// 问题类型图表配置
const issueTypeChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const issueGroups = groupByDimension(dataStore.filteredData, 'customerIssueType')

  return {
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
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: false,
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
      data: issueGroups.map(g => ({
        name: g.name,
        value: g.value
      }))
    }],
    color: ['#1890ff', '#722ed1', '#13c2c2', '#52c41a', '#faad14', '#f5222d', '#eb2f96', '#fa8c16']
  }
})

// 领域模块图表配置
const domainChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const domainGroups = groupByDimension(dataStore.filteredData, 'domain')

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: 'right',
      textStyle: { color: '#fff' },
      top: 'middle'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      center: ['40%', '50%'],
      data: domainGroups.map(g => ({
        name: g.name,
        value: g.value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
    color: ['#1890ff', '#722ed1', '#13c2c2', '#52c41a', '#faad14']
  }
})

// 监听数据变化，更新最后更新时间
watch(() => dataStore.filteredData, () => {
  if (dataStore.hasData) {
    dataStore.lastUpdateTime = new Date()
  }
})

// 处理时效趋势图表配置
const efficiencyTrendChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const trend = calculateEfficiencyTrend(dataStore.filteredData)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['平均处理时长', '按时完成率'],
      textStyle: { color: '#fff' },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trend.months,
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' }
    },
    yAxis: [
      {
        type: 'value',
        name: '天数',
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#fff' },
        splitLine: { lineStyle: { color: '#2d2d2d' } }
      },
      {
        type: 'value',
        name: '完成率 %',
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#fff' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '平均处理时长',
        type: 'line',
        data: trend.avgDurations,
        smooth: true,
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '按时完成率',
        type: 'line',
        yAxisIndex: 1,
        data: trend.onTimeRates,
        smooth: true,
        itemStyle: { color: '#52c41a' }
      }
    ]
  }
})

// 状态转化漏斗图表配置
const statusFunnelChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const funnelData = calculateStatusFunnel(dataStore.filteredData)

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
        color: '#fff'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 16
        }
      },
      data: funnelData
    }],
    color: ['#f5222d', '#faad14', '#52c41a']
  }
})

// 处理时长分布图表配置
const durationDistributionChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const distribution = calculateDurationDistribution(dataStore.filteredData)

  return {
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
      type: 'category',
      data: distribution.bins,
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff', rotate: 15 }
    },
    yAxis: {
      type: 'value',
      name: '工单数量',
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    series: [{
      type: 'bar',
      data: distribution.counts,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#722ed1' },
          { offset: 1, color: '#1890ff' }
        ])
      }
    }]
  }
})

// 高频客户分析图表配置
const topCustomersChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const customers = calculateTopCustomers(dataStore.filteredData, 15)

  return {
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
      type: 'value',
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    yAxis: {
      type: 'category',
      data: customers.map(c => c.name).reverse(),
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff', width: 150, overflow: 'truncate' }
    },
    series: [{
      type: 'bar',
      data: customers.map(c => c.count).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#13c2c2' },
          { offset: 1, color: '#1890ff' }
        ])
      }
    }]
  }
})

// 紧急程度分布图表配置
const priorityChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const priorityData = calculatePriorityDistribution(dataStore.filteredData)

  return {
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
      radius: ['30%', '70%'],
      center: ['60%', '50%'],
      data: priorityData,
      label: {
        show: true,
        formatter: '{b}\n{c} ({d}%)',
        color: '#fff'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
    color: ['#52c41a', '#faad14', '#f5222d']
  }
})

// 经办人效率雷达图表配置
const assigneeRadarChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  // 获取 Top 5 经办人
  const assigneeGroups = groupByDimension(dataStore.filteredData, 'assignee')
  const top5Assignees = assigneeGroups.slice(0, 5).map(g => g.name)

  const radarData = top5Assignees.map(assignee => {
    const efficiency = calculateAssigneeEfficiency(dataStore.filteredData, assignee)
    return {
      name: assignee,
      value: efficiency ? [
        efficiency.scores.processingCount,
        efficiency.scores.speed,
        efficiency.scores.completionRate,
        efficiency.scores.urgentResponse,
        efficiency.scores.diversity
      ] : [0, 0, 0, 0, 0]
    }
  })

  return {
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: top5Assignees,
      textStyle: { color: '#fff' },
      top: 10
    },
    radar: {
      indicator: [
        { name: '处理量', max: 100 },
        { name: '速度', max: 100 },
        { name: '完成率', max: 100 },
        { name: '紧急响应', max: 100 },
        { name: '领域多样性', max: 100 }
      ],
      axisName: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(114, 46, 209, 0.2)', 'rgba(24, 144, 255, 0.2)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: radarData
    }],
    color: ['#1890ff', '#722ed1', '#13c2c2', '#52c41a', '#faad14']
  }
})

// 经办人专业领域专注度图表配置
const assigneeDomainChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const domainFocus = calculateAssigneeDomainFocus(dataStore.filteredData, 10)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: domainFocus.domains,
      textStyle: { color: '#fff' },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: domainFocus.assignees,
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff', rotate: 20 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    series: domainFocus.domains.map((domain, index) => ({
      name: domain,
      type: 'bar',
      stack: 'total',
      data: domainFocus.data.map(d => d[index]),
      itemStyle: {
        color: ['#1890ff', '#722ed1', '#13c2c2', '#52c41a', '#faad14'][index % 5]
      }
    }))
  }
})

// 问题热点矩阵图配置
const issueHeatmapChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const heatmapData = calculateIssueHeatmap(dataStore.filteredData)

  if (heatmapData.data.length === 0) return {}

  return {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        return `${heatmapData.domains[params.data[0]]}<br/>${heatmapData.issueTypes[params.data[1]]}: ${params.data[2]}个工单`
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: heatmapData.issueTypes,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff', rotate: 30, fontSize: 10 }
    },
    yAxis: {
      type: 'category',
      data: heatmapData.domains,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff', fontSize: 10 }
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.data.map(d => d[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#1890ff', '#722ed1', '#f5222d']
      },
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'heatmap',
      data: heatmapData.data,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
})

// 综合评分模型配置
const customerScoreChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const scores = calculateComprehensiveScores(dataStore.filteredData)
  const top10 = scores.customerScores.slice(0, 10)

  return {
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
      type: 'value',
      name: '综合评分',
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    yAxis: {
      type: 'category',
      data: top10.map((s: any) => s.name).reverse(),
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff', width: 120, overflow: 'truncate' }
    },
    series: [{
      type: 'bar',
      data: top10.map((s: any) => s.score).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#faad14' },
          { offset: 1, color: '#f5222d' }
        ])
      }
    }]
  }
})

const assigneeScoreChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const scores = calculateComprehensiveScores(dataStore.filteredData)
  const top10 = scores.assigneeScores.slice(0, 10)

  return {
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
      type: 'value',
      name: '效能评分',
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    yAxis: {
      type: 'category',
      data: top10.map((s: any) => s.name).reverse(),
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' }
    },
    series: [{
      type: 'bar',
      data: top10.map((s: any) => s.score).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#13c2c2' },
          { offset: 1, color: '#1890ff' }
        ])
      }
    }]
  }
})

// 超期风险散点图配置
const overdueRiskChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const riskData = calculateOverdueRiskData(dataStore.filteredData)

  if (riskData.length === 0) return {}

  const normalData = riskData.filter(d => !d.isOverdue)
  const overdueData = riskData.filter(d => d.isOverdue)

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        return `${params.data[2]}<br/>时长: ${params.data[1]}天<br/>状态: ${params.data[3]}`
      }
    },
    legend: {
      data: ['正常', '超期风险'],
      textStyle: { color: '#fff' },
      top: 10
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      name: '创建日期',
      nameTextStyle: { color: '#fff' },
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    yAxis: {
      type: 'value',
      name: '处理时长（天）',
      nameTextStyle: { color: '#fff' },
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#2d2d2d' } }
    },
    series: [
      {
        name: '正常',
        type: 'scatter',
        data: normalData.map(d => [d.createDate, d.duration, d.key, d.status]),
        itemStyle: { color: '#52c41a' },
        symbolSize: 8
      },
      {
        name: '超期风险',
        type: 'scatter',
        data: overdueData.map(d => [d.createDate, d.duration, d.key, d.status]),
        itemStyle: { color: '#f5222d' },
        symbolSize: 12
      }
    ],
    markLine: {
      silent: true,
      lineStyle: { color: '#faad14', type: 'dashed' },
      data: [{ yAxis: 14, label: { formatter: '超期线（14天）', color: '#faad14' } }]
    }
  }
})

// 时间分布热力图配置
const timeHeatmapChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const heatmapData = calculateTimeHeatmap(dataStore.filteredData)

  if (heatmapData.data.length === 0) return {}

  return {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        return `${heatmapData.weeks[params.data[0]]}<br/>${heatmapData.days[params.data[1]]}: ${params.data[2]}个工单`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: heatmapData.weeks,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff', rotate: 45 }
    },
    yAxis: {
      type: 'category',
      data: heatmapData.days,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#8c8c8c' } },
      axisLabel: { color: '#fff' }
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.data.map(d => d[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#1890ff', '#722ed1', '#f5222d']
      },
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'heatmap',
      data: heatmapData.data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
})

// 桑基图关联分析图表配置
const sankeyChartOption = computed<EChartsOption>(() => {
  if (!dataStore.hasData) return {}

  const sankeyData = calculateSankeyData(dataStore.filteredData)

  // 如果没有有效数据，返回空配置
  if (sankeyData.nodes.length === 0 || sankeyData.links.length === 0) {
    return {}
  }

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `${params.name}`
        } else {
          return `${params.data.source} → ${params.data.target}<br/>数量: ${params.data.value}`
        }
      }
    },
    series: [{
      type: 'sankey',
      layoutIterations: 32,
      nodeWidth: 20,
      nodeGap: 12,
      emphasis: {
        focus: 'adjacency'
      },
      data: sankeyData.nodes,
      links: sankeyData.links,
      lineStyle: {
        color: 'gradient',
        curveness: 0.5,
        opacity: 0.6
      },
      label: {
        color: '#fff',
        fontSize: 11,
        position: 'right'
      },
      left: '5%',
      right: '5%',
      top: '5%',
      bottom: '5%'
    }]
  }
})
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.charts-section {
  margin-top: 40px;
}

.no-data {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-section .grid {
    grid-template-columns: 1fr;
  }
}
</style>