<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-spinner glass-effect p-8 rounded-xl">
      <div class="spinner mb-4"></div>
      <p class="text-white font-semibold">{{ message }}</p>
      <p v-if="subMessage" class="text-sm text-gray-400 mt-2">{{ subMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  message?: string
  subMessage?: string
}

withDefaults(defineProps<Props>(), {
  loading: true,
  message: '加载中...',
  subMessage: ''
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>