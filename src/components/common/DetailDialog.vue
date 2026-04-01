<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    top="5vh"
    custom-class="detail-dialog"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="filter-info">
        <el-tag type="primary">{{ filterDescription }}</el-tag>
        <el-tag type="info">工单数量: {{ filteredTickets.length }} 条</el-tag>
      </div>

      <div class="tools">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索关键字、概要、经办人..."
          prefix-icon="Search"
          clearable
          style="width: 250px"
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
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="paginatedTickets"
      style="width: 100%; margin-top: 20px"
      max-height="500"
      :header-cell-style="{ background: '#1a1a2e', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }"
      :cell-style="{ background: '#16162a', color: '#e0e0e0', borderBottom: '1px solid rgba(255,255,255,0.05)' }"
      :row-style="{ background: '#16162a' }"
      class="dark-table"
    >
      <el-table-column prop="key" label="关键字" width="120" fixed />

      <el-table-column prop="summary" label="概要" min-width="300">
        <template #default="{ row }">
          <div class="summary-content">{{ row.summary }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="assignee" label="经办人" width="100" sortable />

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
          {{ row.duration }} 天
        </template>
      </el-table-column>

      <el-table-column prop="priority" label="紧急程度" width="100" sortable>
        <template #default="{ row }">
          <el-tag :type="getPriorityTagType(row.priority)" size="small">
            {{ row.priority }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredTickets.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="dark-pagination"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import type { Ticket } from '@/types'

interface Props {
  modelValue: boolean           // 对话框可见性
  tickets: Ticket[]            // 工单列表
  filterDescription: string    // 筛选条件描述
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

// 对话框可见性控制
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 内部状态
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 对话框标题
const dialogTitle = computed(() => '工单详情列表')

// 筛选后的工单（搜索 + 状态筛选）
const filteredTickets = computed(() => {
  let result = props.tickets

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

// 当筛选条件变化时，重置分页到第一页
watch([searchKeyword, statusFilter], () => {
  currentPage.value = 1
})
</script>

<script lang="ts">
import { watch } from 'vue'
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(22, 22, 42, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-info {
  display: flex;
  gap: 10px;
}

.tools {
  display: flex;
  gap: 15px;
}

.summary-content {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  line-height: 1.6;
  padding: 8px 0;
}

.pagination-wrapper {
  margin-top: 20px;
  padding: 15px;
  background: rgba(22, 22, 42, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

/* Element Plus 暗黑主题适配 */
.detail-dialog {
  background: rgba(22, 22, 42, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-dialog .el-dialog__header {
  background: #1a1a2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.detail-dialog .el-dialog__title {
  color: #fff !important;
  font-size: 18px;
  font-weight: 600;
}

.detail-dialog .el-dialog__body {
  padding: 20px;
  background: #16162a;
}

/* 暗色输入框 */
.dark-input :deep(.el-input__wrapper) {
  background: #1a1a2e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

.dark-input :deep(.el-input__inner) {
  color: #e0e0e0 !important;
}

.dark-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

/* 暗色下拉框 */
.dark-select :deep(.el-input__wrapper) {
  background: #1a1a2e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

.dark-select :deep(.el-input__inner) {
  color: #e0e0e0 !important;
}

/* 暗色表格 */
.dark-table :deep(.el-table__header-wrapper) {
  background: #1a1a2e;
}

.dark-table :deep(.el-table__body-wrapper) {
  background: #16162a;
}

.dark-table :deep(.el-table__row) {
  background: #16162a !important;
}

.dark-table :deep(.el-table__row:hover > td) {
  background: rgba(24, 144, 255, 0.15) !important;
}

.dark-table :deep(.el-table__empty-text) {
  color: rgba(255, 255, 255, 0.5);
}

.dark-table :deep(.el-table__column-filter-trigger) {
  color: #fff !important;
}

.dark-table :deep(.caret-wrapper) {
  color: #fff !important;
}

/* 暗色分页 */
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

.dark-pagination :deep(.btn-prev),
.dark-pagination :deep(.btn-next) {
  background: #1a1a2e !important;
  color: #e0e0e0 !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-pagination :deep(.el-pagination__sizes .el-input__wrapper) {
  background: #1a1a2e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

.dark-pagination :deep(.el-pagination__sizes .el-input__inner) {
  color: #e0e0e0 !important;
}

.dark-pagination :deep(.el-pagination__editor) {
  background: #1a1a2e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.dark-pagination :deep(.el-pagination__editor .el-input__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
}

.dark-pagination :deep(.el-pagination__editor .el-input__inner) {
  color: #e0e0e0 !important;
}
</style>