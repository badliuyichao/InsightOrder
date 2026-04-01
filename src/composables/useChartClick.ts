import type { Ticket } from '@/types'
import { useDataStore } from '@/stores/dataStore'
import { format } from 'date-fns'

/**
 * ECharts 点击事件数据结构
 */
export interface ChartClickData {
  componentType: string    // 组件类型：series, xAxis, yAxis等
  seriesType: string       // 系列类型：line, bar, pie, scatter等
  seriesName: string       // 系列名称
  name: string             // 数据项名称
  value: number | number[] // 数据值
  dataIndex: number        // 数据索引
  data: any                // 完整数据对象
  dataType?: string        // 数据类型（桑基图的node或edge）
}

/**
 * 筛选条件结构
 */
export interface FilterCondition {
  field: string           // 筛选字段
  operator: string        // 操作符：eq, in, between, month
  value: any              // 筛选值
  description: string     // 筛选描述
}

/**
 * 图表元数据（用于辅助筛选）
 */
export interface ChartMeta {
  filterField?: string              // 筛选字段
  xAxisData?: string[]              // X轴数据（热力图）
  yAxisData?: string[]              // Y轴数据（热力图）
  xField?: string                   // X维度字段
  yField?: string                   // Y维度字段
  [key: string]: any                // 其他自定义信息
}

/**
 * 图表点击处理组合式函数
 */
export function useChartClick() {
  const dataStore = useDataStore()

  /**
   * 根据图表点击数据构建筛选条件
   * @param chartType 图表类型
   * @param clickData 点击事件数据
   * @param chartMeta 图表元数据
   */
  function buildFilterCondition(
    chartType: string,
    clickData: ChartClickData,
    chartMeta?: ChartMeta
  ): FilterCondition[] {
    const conditions: FilterCondition[] = []

    switch (chartType) {
      case 'line':
        // 折线图：按时间筛选（月份）
        if (clickData.name) {
          conditions.push({
            field: 'createDate',
            operator: 'month',
            value: clickData.name,
            description: `创建月份 = ${clickData.name}`
          })
        }
        break

      case 'bar':
        // 柱状图：按维度值筛选
        if (clickData.name && chartMeta?.filterField) {
          const field = chartMeta.filterField
          conditions.push({
            field,
            operator: 'eq',
            value: clickData.name,
            description: `${getFieldDisplayName(field)} = ${clickData.name}`
          })
        }
        break

      case 'pie':
        // 饼图：按维度值筛选
        if (clickData.name && chartMeta?.filterField) {
          const field = chartMeta.filterField
          conditions.push({
            field,
            operator: 'eq',
            value: clickData.name,
            description: `${getFieldDisplayName(field)} = ${clickData.name}`
          })
        }
        break

      case 'radar':
        // 雷达图：按经办人筛选
        if (clickData.name) {
          conditions.push({
            field: 'assignee',
            operator: 'eq',
            value: clickData.name,
            description: `经办人 = ${clickData.name}`
          })
        }
        break

      case 'scatter':
        // 散点图：按工单key精确匹配
        if (clickData.data && Array.isArray(clickData.data) && clickData.data.length >= 3) {
          conditions.push({
            field: 'key',
            operator: 'eq',
            value: clickData.data[2],
            description: `工单关键字 = ${clickData.data[2]}`
          })
        }
        break

      case 'heatmap':
        // 热力图：双维度筛选
        if (clickData.data && Array.isArray(clickData.data) && clickData.data.length >= 3) {
          const xIndex = clickData.data[0]
          const yIndex = clickData.data[1]

          if (chartMeta?.xAxisData && chartMeta?.yAxisData && chartMeta?.xField && chartMeta?.yField) {
            const xValue = chartMeta.xAxisData[xIndex]
            const yValue = chartMeta.yAxisData[yIndex]

            conditions.push({
              field: chartMeta.xField,
              operator: 'eq',
              value: xValue,
              description: `${getFieldDisplayName(chartMeta.xField)} = ${xValue}`
            })

            conditions.push({
              field: chartMeta.yField,
              operator: 'eq',
              value: yValue,
              description: `${getFieldDisplayName(chartMeta.yField)} = ${yValue}`
            })
          }
        }
        break

      case 'funnel':
        // 漏斗图：按状态筛选
        if (clickData.name) {
          conditions.push({
            field: 'status',
            operator: 'eq',
            value: clickData.name,
            description: `状态 = ${clickData.name}`
          })
        }
        break

      case 'sankey':
        // 桑基图：按节点或路径筛选
        if (clickData.dataType === 'node') {
          // 点击节点：根据节点名称筛选
          if (clickData.name) {
            // 桑基图节点可能代表多个维度（问题类型、领域、状态）
            // 需要从 chartMeta 中获取节点对应的维度
            const nodeField = chartMeta?.nodeField || 'customerIssueType'
            conditions.push({
              field: nodeField,
              operator: 'eq',
              value: clickData.name,
              description: `${getFieldDisplayName(nodeField)} = ${clickData.name}`
            })
          }
        } else if (clickData.dataType === 'edge') {
          // 点击连线：需要同时筛选源节点和目标节点
          if (clickData.data) {
            const source = clickData.data.source
            const target = clickData.data.target

            // 根据桑基图的配置判断源和目标对应的字段
            // 通常问题类型 → 领域 → 状态
            if (chartMeta?.sankeyFields) {
              const fields = chartMeta.sankeyFields
              if (fields.sourceField) {
                conditions.push({
                  field: fields.sourceField,
                  operator: 'eq',
                  value: source,
                  description: `${getFieldDisplayName(fields.sourceField)} = ${source}`
                })
              }
              if (fields.targetField) {
                conditions.push({
                  field: fields.targetField,
                  operator: 'eq',
                  value: target,
                  description: `${getFieldDisplayName(fields.targetField)} = ${target}`
                })
              }
            }
          }
        }
        break

      default:
        console.warn(`未知的图表类型: ${chartType}`)
    }

    return conditions
  }

  /**
   * 根据筛选条件过滤工单
   * @param conditions 筛选条件数组
   */
  function filterTickets(conditions: FilterCondition[]): Ticket[] {
    if (conditions.length === 0) {
      return []
    }

    return dataStore.filteredData.filter(ticket => {
      return conditions.every(condition => {
        const fieldValue = ticket[condition.field as keyof Ticket]

        switch (condition.operator) {
          case 'eq':
            // 等于
            return fieldValue === condition.value

          case 'in':
            // 包含于数组
            return Array.isArray(condition.value) &&
                   (fieldValue as any) !== null &&
                   condition.value.includes(fieldValue as any)

          case 'between':
            // 范围筛选
            if (Array.isArray(condition.value) && condition.value.length === 2) {
              const val = fieldValue as any
              return val >= condition.value[0] && val <= condition.value[1]
            }
            return false

          case 'month':
            // 月份筛选
            if (fieldValue instanceof Date) {
              const month = format(fieldValue, 'yyyy-MM')
              return month === condition.value
            }
            return false

          default:
            console.warn(`未知的操作符: ${condition.operator}`)
            return true
        }
      })
    })
  }

  /**
   * 构建筛选描述文本
   * @param conditions 筛选条件数组
   */
  function buildFilterDescription(conditions: FilterCondition[]): string {
    return conditions.map(c => c.description).join(' & ')
  }

  return {
    buildFilterCondition,
    filterTickets,
    buildFilterDescription
  }
}

/**
 * 获取字段的显示名称
 * @param field 字段名
 */
function getFieldDisplayName(field: string): string {
  const map: Record<string, string> = {
    assignee: '经办人',
    customerIssueType: '客户问题类型',
    domain: '领域模块',
    status: '状态',
    priority: '紧急程度',
    projectName: '项目名称',
    createDate: '创建日期',
    key: '工单关键字',
    duration: '处理时长'
  }
  return map[field] || field
}