<template>
  <div class="execution">
    <div class="page-header">
      <h1>执行跟踪</h1>
      <p>查看和更新计划执行进度</p>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="正常推进" value="normal" />
        <el-option label="有风险" value="risk" />
        <el-option label="已延期" value="overdue" />
      </el-select>
      
      <el-select v-model="filterEmployee" placeholder="员工筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="张三" value="zhangsan" />
        <el-option label="李四" value="lisi" />
        <el-option label="王五" value="wangwu" />
      </el-select>
      
      <el-input v-model="searchKeyword" placeholder="搜索计划名称" style="width: 200px" />
      
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>
    
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">45</span>
          <span class="stat-label">进行中任务</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">8</span>
          <span class="stat-label">有风险任务</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">3</span>
          <span class="stat-label">已延期任务</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">78%</span>
          <span class="stat-label">平均完成率</span>
        </div>
      </el-card>
    </div>
    
    <el-card>
      <el-table :data="tasks" border>
        <el-table-column prop="id" label="任务编号" width="100" />
        <el-table-column prop="title" label="任务名称" />
        <el-table-column prop="employee" label="负责人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="getStatusClass(row.status)">{{ getStatusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="updateTime" label="最后更新" width="150" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="viewTask(row)">查看</el-button>
            <el-button size="small" type="warning" @click="updateProgress(row)">更新进度</el-button>
            <el-button size="small" type="danger" @click="markRisk(row)">标记风险</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="showUpdateModal" title="更新进度" width="500px">
      <el-form :model="updateForm" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="updateForm.title" disabled />
        </el-form-item>
        <el-form-item label="当前进度">
          <el-input-number v-model="updateForm.progress" :min="0" :max="100" />
          <span style="margin-left: 8px">%</span>
        </el-form-item>
        <el-form-item label="执行备注">
          <el-input v-model="updateForm.note" type="textarea" :rows="4" placeholder="请输入执行情况、遇到的问题等" />
        </el-form-item>
        <el-form-item label="延期申请">
          <el-switch v-model="updateForm.extendRequest" />
          <span style="margin-left: 8px">申请延期</span>
        </el-form-item>
        <el-form-item v-if="updateForm.extendRequest" label="新截止日期">
          <el-date-picker v-model="updateForm.newDeadline" type="date" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUpdateModal = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdate">确认更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Task {
  id: number
  title: string
  employee: string
  status: string
  progress: number
  deadline: string
  updateTime: string
}

const filterStatus = ref('')
const filterEmployee = ref('')
const searchKeyword = ref('')
const showUpdateModal = ref(false)
const selectedTask = ref<Task | null>(null)

const updateForm = reactive({
  title: '',
  progress: 0,
  note: '',
  extendRequest: false,
  newDeadline: ''
})

const tasks = ref<Task[]>([
  { id: 1, title: 'Q3产品需求文档编写', employee: '张三', status: 'normal', progress: 75, deadline: '2026-07-15', updateTime: '2026-07-01 16:30' },
  { id: 2, title: '代码审查会议准备', employee: '李四', status: 'normal', progress: 50, deadline: '2026-07-05', updateTime: '2026-07-01 14:00' },
  { id: 3, title: '修复Bug #2841', employee: '王五', status: 'risk', progress: 30, deadline: '2026-07-06', updateTime: '2026-06-30 17:00' },
  { id: 4, title: '客户需求沟通', employee: '赵六', status: 'overdue', progress: 20, deadline: '2026-07-03', updateTime: '2026-07-01 10:00' },
  { id: 5, title: '性能优化项目', employee: '孙七', status: 'normal', progress: 30, deadline: '2026-09-30', updateTime: '2026-07-01 09:00' },
  { id: 6, title: '团队培训策划', employee: '周八', status: 'normal', progress: 80, deadline: '2026-07-20', updateTime: '2026-07-01 11:30' }
])

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = { normal: '正常推进', risk: '有风险', overdue: '已延期' }
  return labels[status] || status
}

const getStatusClass = (status: string) => `status-${status}`

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value, filterStatus.value, filterEmployee.value)
}

const viewTask = (task: Task) => {
  console.log('查看:', task)
}

const updateProgress = (task: Task) => {
  selectedTask.value = task
  updateForm.title = task.title
  updateForm.progress = task.progress
  updateForm.note = ''
  updateForm.extendRequest = false
  updateForm.newDeadline = ''
  showUpdateModal.value = true
}

const markRisk = (task: Task) => {
  if (confirm(`确定标记任务 "${task.title}" 为有风险吗？`)) {
    task.status = 'risk'
    alert('已标记为有风险')
  }
}

const confirmUpdate = () => {
  if (selectedTask.value) {
    selectedTask.value.progress = updateForm.progress
    selectedTask.value.updateTime = new Date().toLocaleString()
    if (updateForm.progress === 100) {
      selectedTask.value.status = 'normal'
    }
    alert('进度更新成功')
  }
  showUpdateModal.value = false
}
</script>

<style scoped>
.execution {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.status-normal {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-risk {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-overdue {
  background: #fff1f0;
  color: #ff4d4f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
