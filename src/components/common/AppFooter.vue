<template>
  <footer class="app-footer glass-effect px-6 py-4 mt-8">
    <div class="footer-content flex items-center justify-between">
      <!-- 左侧：统计信息 -->
      <div class="stats-section flex items-center gap-6">
        <div v-if="totalCount > 0" class="stat-item">
          <span class="text-gray-400">工单总量:</span>
          <span class="text-white font-semibold ml-2">{{ totalCount }}</span>
        </div>
        <div v-if="lastUpdateTime" class="stat-item">
          <span class="text-gray-400">更新时间:</span>
          <span class="text-white ml-2">{{ formatTime(lastUpdateTime) }}</span>
        </div>
      </div>

      <!-- 右侧：版权信息 -->
      <div class="copyright text-gray-400 text-sm">
        <span>InsightOrder © 2026 | Powered by Vue 3 + ECharts</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { format } from 'date-fns'

const dataStore = useDataStore()

const totalCount = computed(() => dataStore.totalCount)
const lastUpdateTime = computed(() => dataStore.lastUpdateTime)

function formatTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}
</script>

<style scoped>
.app-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
}
</style>