import * as XLSX from 'xlsx'
import type { Ticket } from '@/types'

/**
 * 转换 Excel 行数据为 Ticket 对象
 */
function transformTicket(row: any): Ticket {
  const createDate = parseDate(row['创建日期'])
  const dueDate = parseDate(row['到期日'])
  const duration = calculateDuration(createDate, dueDate)

  return {
    issueType: row['问题类型'] || '',
    key: row['关键字'] || '',
    domain: row['领域模块'] || '',
    summary: row['概要'] || '',
    assignee: row['经办人'] || '',
    status: row['状态'] || '',
    createDate,
    projectName: row['项目名称'] || '',
    priority: row['紧急程度'] || '一般',
    customerIssueType: row['客户问题类型'] || '',
    dueDate,
    duration
  }
}

/**
 * 解析日期字符串
 */
function parseDate(dateStr: string | number): Date {
  if (!dateStr) return new Date()

  // 如果是数字（Excel 序列号）
  if (typeof dateStr === 'number') {
    // Excel 日期序列号转换（Excel 从 1900-01-01 开始）
    const excelEpoch = new Date(1899, 11, 30)
    const days = Math.floor(dateStr)
    const milliseconds = (dateStr - days) * 24 * 60 * 60 * 1000
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000 + milliseconds)
  }

  // 字符串格式："2026-03-31 17:44" 或 "2026/03/31 17:44"
  try {
    const normalized = dateStr.replace(/\//g, '-')
    return new Date(normalized)
  } catch {
    return new Date()
  }
}

/**
 * 计算处理时长（天数）
 */
function calculateDuration(startDate: Date, endDate: Date): number {
  if (!startDate || !endDate) return 0

  const start = startDate.getTime()
  const end = endDate.getTime()
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

/**
 * 解析 Excel 文件
 */
export async function parseExcel(file: File): Promise<Ticket[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })

        // 获取第一个工作表
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // 转换为 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // 数据清洗和转换
        const tickets: Ticket[] = jsonData.map((row: any) => transformTicket(row))

        resolve(tickets)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 获取最新的 Excel 文件
 */
export function getLatestExcelFile(files: File[]): File {
  // 按修改时间排序，返回最新的
  return files.sort((a, b) => b.lastModified - a.lastModified)[0]
}