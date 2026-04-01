// 工单数据类型定义
export interface Ticket {
  issueType: string        // 问题类型
  key: string              // 工单唯一标识
  domain: string           // 领域模块
  summary: string          // 工单概要
  assignee: string         // 经办人
  status: string           // 状态
  createDate: Date         // 创建日期
  projectName: string      // 项目名称
  priority: string         // 紧急程度
  customerIssueType: string // 客户问题类型
  dueDate: Date            // 到期日
  duration: number         // 处理时长（天）
}

// 基础统计指标
export interface BasicStats {
  totalCount: number           // 工单总量
  completedCount: number       // 已完成数量
  completionRate: number       // 完成率（百分比）
  avgDuration: number          // 平均处理时长（天）
  medianDuration: number       // 中位数处理时长（天）
  activeAssignees: number      // 活跃经办人数
  activeProjects: number       // 活跃项目数
  pendingCount: number         // 待处理数量
}

// 分组统计结果
export interface GroupResult {
  name: string        // 分组名称
  value: number       // 数量
  percentage: number  // 占比（百分比）
}

// 趋势数据
export interface TrendData {
  dates: string[]      // 日期数组
  created: number[]    // 创建数量
  completed: number[]  // 完成数量
}

// 文件信息
export interface FileInfo {
  name: string         // 文件名
  size: number         // 文件大小（字节）
  lastModified: Date   // 最后修改时间
  path: string         // 文件路径
}