import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons()
  ],
  shortcuts: {
    'glass-card': 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl',
    'glow-text': 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600',
    'flex-center': 'flex items-center justify-center',
    'flex-col-center': 'flex flex-col items-center justify-center'
  },
  theme: {
    colors: {
      primary: '#1890ff',
      secondary: '#722ed1',
      accent: '#13c2c2',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d'
    }
  }
})