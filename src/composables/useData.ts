import { useDataStore } from '@/stores/dataStore'
import { useUIStore } from '@/stores/uiStore'
import { parseExcel } from '@/utils/excelParser'
import { calculateBasicStats } from '@/utils/dataAnalyzer'

/**
 * 数据管理组合式函数
 */
export function useData() {
  const dataStore = useDataStore()
  const uiStore = useUIStore()

  /**
   * 加载并解析 Excel 文件
   */
  async function loadFile(file: File) {
    uiStore.setLoading(true)
    uiStore.setError(null)

    try {
      const data = await parseExcel(file)
      dataStore.setRawData(data)
      dataStore.setFileName(file.name)

      // 计算基础统计
      const stats = calculateBasicStats(data)
      dataStore.basicStats = stats

      return { success: true, data }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '文件解析失败'
      uiStore.setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      uiStore.setLoading(false)
    }
  }

  /**
   * 清空所有数据
   */
  function clearData() {
    dataStore.clearData()
    uiStore.clearFilters()
    uiStore.setError(null)
  }

  return {
    loadFile,
    clearData,
    hasData: () => dataStore.hasData,
    rawData: () => dataStore.rawData,
    basicStats: () => dataStore.basicStats,
    fileName: () => dataStore.fileName,
    isLoading: () => uiStore.loading,
    error: () => uiStore.error
  }
}