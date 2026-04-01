export * from './ticket'

// 通用类型定义
export type StatusType = '待分析' | '研发已完成' | '支持确认完成'
export type PriorityType = '一般' | '紧急' | '特急'

// 图表数据类型
export interface ChartData {
  xAxis: string[]
  yAxis: number[]
  name?: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}