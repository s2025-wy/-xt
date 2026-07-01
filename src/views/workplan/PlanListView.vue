<template>
  <div class="plan-list">
    <div class="page-header">
      <h1>我的计划</h1>
      <p>查看和管理您的工作计划</p>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已退回" value="rejected" />
        <el-option label="进行中" value="in-progress" />
        <el-option label="已完成" value="completed" />
      </el-select>
      
      <el-select v-model="filterCycle" placeholder="周期筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="日计划" value="daily" />
        <el-option label="周计划" value="weekly" />
        <el-option label="月计划" value="monthly" />
        <el-option label="季度计划" value="quarterly" />
      </el-select>
      
      <el-input v-model="searchKeyword" placeholder="搜索计划名称" style="width: 200px" />
      
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      
      <el-button type="primary" @click="$router.push('/plan-create')">
        <el-icon><Plus /></el-icon>
        新建计划
      </el-button>
    </div>
    
    <el-card>
      <el-table :data="plans" border>
        <el-table-column prop="id" label="计划编号" width="100" />
        <el-table-column prop="title" label="计划名称" />
        <el-table-column prop="cycle" label="周期" width="100">
          <template #default="{ row }">
            <span :class="getCycleClass(row.cycle)">{{ getCycleLabel(row.cycle) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <span :class="getPriorityClass(row.priority)">{{ getPriorityLabel(row.priority) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="getStatusClass(row.status)">{{ getStatusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewPlan(row)">查看</el-button>
            <el-button size="small" type="warning" @click="editPlan(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePlan(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination 
        v-model:current-page="currentPage" 
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>
    
    <el-dialog v-model="showDetail" title="计划详情" width="600px">
      <div v-if="selectedPlan" class="plan-detail">
        <h3>{{ selectedPlan.title }}</h3>
        <div class="detail-row">
          <span class="label">计划编号：</span>
          <span>{{ selectedPlan.id }}</span>
        </div>
        <div class="detail-row">
          <span class="label">计划周期：</span>
          <span>{{ getCycleLabel(selectedPlan.cycle) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">优先级：</span>
          <span :class="getPriorityClass(selectedPlan.priority)">{{ getPriorityLabel(selectedPlan.priority) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">状态：</span>
          <span :class="getStatusClass(selectedPlan.status)">{{ getStatusLabel(selectedPlan.status) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">截止日期：</span>
          <span>{{ selectedPlan.deadline }}</span>
        </div>
        <div class="detail-row">
          <span class="label">进度：</span>
          <el-progress :percentage="selectedPlan.progress" :stroke-width="12" style="width: 300px" />
        </div>
        <div class="detail-row">
          <span class="label">描述：</span>
          <span>{{ selectedPlan.description }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface Plan {
  id: number
  title: string
  cycle: string
  priority: string
  status: string
  progress: number
  deadline: string
  description: string
}

const filterStatus = ref('')
const filterCycle = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showDetail = ref(false)
const selectedPlan = ref<Plan | null>(null)

const plans = ref<Plan[]>([
  { id: 1, title: 'Q3产品需求文档', cycle: 'monthly', priority: 'high', status: 'approved', progress: 75, deadline: '2026-07-15', description: '编写Q3产品需求文档，包括功能列表和技术方案' },
  { id: 2, title: '代码审查会议', cycle: 'weekly', priority: 'medium', status: 'in-progress', progress: 50, deadline: '2026-07-05', description: '参加团队代码审查会议，评审新功能代码' },
  { id: 3, title: '周报编写', cycle: 'weekly', priority: 'medium', status: 'completed', progress: 100, deadline: '2026-07-03', description: '编写本周工作周报，总结工作进展' },
  { id: 4, title: '修复Bug #2841', cycle: 'daily', priority: 'high', status: 'pending', progress: 0, deadline: '2026-07-06', description: '修复登录页面验证码不显示的问题' },
  { id: 5, title: '客户需求沟通', cycle: 'weekly', priority: 'low', status: 'rejected', progress: 0, deadline: '2026-07-10', description: '与客户沟通新功能需求，确认需求细节' },
  { id: 6, title: '性能优化项目', cycle: 'quarterly', priority: 'high', status: 'in-progress', progress: 30, deadline: '2026-09-30', description: '系统性能优化，提升响应速度' },
  { id: 7, title: '文档更新', cycle: 'daily', priority: 'low', status: 'completed', progress: 100, deadline: '2026-07-02', description: '更新项目文档' },
  { id: 8, title: '团队培训', cycle: 'monthly', priority: 'medium', status: 'approved', progress: 20, deadline: '2026-07-20', description: '组织团队技术培训' }
])

const total = computed(() => plans.value.length)

const getCycleLabel = (cycle: string) => {
  const labels: Record<string, string> = { daily: '日计划', weekly: '周计划', monthly: '月计划', quarterly: '季度计划' }
  return labels[cycle] || cycle
}

const getCycleClass = (cycle: string) => `cycle-${cycle}`

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return labels[priority] || priority
}

const getPriorityClass = (priority: string) => `priority-${priority}`

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = { pending: '待审核', approved: '已通过', rejected: '已退回', 'in-progress': '进行中', completed: '已完成' }
  return labels[status] || status
}

const getStatusClass = (status: string) => `status-${status}`

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value, filterStatus.value, filterCycle.value)
}

const viewPlan = (plan: Plan) => {
  selectedPlan.value = plan
  showDetail.value = true
}

const editPlan = (plan: Plan) => {
  console.log('编辑:', plan)
}

const deletePlan = (plan: Plan) => {
  if (confirm(`确定删除计划 "${plan.title}" 吗？`)) {
    plans.value = plans.value.filter(p => p.id !== plan.id)
  }
}
</script>

<style scoped>
.plan-list {
  padding-bottom: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.page-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cycle-daily {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.cycle-weekly {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.cycle-monthly {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.cycle-quarterly {
  background: #f9f0ff;
  color: #722ed1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.priority-high {
  background: #fff1f0;
  color: #ff4d4f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.priority-medium {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.priority-low {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-approved {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-rejected {
  background: #fff1f0;
  color: #ff4d4f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-in-progress {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-completed {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.plan-detail {
  padding: 16px;
}

.plan-detail h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-row .label {
  width: 100px;
  font-weight: 500;
  color: #606266;
}
</style>
