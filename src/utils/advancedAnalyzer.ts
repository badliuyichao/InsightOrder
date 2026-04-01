import type { Ticket } from '@/types'
import { format, getDay, startOfWeek } from 'date-fns'
import { groupByDimension } from './dataAnalyzer'

/**
 * 计算时间分布热力图数据
 * 按周几和时间周期统计工单数量
 */
export function calculateTimeHeatmap(tickets: Ticket[]) {
  const heatmapData = new Map<string, number>()

  tickets.forEach(ticket => {
    const date = new Date(ticket.createDate)
    const dayOfWeek = getDay(date) // 0-6 (周日到周六)
    const weekStart = startOfWeek(date)
    const weekKey = format(weekStart, 'yyyy-MM-dd')

    const key = `${weekKey}_${dayOfWeek}`
    heatmapData.set(key, (heatmapData.get(key) || 0) + 1)
  })

  // 转换为 ECharts 热力图数据格式 [x, y, value]
  const data: Array<[number, number, number]> = []
  const weeks = Array.from(new Set(
    tickets.map(t => format(startOfWeek(new Date(t.createDate)), 'yyyy-MM-dd'))
  )).sort()

  heatmapData.forEach((value, key) => {
    const [week, day] = key.split('_')
    const x = weeks.indexOf(week)
    const y = parseInt(day)
    data.push([x, y, value])
  })

  return {
    data,
    weeks,
    days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  }
}

/**
 * 计算处理时效趋势
 */
export function calculateEfficiencyTrend(tickets: Ticket[]) {
  const monthlyData = new Map<string, {
    avgDuration: number
    onTimeRate: number
    total: number
    durations: number[]
    onTimeCount: number
  }>()

  tickets.forEach(ticket => {
    const month = format(new Date(ticket.createDate), 'yyyy-MM')
    if (!monthlyData.has(month)) {
      monthlyData.set(month, {
        avgDuration: 0,
        onTimeRate: 0,
        total: 0,
        durations: [],
        onTimeCount: 0
      })
    }

    const group = monthlyData.get(month)!
    group.total++
    if (ticket.duration > 0) {
      group.durations.push(ticket.duration)
      // 假设7天内完成算按时
      if (ticket.duration <= 7) {
        group.onTimeCount++
      }
    }
  })

  const sortedMonths = Array.from(monthlyData.keys()).sort()
  const avgDurations = sortedMonths.map(m => {
    const group = monthlyData.get(m)!
    return group.durations.length > 0
      ? group.durations.reduce((a, b) => a + b, 0) / group.durations.length
      : 0
  })

  const onTimeRates = sortedMonths.map(m => {
    const group = monthlyData.get(m)!
    return group.total > 0 ? (group.onTimeCount / group.total) * 100 : 0
  })

  return {
    months: sortedMonths,
    avgDurations,
    onTimeRates
  }
}

/**
 * 计算高频客户 Top N
 */
export function calculateTopCustomers(tickets: Ticket[], topN: number = 20) {
  const customerMap = new Map<string, {
    count: number
    avgDuration: number
    durations: number[]
    issueTypes: Map<string, number>
  }>()

  tickets.forEach(ticket => {
    const customer = ticket.projectName
    if (!customerMap.has(customer)) {
      customerMap.set(customer, {
        count: 0,
        avgDuration: 0,
        durations: [],
        issueTypes: new Map()
      })
    }

    const group = customerMap.get(customer)!
    group.count++
    if (ticket.duration > 0) {
      group.durations.push(ticket.duration)
    }
    group.issueTypes.set(
      ticket.customerIssueType,
      (group.issueTypes.get(ticket.customerIssueType) || 0) + 1
    )
  })

  // 排序并取 Top N
  const sorted = Array.from(customerMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, topN)

  return sorted.map(([name, data]) => ({
    name,
    count: data.count,
    avgDuration: data.durations.length > 0
      ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
      : 0,
    issueTypes: Array.from(data.issueTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }))
}

/**
 * 计算处理时长分布（直方图）
 */
export function calculateDurationDistribution(tickets: Ticket[]) {
  const durations = tickets
    .map(t => t.duration)
    .filter(d => d > 0)
    .sort((a, b) => a - b)

  if (durations.length === 0) {
    return { bins: [], counts: [] }
  }

  // 定义时间区间
  const bins = [
    { label: '1-3天', min: 1, max: 3 },
    { label: '4-7天', min: 4, max: 7 },
    { label: '8-14天', min: 8, max: 14 },
    { label: '15-21天', min: 15, max: 21 },
    { label: '22-30天', min: 22, max: 30 },
    { label: '30天以上', min: 31, max: Infinity }
  ]

  const counts = bins.map(bin => {
    return durations.filter(d => d >= bin.min && d <= bin.max).length
  })

  return {
    bins: bins.map(b => b.label),
    counts
  }
}

/**
 * 计算状态转化漏斗数据
 */
export function calculateStatusFunnel(tickets: Ticket[]) {
  const statusMap = new Map<string, number>()

  tickets.forEach(ticket => {
    statusMap.set(ticket.status, (statusMap.get(ticket.status) || 0) + 1)
  })

  // 定义漏斗顺序
  const funnelOrder = ['待分析', '研发已完成', '支持确认完成']

  return funnelOrder
    .filter(status => statusMap.has(status))
    .map(status => ({
      name: status,
      value: statusMap.get(status) || 0
    }))
}

/**
 * 计算紧急程度分布
 */
export function calculatePriorityDistribution(tickets: Ticket[]) {
  const priorityMap = new Map<string, number>()

  tickets.forEach(ticket => {
    priorityMap.set(ticket.priority, (priorityMap.get(ticket.priority) || 0) + 1)
  })

  return Array.from(priorityMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

/**
 * 计算经办人效率评分（用于雷达图）
 */
export function calculateAssigneeEfficiency(tickets: Ticket[], assignee: string) {
  const assigneeTickets = tickets.filter(t => t.assignee === assignee)

  if (assigneeTickets.length === 0) {
    return null
  }

  const completedCount = assigneeTickets.filter(t =>
    t.status === '支持确认完成' || t.status === '研发已完成'
  ).length

  const durations = assigneeTickets
    .map(t => t.duration)
    .filter(d => d > 0)

  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0

  // 计算各维度得分（标准化到0-100）
  const processingCountScore = Math.min(assigneeTickets.length / 150 * 100, 100)
  const speedScore = Math.max(0, Math.min((14 - avgDuration) / 14 * 100, 100))
  const completionRateScore = assigneeTickets.length > 0
    ? (completedCount / assigneeTickets.length) * 100
    : 0

  // 紧急响应得分（处理紧急工单的比例）
  const urgentTickets = assigneeTickets.filter(t => t.priority === '紧急' || t.priority === '特急')
  const urgentResponseScore = urgentTickets.length > 0
    ? (urgentTickets.filter(t => t.status === '支持确认完成').length / urgentTickets.length) * 100
    : 100

  return {
    processingCount: assigneeTickets.length,
    avgDuration,
    completionRate: completionRateScore,
    scores: {
      processingCount: processingCountScore,
      speed: speedScore,
      completionRate: completionRateScore,
      urgentResponse: urgentResponseScore,
      diversity: 70 // 领域多样性，暂时固定值
    }
  }
}

/**
 * 计算关联分析数据（桑基图）
 * 问题类型 -> 领域模块 -> 状态
 */
export function calculateSankeyData(tickets: Ticket[]) {
  const nodesSet = new Set<string>()
  const linksMap = new Map<string, { source: string; target: string; value: number }>()

  tickets.forEach(ticket => {
    const issueType = ticket.customerIssueType
    const domain = ticket.domain
    const status = ticket.status

    // 过滤掉空值
    if (!issueType || !domain || !status) return

    // 添加节点（带层级前缀，便于区分）
    const issueNode = `问题类型_${issueType}`
    const domainNode = `领域模块_${domain}`
    const statusNode = `状态_${status}`

    nodesSet.add(issueNode)
    nodesSet.add(domainNode)
    nodesSet.add(statusNode)

    // 添加链接：问题类型 -> 领域模块
    const link1Key = `${issueNode}->${domainNode}`
    if (!linksMap.has(link1Key)) {
      linksMap.set(link1Key, { source: issueNode, target: domainNode, value: 0 })
    }
    linksMap.get(link1Key)!.value++

    // 添加链接：领域模块 -> 状态
    const link2Key = `${domainNode}->${statusNode}`
    if (!linksMap.has(link2Key)) {
      linksMap.set(link2Key, { source: domainNode, target: statusNode, value: 0 })
    }
    linksMap.get(link2Key)!.value++
  })

  const nodes = Array.from(nodesSet).map(name => ({ name }))
  const links = Array.from(linksMap.values())

  return { nodes, links }
}

/**
 * 计算经办人专业领域专注度
 */
export function calculateAssigneeDomainFocus(tickets: Ticket[], topN: number = 10) {
  const assigneeMap = new Map<string, Map<string, number>>()

  tickets.forEach(ticket => {
    const assignee = ticket.assignee
    const domain = ticket.domain

    if (!assigneeMap.has(assignee)) {
      assigneeMap.set(assignee, new Map())
    }

    const domainMap = assigneeMap.get(assignee)!
    domainMap.set(domain, (domainMap.get(domain) || 0) + 1)
  })

  // 取 Top N 经办人
  const sortedAssignees = Array.from(assigneeMap.entries())
    .sort((a, b) => {
      const aTotal = Array.from(a[1].values()).reduce((x, y) => x + y, 0)
      const bTotal = Array.from(b[1].values()).reduce((x, y) => x + y, 0)
      return bTotal - aTotal
    })
    .slice(0, topN)

  // 收集所有领域
  const allDomains = Array.from(new Set(
    tickets.map(t => t.domain).filter(d => d)
  ))

  return {
    assignees: sortedAssignees.map(([name]) => name),
    domains: allDomains,
    data: sortedAssignees.map(([, domainMap]) => {
      return allDomains.map(domain => domainMap.get(domain) || 0)
    })
  }
}

/**
 * 计算问题热点矩阵（领域模块 × 问题类型）
 */
export function calculateIssueHeatmap(tickets: Ticket[]) {
  const matrix = new Map<string, Map<string, number>>()

  // 收集所有领域和问题类型
  const domains = Array.from(new Set(tickets.map(t => t.domain).filter(d => d)))
  const issueTypes = Array.from(new Set(tickets.map(t => t.customerIssueType).filter(t => t)))

  // 初始化矩阵
  domains.forEach(domain => {
    matrix.set(domain, new Map())
    issueTypes.forEach(type => {
      matrix.get(domain)!.set(type, 0)
    })
  })

  // 统计数量
  tickets.forEach(ticket => {
    if (ticket.domain && ticket.customerIssueType) {
      const domainMap = matrix.get(ticket.domain)
      if (domainMap) {
        domainMap.set(
          ticket.customerIssueType,
          (domainMap.get(ticket.customerIssueType) || 0) + 1
        )
      }
    }
  })

  // 转换为二维数组格式
  const data: Array<[number, number, number]> = []
  domains.forEach((domain, i) => {
    issueTypes.forEach((type, j) => {
      const value = matrix.get(domain)?.get(type) || 0
      data.push([i, j, value])
    })
  })

  return {
    domains,
    issueTypes,
    data
  }
}

/**
 * 计算超期风险散点图数据
 */
export function calculateOverdueRiskData(tickets: Ticket[]) {
  const data = tickets
    .filter(t => t.duration > 0)
    .map(ticket => {
      const isOverdue = ticket.duration > 14 // 超过14天算超期
      return {
        createDate: ticket.createDate,
        duration: ticket.duration,
        key: ticket.key,
        status: ticket.status,
        isOverdue
      }
    })

  return data
}

/**
 * 计算综合评分模型
 */
export function calculateComprehensiveScores(tickets: Ticket[]) {
  // 客户价值评分
  const customerScores = calculateTopCustomers(tickets, 20).map(customer => ({
    name: customer.name,
    score: customer.count * 10 + (100 - customer.avgDuration) * 5,
    count: customer.count,
    avgDuration: customer.avgDuration
  })).sort((a, b) => b.score - a.score)

  // 经办人效能评分
  const assigneeGroups = groupByDimension(tickets, 'assignee')
  const assigneeScores = assigneeGroups.slice(0, 20).map(assignee => {
    const efficiency = calculateAssigneeEfficiency(tickets, assignee.name)
    const score = efficiency
      ? efficiency.scores.processingCount * 0.3 +
        efficiency.scores.speed * 0.25 +
        efficiency.scores.completionRate * 0.25 +
        efficiency.scores.urgentResponse * 0.2
      : 0

    return {
      name: assignee.name,
      score: Math.round(score),
      count: assignee.value
    }
  }).sort((a: any, b: any) => b.score - a.score)

  return {
    customerScores,
    assigneeScores
  }
}