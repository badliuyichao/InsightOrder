<template>
  <header class="app-header glass-effect px-6 py-4">
    <div class="header-content flex items-center justify-between">
      <!-- 左侧：Logo 和标题 -->
      <div class="left-section flex items-center gap-4">
        <div class="logo">
          <span class="text-3xl">📊</span>
        </div>
        <div>
          <h1 class="text-2xl font-bold glow-text">InsightOrder</h1>
          <p class="text-sm text-gray-400">工单分析系统</p>
        </div>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="right-section flex items-center gap-4">
        <!-- 文件信息 -->
        <div v-if="fileName" class="file-info px-4 py-2 rounded-lg bg-white/5">
          <span class="text-sm text-gray-300">当前文件: {{ fileName }}</span>
        </div>

        <!-- 刷新按钮 -->
        <button
          class="refresh-btn px-6 py-2 rounded-lg font-semibold transition-all glow-border"
          :class="{ 'opacity-50': isRefreshing }"
          :disabled="isRefreshing"
          @click="handleRefresh"
        >
          <span v-if="!isRefreshing" class="flex items-center gap-2">
            <span>🔄</span>
            <span>刷新数据</span>
          </span>
          <span v-else class="flex items-center gap-2">
            <span class="animate-spin">⏳</span>
            <span>正在加载...</span>
          </span>
        </button>

        <!-- 文件选择按钮 -->
        <button
          class="upload-btn px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all glow-border"
          @click="triggerFileInput"
        >
          <span class="flex items-center gap-2">
            <span>📁</span>
            <span>选择文件</span>
          </span>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".xls,.xlsx"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useUIStore } from '@/stores/uiStore'
import { parseExcel } from '@/utils/excelParser'

const dataStore = useDataStore()
const uiStore = useUIStore()

const fileInput = ref<HTMLInputElement>()
const fileName = ref<string>('')
const isRefreshing = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  fileName.value = file.name
  uiStore.setLoading(true)
  isRefreshing.value = true

  try {
    const data = await parseExcel(file)
    dataStore.setRawData(data)
    dataStore.setFileName(file.name)
    uiStore.setError(null)

    console.log('文件解析成功:', file.name, '共', data.length, '条记录')
  } catch (error) {
    console.error('文件解析失败:', error)
    uiStore.setError('文件解析失败，请检查文件格式')
  } finally {
    uiStore.setLoading(false)
    isRefreshing.value = false
  }
}

async function handleRefresh() {
  if (!fileName.value) {
    alert('请先选择一个文件')
    return
  }

  // 重新触发文件选择
  triggerFileInput()
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>