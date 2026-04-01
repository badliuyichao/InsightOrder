import type { Ticket, BasicStats, GroupResult } from '@/types'

/**
 * 计算基础统计指标
 */
export function calculateBasicStats(tickets: Ticket[]): BasicStats {
  const totalCount = tickets.length

  const completedCount = tickets.filter(t =>
    t.status === '支持确认完成' || t.status === '研发已完成'
  ).length

  const durations = tickets
    .map(t => t.duration)
    .filter(d => d > 0)
    .sort((a, b) => a - b)

  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0

  const medianDuration = durations.length > 0
    ? durations[Math.floor(durations.length / 2)]
    : 0

  const uniqueAssignees = new Set(tickets.map(t => t.assignee))
  const uniqueProjects = new Set(tickets.map(t => t.projectName))

  const pendingCount = tickets.filter(t => t.status === '待分析').length

  return {
    totalCount,
    completedCount,
    completionRate: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    avgDuration,
    medianDuration,
    activeAssignees: uniqueAssignees.size,
    activeProjects: uniqueProjects.size,
    pendingCount
  }
}

/**
 * 按维度分组统计
 */
export function groupByDimension(
  tickets: Ticket[],
  dimension: keyof Ticket
): GroupResult[] {
  const groups = new Map<string, number>()

  tickets.forEach(ticket => {
    const key = String(ticket[dimension])
    groups.set(key, (groups.get(key) || 0) + 1)
  })

  const total = tickets.length
  const result = Array.from(groups.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value)

  return result
}