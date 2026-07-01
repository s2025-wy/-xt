<template>
  <div class="plan-create">
    <div class="page-header">
      <h1>制定计划</h1>
      <p>填写计划信息，创建您的工作任务</p>
    </div>
    
    <el-card class="form-card">
      <el-form :model="planForm" :rules="rules" ref="planFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划名称" prop="title">
              <el-input v-model="planForm.title" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划周期" prop="cycle">
              <el-select v-model="planForm.cycle" placeholder="请选择计划周期">
                <el-option label="日计划" value="daily" />
                <el-option label="周计划" value="weekly" />
                <el-option label="月计划" value="monthly" />
                <el-option label="季度计划" value="quarterly" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-radio-group v-model="planForm.priority">
                <el-radio label="high">高优先级</el-radio>
                <el-radio label="medium">中优先级</el-radio>
                <el-radio label="low">低优先级</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计耗时">
              <el-input-number v-model="planForm.estimatedHours" :min="1" :max="1000" placeholder="工时" style="width: 120px" />
              <span style="margin: 0 8px">小时</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="planForm.startDate" type="date" placeholder="选择开始日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="endDate">
              <el-date-picker v-model="planForm.endDate" type="date" placeholder="选择截止日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联项目">
              <el-select v-model="planForm.project" placeholder="请选择项目">
                <el-option label="项目A" value="project-a" />
                <el-option label="项目B" value="project-b" />
                <el-option label="项目C" value="project-c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联部门">
              <el-select v-model="planForm.department" placeholder="请选择部门">
                <el-option label="研发部" value="rd" />
                <el-option label="产品部" value="product" />
                <el-option label="市场部" value="marketing" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="计划描述" prop="description">
          <el-input v-model="planForm.description" type="textarea" :rows="4" placeholder="请输入计划描述" />
        </el-form-item>
        
        <el-form-item label="AI辅助生成">
          <div class="ai-section">
            <el-input v-model="aiPrompt" placeholder="输入一句话描述您的工作目标，AI将帮您生成计划" />
            <el-button type="primary" @click="generatePlan" :loading="aiLoading">
              <el-icon><MagicStick /></el-icon>
              AI生成计划
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="任务列表">
          <div class="task-list">
            <div 
              v-for="(task, index) in planForm.tasks" 
              :key="index" 
              class="task-item"
            >
              <el-form-item :prop="'tasks.' + index + '.title'" :rules="{ required: true, message: '请输入任务名称', trigger: 'blur' }">
                <el-input v-model="task.title" placeholder="任务名称" />
              </el-form-item>
              <el-form-item :prop="'tasks.' + index + '.description'">
                <el-input v-model="task.description" placeholder="任务描述" />
              </el-form-item>
              <el-select v-model="task.priority" placeholder="优先级" style="width: 120px">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
              <el-button type="danger" size="small" @click="removeTask(index)">删除</el-button>
            </div>
            
            <el-button type="dashed" @click="addTask" style="width: 100%">
              <el-icon><Plus /></el-icon>
              添加任务
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item>
          <div class="form-actions">
            <el-button @click="saveDraft">保存草稿</el-button>
            <el-button type="primary" @click="submitPlan" :loading="submitting">提交审核</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, MagicStick } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const planFormRef = ref<FormInstance>()
const aiLoading = ref(false)
const submitting = ref(false)
const aiPrompt = ref('')

const planForm = reactive({
  title: '',
  cycle: '',
  priority: 'medium',
  estimatedHours: 8,
  startDate: '',
  endDate: '',
  project: '',
  department: '',
  description: '',
  tasks: [
    { title: '', description: '', priority: 'medium' }
  ]
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  cycle: [{ required: true, message: '请选择计划周期', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }]
}

const addTask = () => {
  planForm.tasks.push({ title: '', description: '', priority: 'medium' })
}

const removeTask = (index: number) => {
  if (planForm.tasks.length > 1) {
    planForm.tasks.splice(index, 1)
  }
}

const generatePlan = async () => {
  if (!aiPrompt.value) return
  aiLoading.value = true
  
  setTimeout(() => {
    planForm.description = '基于AI分析，此计划包含以下关键任务：需求分析、方案设计、开发实现、测试验证和上线部署。建议按阶段逐步推进，确保每个环节的质量。'
    planForm.tasks = [
      { title: '需求分析', description: '收集并分析需求，编写需求文档', priority: 'high' },
      { title: '方案设计', description: '设计技术方案和架构', priority: 'high' },
      { title: '开发实现', description: '按方案进行开发', priority: 'medium' },
      { title: '测试验证', description: '进行功能测试和性能测试', priority: 'medium' },
      { title: '上线部署', description: '部署到生产环境', priority: 'low' }
    ]
    aiLoading.value = false
  }, 1500)
}

const saveDraft = () => {
  localStorage.setItem('plan_draft', JSON.stringify(planForm))
  alert('草稿已保存')
}

const submitPlan = async () => {
  await planFormRef.value?.validate()
  submitting.value = true
  
  setTimeout(() => {
    localStorage.removeItem('plan_draft')
    submitting.value = false
    alert('计划提交成功，等待审核')
    router.push('/plan-list')
  }, 1000)
}
</script>

<style scoped>
.plan-create {
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

.form-card {
  max-width: 900px;
}

.ai-section {
  display: flex;
  gap: 12px;
}

.ai-section .el-input {
  flex: 1;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.task-item .el-form-item {
  margin-bottom: 0;
}

.task-item .el-input {
  flex: 1;
  min-width: 150px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
