<template>
  <div class="stat-card glass-effect glow-border p-6 rounded-xl cursor-pointer" @click="handleClick">
    <!-- 卡片标题 -->
    <div class="card-header flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="icon text-2xl">{{ icon }}</span>
        <h3 class="text-gray-300 font-medium">{{ title }}</h3>
      </div>
      <span v-if="trend" class="trend-badge px-2 py-1 rounded text-xs" :class="trendClass">
        {{ trendText }}
      </span>
    </div>

    <!-- 主要数值 -->
    <div class="card-value mb-2">
      <span ref="valueRef" class="text-4xl font-bold glow-text">
        {{ formattedValue }}
      </span>
      <span v-if="unit" class="text-lg text-gray-400 ml-2">{{ unit }}</span>
    </div>

    <!-- 描述文字 -->
    <p v-if="description" class="text-sm text-gray-400">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import gsap from 'gsap'

interface Props {
  title: string
  value: number
  icon?: string
  unit?: string
  description?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📊',
  unit: '',
  description: '',
  trend: undefined,
  trendValue: 0,
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const valueRef = ref<HTMLElement>()

const formattedValue = computed(() => {
  if (props.value >= 1000) {
    return (props.value / 1000).toFixed(1) + 'K'
  }
  return props.value.toFixed(0)
})

const trendText = computed(() => {
  if (props.trend === 'up') return `↑ ${props.trendValue}%`
  if (props.trend === 'down') return `↓ ${props.trendValue}%`
  return '稳定'
})

const trendClass = computed(() => {
  if (props.trend === 'up') return 'bg-green-500/20 text-green-400'
  if (props.trend === 'down') return 'bg-red-500/20 text-red-400'
  return 'bg-gray-500/20 text-gray-400'
})

/**
 * 处理点击事件
 */
function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}

// 数字滚动动画
watch(() => props.value, (newVal) => {
  if (valueRef.value) {
    gsap.to(valueRef.value, {
      innerHTML: newVal,
      duration: 1,
      snap: { innerHTML: 1 },
      ease: 'power2.out'
    })
  }
})

onMounted(() => {
  if (valueRef.value) {
    gsap.from(valueRef.value, {
      innerHTML: 0,
      duration: 1.5,
      snap: { innerHTML: 1 },
      ease: 'power2.out'
    })
  }
})
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(24, 144, 255, 0.2);
}

.card-value {
  line-height: 1;
}
</style>