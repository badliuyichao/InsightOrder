import { defineStore } from 'pinia'
import type { Ticket, BasicStats } from '@/types'
import { startOfQuarter, subDays, isAfter } from 'date-fns'

export const useDataStore = defineStore('data', {
  state: () => ({
    rawData: [] as Ticket[],              // 原始数据
    filteredData: [] as Ticket[],        // 筛选后数据
    basicStats: null as BasicStats | null, // 基础统计
    lastUpdateTime: null as Date | null,  // 最后更新时间
    fileName: '',                        // 当前文件名
  }),

  getters: {
    // 工单总量
    totalCount: (state) => state.rawData.length,

    // 是否有数据
    hasData: (state) => state.rawData.length > 0,

    // 筛选后数量
    filteredCount: (state) => state.filteredData.length,
  },

  actions: {
    // 设置原始数据
    setRawData(data: Ticket[]) {
      this.rawData = data
      // 设置数据后立即应用当前的时间筛选
      // 这样可以确保筛选生效
      this.filteredData = data
    },

    // 设置文件名
    setFileName(name: string) {
      this.fileName = name
    },

    // 应用时间范围筛选
    applyTimeFilter(timeRange: string) {
      if (timeRange === 'all') {
        this.filteredData = this.rawData
        return
      }

      const now = new Date()
      let startDate: Date

      switch (timeRange) {
        case 'week':
          startDate = subDays(now, 7)
          break
        case 'month':
          startDate = subDays(now, 30)
          break
        case 'quarter':
          startDate = startOfQuarter(now)
          break
        default:
          this.filteredData = this.rawData
          return
      }

      this.filteredData = this.rawData.filter(ticket =>
        isAfter(ticket.createDate, startDate)
      )
    },

    // 清空数据
    clearData() {
      this.rawData = []
      this.filteredData = []
      this.basicStats = null
      this.fileName = ''
      this.lastUpdateTime = null
    },
  }
})