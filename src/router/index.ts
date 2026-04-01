import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: {
        title: '数据概览'
      }
    },
    {
      path: '/detail/:type/:id',
      name: 'detail',
      component: () => import('@/views/Detail.vue'),
      meta: {
        title: '工单详情'
      }
    }
  ]
})

export default router