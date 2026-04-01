import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出各个 store
export * from './dataStore'
export * from './uiStore'