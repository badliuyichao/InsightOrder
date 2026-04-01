<template>
  <div class="chart-container glass-effect p-6 rounded-xl">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-semibold">{{ title }}</h3>
      <button
        class="export-btn px-4 py-2 text-sm rounded-lg transition-all"
        @click="handleExport"
      >
        📥 导出PNG
      </button>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  exportFileName?: string
}

withDefaults(defineProps<Props>(), {
  exportFileName: 'chart.png'
})

const emit = defineEmits<{
  (e: 'export'): void
}>()

function handleExport() {
  emit('export')
}
</script>

<style scoped>
.export-btn {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border: 1px solid rgba(24, 144, 255, 0.3);
}

.export-btn:hover {
  background: rgba(24, 144, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}
</style>