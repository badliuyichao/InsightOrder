import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    timeRange: 'all' as string,  // 时间范围
    selectedAssignee: '' as string,       // 选中的经办人
    selectedCustomer: '' as string,       // 选中的客户
    isRefreshing: false,                  // 刷新状态
    loading: false,                       // 加载状态
    error: null as string | null,         // 错误信息
    customDateRange: null as [Date, Date] | null,  // 自定义日期范围
  }),

  actions: {
    // 设置时间范围
    setTimeRange(range: string) {
      this.timeRange = range
    },

    // 设置刷新状态
    setRefreshing(status: boolean) {
      this.isRefreshing = status
    },

    // 设置加载状态
    setLoading(status: boolean) {
      this.loading = status
    },

    // 设置错误信息
    setError(error: string | null) {
      this.error = error
    },

    // 清空筛选
    clearFilters() {
      this.selectedAssignee = ''
      this.selectedCustomer = ''
      this.timeRange = 'all'
    },
  }
})