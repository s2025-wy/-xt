<template>
  <div class="plan-review">
    <div class="page-header">
      <h1>计划审核</h1>
      <p>审核下属员工提交的工作计划</p>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已退回" value="rejected" />
      </el-select>
      
      <el-select v-model="filterDepartment" placeholder="部门筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="研发部" value="rd" />
        <el-option label="产品部" value="product" />
        <el-option label="市场部" value="marketing" />
      </el-select>
      
      <el-input v-model="searchKeyword" placeholder="搜索计划名称或员工姓名" style="width: 250px" />
      
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      
      <el-button type="success" @click="batchApprove">批量通过</el-button>
    </div>
    
    <el-card>
      <el-table :data="plans" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="计划编号" width="100" />
        <el-table-column prop="title" label="计划名称" />
        <el-table-column prop="employee" label="提交人" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <span :class="getPriorityClass(row.priority)">{{ getPriorityLabel(row.priority) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cycle" label="周期" width="100">
          <template #default="{ row }">
            <span>{{ getCycleLabel(row.cycle) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="getStatusClass(row.status)">{{ getStatusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button size="small" @click="viewPlan(row)">查看</el-button>
            <el-button size="small" type="success" @click="approvePlan(row)">通过</el-button>
            <el-button size="small" type="warning" @click="modifyAndApprove(row)">修改后通过</el-button>
            <el-button size="small" type="danger" @click="rejectPlan(row)">退回</el-button>
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
    
    <el-dialog v-model="showReviewModal" :title="reviewAction === 'reject' ? '退回计划' : '修改后通过'" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核意见">
          <el-input v-model="reviewForm.comment" type="textarea" :rows="4" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewModal = false">取消</el-button>
        <el-button type="primary" @click="confirmReview">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface Plan {
  id: number
  title: string
  employee: string
  department: string
  priority: string
  cycle: string
  deadline: string
  submitTime: string
  status: string
  description: string
}

const filterStatus = ref('')
const filterDepartment = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showReviewModal = ref(false)
const reviewAction = ref<'reject' | 'modify'>('reject')
const selectedPlan = ref<Plan | null>(null)

const reviewForm = reactive({
  comment: ''
})

const plans = ref<Plan[]>([
  { id: 1, title: 'Q3产品需求文档', employee: '张三', department: '产品部', priority: 'high', cycle: 'monthly', deadline: '2026-07-15', submitTime: '2026-07-01 09:30', status: 'pending', description: '编写Q3产品需求文档' },
  { id: 2, title: '代码审查会议', employee: '李四', department: '研发部', priority: 'medium', cycle: 'weekly', deadline: '2026-07-05', submitTime: '2026-07-01 10:00', status: 'pending', description: '参加团队代码审查会议' },
  { id: 3, title: '修复Bug #2841', employee: '王五', department: '研发部', priority: 'high', cycle: 'daily', deadline: '2026-07-06', submitTime: '2026-07-01 11:30', status: 'pending', description: '修复登录页面验证码不显示的问题' },
  { id: 4, title: '客户需求沟通', employee: '赵六', department: '市场部', priority: 'low', cycle: 'weekly', deadline: '2026-07-10', submitTime: '2026-07-01 14:00', status: 'approved', description: '与客户沟通新功能需求' },
  { id: 5, title: '性能优化项目', employee: '孙七', department: '研发部', priority: 'high', cycle: 'quarterly', deadline: '2026-09-30', submitTime: '2026-06-30 16:00', status: 'rejected', description: '系统性能优化，提升响应速度' },
  { id: 6, title: '团队培训', employee: '周八', department: '产品部', priority: 'medium', cycle: 'monthly', deadline: '2026-07-20', submitTime: '2026-07-01 09:00', status: 'approved', description: '组织团队技术培训' }
])

const total = computed(() => plans.value.length)

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return labels[priority] || priority
}

const getPriorityClass = (priority: string) => `priority-${priority}`

const getCycleLabel = (cycle: string) => {
  const labels: Record<string, string> = { daily: '日计划', weekly: '周计划', monthly: '月计划', quarterly: '季度计划' }
  return labels[cycle] || cycle
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = { pending: '待审核', approved: '已通过', rejected: '已退回' }
  return labels[status] || status
}

const getStatusClass = (status: string) => `status-${status}`

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value, filterStatus.value, filterDepartment.value)
}

const batchApprove = () => {
  alert('批量通过功能')
}

const viewPlan = (plan: Plan) => {
  console.log('查看:', plan)
}

const approvePlan = (plan: Plan) => {
  if (confirm(`确定通过计划 "${plan.title}" 吗？`)) {
    plan.status = 'approved'
    alert('已通过')
  }
}

const modifyAndApprove = (plan: Plan) => {
  selectedPlan.value = plan
  reviewAction.value = 'modify'
  showReviewModal.value = true
}

const rejectPlan = (plan: Plan) => {
  selectedPlan.value = plan
  reviewAction.value = 'reject'
  showReviewModal.value = true
}

const confirmReview = () => {
  if (!reviewForm.comment) {
    alert('请输入审核意见')
    return
  }
  if (selectedPlan.value) {
    selectedPlan.value.status = reviewAction.value === 'reject' ? 'rejected' : 'approved'
    alert(reviewAction.value === 'reject' ? '已退回' : '已修改后通过')
  }
  showReviewModal.value = false
  reviewForm.comment = ''
}
</script>

<style scoped>
.plan-review {
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
</style>
