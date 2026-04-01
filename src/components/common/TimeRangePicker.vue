<template>
  <div class="time-range-picker flex items-center gap-3">
    <span class="text-gray-300 text-sm">时间范围:</span>
    <el-radio-group
      v-model="selectedRange"
      size="small"
      @change="handleRangeChange"
    >
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="week">最近7天</el-radio-button>
      <el-radio-button label="month">最近30天</el-radio-button>
      <el-radio-button label="quarter">本季度</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()

const selectedRange = ref<string>('all')

function handleRangeChange(value: string) {
  uiStore.setTimeRange(value as any)
}

// 同步 uiStore 的值
watch(() => uiStore.timeRange, (newVal) => {
  selectedRange.value = newVal
}, { immediate: true })
</script>

<style scoped>
.time-range-picker {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border-color: #1890ff;
  box-shadow: -1px 0 0 0 #1890ff;
}
</style>