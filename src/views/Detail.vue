<template>
  <div class="detail-container min-h-screen p-6">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper mb-6">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">
          <el-icon><HomeFilled /></el-icon>
          首页
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 页面标题和统计 -->
    <div class="page-header glass-effect p-6 rounded-xl mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">{{ pageTitle }}</h1>
          <p class="text-gray-400">{{ pageDescription }}</p>
        </div>
        <div class="stats-cards flex gap-4">
          <div class="stat-card glass-effect p-4 rounded-lg">
            <div class="text-2xl font-bold text-blue-400">{{ tickets.length }}</div>
            <div class="text-sm text-gray-400">工单总数</div>
          </div>
          <div class="stat-card glass-effect p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-400">{{ completedCount }}</div>
            <div class="text-sm text-gray-400">已完成</div>
          </div>
          <div class="stat-card glass-effect p-4 rounded-lg">
            <div class="text-2xl font-bold text-yellow-400">{{ avgDuration.toFixed(1) }}</div>
            <div class="text-sm text-gray-400">平均时长(天)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar glass-effect p-4 rounded-xl mb-6">
      <div class="flex justify-between items-center">
        <div class="flex gap-3">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索关键字、概要、经办人..."
            prefix-icon="Search"
            clearable
            style="width: 300px"
            class="dark-input"
          />

          <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            clearable
            style="width: 150px"
            class="dark-select"
          >
            <el-option label="全部" value="" />
            <el-option label="待分析" value="待分析" />
            <el-option label="研发已完成" value="研发已完成" />
            <el-option label="支持确认完成" value="支持确认完成" />
          </el-select>

          <el-select
            v-model="priorityFilter"
            placeholder="紧急程度"
            clearable
            style="width: 150px"
            class="dark-select"
          >
            <el-option label="全部" value="" />
            <el-option label="一般" value="一般" />
            <el-option label="紧急" value="紧急" />
            <el-option label="特急" value="特急" />
          </el-select>
        </div>

        <div class="flex gap-3">
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
          <el-button @click="handleBack">
            <el-icon><Back /></el-icon>
            返回
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper glass-effect rounded-xl overflow-hidden">
      <el-table
        :data="paginatedTickets"
        style="width: 100%"
        :header-cell-style="{ background: '#1a1a2e', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }"
        :cell-style="{ background: '#16162a', color: '#e0e0e0', borderBottom: '1px solid rgba(255,255,255,0.05)' }"
        :row-style="{ background: '#16162a' }"
        class="dark-table"
        @row-click="handleRowClick"
      >
        <el-table-column prop="key" label="关键字" width="120" fixed />

        <el-table-column prop="summary" label="概要" min-width="300">
          <template #default="{ row }">
            <div class="summary-content">{{ row.summary }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="assignee" label="经办人" width="100" sortable>
          <template #default="{ row }">
            <el-link type="primary" @click.stop="handleAssigneeClick(row.assignee)">
              {{ row.assignee }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createDate" label="创建时间" width="160" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="处理时长" width="100" sortable>
          <template #default="{ row }">
            <span :class="row.duration > 14 ? 'text-red-400' : ''">
              {{ row.duration }} 天
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="紧急程度" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" size="small">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="projectName" label="项目名称" width="200">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="handleProjectClick(row.projectName)">
              {{ row.projectName }}
            </el-link>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper p-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredTickets.length"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          class="dark-pagination"
        />
      </div>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="filteredTickets.length === 0" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { format } from 'date-fns'
import { HomeFilled, Download, Back } from '@element-plus/icons-vue'
import type { Ticket } from '@/types'
import * as XLSX from 'xlsx'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()

// 路由参数
const detailType = computed(() => route.params.type as string)
const detailId = computed(() => route.params.id as string)

// 页面标题和描述
const pageTitle = computed(() => {
  switch (detailType.value) {
    case 'assignee':
      return `经办人工单详情 - ${detailId.value}`
    case 'project':
      return `项目工单详情 - ${detailId.value}`
    case 'status':
      return `状态工单详情 - ${detailId.value}`
    default:
      return '工单详情'
  }
})

const pageDescription = computed(() => {
  switch (detailType.value) {
    case 'assignee':
      return `查看经办人 ${detailId.value} 的所有工单记录`
    case 'project':
      return `查看项目 ${detailId.value} 的所有工单历史`
    case 'status':
      return `查看状态为 ${detailId.value} 的所有工单`
    default:
      return ''
  }
})

// 筛选后的工单
const tickets = computed(() => {
  if (!dataStore.hasData) return []

  let result = dataStore.rawData

  switch (detailType.value) {
    case 'assignee':
      result = result.filter(t => t.assignee === detailId.value)
      break
    case 'project':
      result = result.filter(t => t.projectName === detailId.value)
      break
    case 'status':
      result = result.filter(t => t.status === detailId.value)
      break
  }

  return result
})

// 统计数据
const completedCount = computed(() => {
  return tickets.value.filter(t =>
    t.status === '支持确认完成' || t.status === '研发已完成'
  ).length
})

const avgDuration = computed(() => {
  if (tickets.value.length === 0) return 0
  const sum = tickets.value.reduce((acc, t) => acc + t.duration, 0)
  return sum / tickets.value.length
})

// 内部状态
const searchKeyword = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选后的工单（搜索 + 状态筛选）
const filteredTickets = computed(() => {
  let result = tickets.value

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t =>
      t.key.toLowerCase().includes(keyword) ||
      t.summary.toLowerCase().includes(keyword) ||
      t.assignee.toLowerCase().includes(keyword) ||
      t.projectName.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(t => t.status === statusFilter.value)
  }

  // 紧急程度筛选
  if (priorityFilter.value) {
    result = result.filter(t => t.priority === priorityFilter.value)
  }

  return result
})

// 分页后的工单
const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTickets.value.slice(start, end)
})

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  try {
    const d = date instanceof Date ? date : new Date(date)
    return format(d, 'yyyy-MM-dd HH:mm')
  } catch {
    return String(date)
  }
}

/**
 * 获取状态标签类型
 */
function getStatusTagType(status: string): string {
  const map: Record<string, string> = {
    '待分析': 'warning',
    '研发已完成': 'info',
    '支持确认完成': 'success'
  }
  return map[status] || ''
}

/**
 * 获取紧急程度标签类型
 */
function getPriorityTagType(priority: string): string {
  const map: Record<string, string> = {
    '一般': 'info',
    '紧急': 'warning',
    '特急': 'danger'
  }
  return map[priority] || ''
}

/**
 * 导出Excel
 */
function handleExport() {
  const data = filteredTickets.value.map(t => ({
    '关键字': t.key,
    '概要': t.summary,
    '经办人': t.assignee,
    '状态': t.status,
    '创建时间': formatDate(t.createDate),
    '处理时长(天)': t.duration,
    '紧急程度': t.priority,
    '项目名称': t.projectName,
    '领域模块': t.domain,
    '客户问题类型': t.customerIssueType
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '工单列表')

  const fileName = `${pageTitle.value}_${format(new Date(), 'yyyyMMddHHmmss')}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * 返回上一页
 */
function handleBack() {
  router.push('/')
}

/**
 * 点击经办人（跳转到经办人详情）
 */
function handleAssigneeClick(assignee: string) {
  router.push(`/detail/assignee/${encodeURIComponent(assignee)}`)
}

/**
 * 点击项目（跳转到项目详情）
 */
function handleProjectClick(projectName: string) {
  router.push(`/detail/project/${encodeURIComponent(projectName)}`)
}

/**
 * 点击行（查看工单详情）
 */
function handleRowClick(row: Ticket) {
  // 可以跳转到工单详情页，或者打开对话框
  console.log('查看工单详情:', row.key)
}

// 当筛选条件变化时，重置分页到第一页
watch([searchKeyword, statusFilter, priorityFilter], () => {
  currentPage.value = 1
})

// 如果没有数据，跳转回首页
onMounted(() => {
  if (!dataStore.hasData) {
    router.push('/')
  }
})
</script>

<script lang="ts">
import { watch } from 'vue'
</script>

<style scoped>
.detail-container {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  min-height: 100vh;
}

.breadcrumb-wrapper {
  padding: 15px;
  background: rgba(22, 22, 42, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.breadcrumb-wrapper :deep(.el-breadcrumb__item) {
  color: #e0e0e0;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__inner) {
  color: #e0e0e0;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__inner a) {
  color: #1890ff;
}

.page-header {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-cards .stat-card {
  text-align: center;
  min-width: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.table-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-content {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  line-height: 1.6;
  padding: 8px 0;
}

.pagination-wrapper {
  background: rgba(22, 22, 42, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

/* Element Plus 暗黑主题适配 */
.dark-input :deep(.el-input__wrapper) {
  background: #1a1a2e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

.dark-input :deep(.el-input__inner) {
  color: #e0e0e0 !important;
}

.dark-select :deep(.el-input__wrapper) {
  background: #1a1a2e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

.dark-select :deep(.el-input__inner) {
  color: #e0e0e0 !important;
}

.dark-table :deep(.el-table__row) {
  background: #16162a !important;
  cursor: pointer;
}

.dark-table :deep(.el-table__row:hover > td) {
  background: rgba(24, 144, 255, 0.15) !important;
}

.dark-pagination :deep(.el-pagination__total),
.dark-pagination :deep(.el-pagination__jump) {
  color: #e0e0e0 !important;
}

.dark-pagination :deep(.el-pager li) {
  background: #1a1a2e !important;
  color: #e0e0e0 !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-pagination :deep(.el-pager li:hover) {
  color: #1890ff !important;
}

.dark-pagination :deep(.el-pager li.is-active) {
  background: #1890ff !important;
  color: #fff !important;
  border-color: #1890ff;
}
</style>