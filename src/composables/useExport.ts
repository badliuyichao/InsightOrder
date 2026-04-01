import * as XLSX from 'xlsx'
import type { Ticket } from '@/types'

/**
 * 导出功能组合式函数
 */
export function useExport() {
  /**
   * 导出图表为 PNG 图片
   */
  function exportChartAsImage(chartInstance: any, fileName: string = 'chart.png') {
    if (!chartInstance) {
      console.error('图表实例不存在')
      return
    }

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

  /**
   * 导出数据为 Excel 文件
   */
  function exportDataAsExcel(data: Ticket[], fileName: string = 'exported-data.xlsx') {
    try {
      // 转换数据格式
      const worksheetData = data.map(ticket => ({
        '问题类型': ticket.issueType,
        '关键字': ticket.key,
        '领域模块': ticket.domain,
        '概要': ticket.summary,
        '经办人': ticket.assignee,
        '状态': ticket.status,
        '创建日期': formatDate(ticket.createDate),
        '项目名称': ticket.projectName,
        '紧急程度': ticket.priority,
        '客户问题类型': ticket.customerIssueType,
        '到期日': formatDate(ticket.dueDate),
        '处理时长(天)': ticket.duration
      }))

      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '工单数据')

      // 导出文件
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出 Excel 失败:', error)
    }
  }

  /**
   * 导出分析报告
   */
  function exportReport(_data: {
    title: string
    stats: any
    charts: any[]
  }) {
    // TODO: 生成 PDF 报告
    console.log('导出报告功能待实现')
  }

  return {
    exportChartAsImage,
    exportDataAsExcel,
    exportReport
  }
}

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  if (!date) return ''
  try {
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}