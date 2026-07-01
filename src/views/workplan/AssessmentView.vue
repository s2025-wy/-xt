<template>
  <div class="assessment">
    <div class="page-header">
      <h1>考核评分</h1>
      <p>对员工的计划执行情况进行考核评分</p>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="filterPeriod" placeholder="考核周期" style="width: 150px">
        <el-option label="本月" value="month" />
        <el-option label="本季度" value="quarter" />
        <el-option label="本年度" value="year" />
      </el-select>
      
      <el-select v-model="filterDepartment" placeholder="部门筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="研发部" value="rd" />
        <el-option label="产品部" value="product" />
        <el-option label="市场部" value="marketing" />
      </el-select>
      
      <el-input v-model="searchKeyword" placeholder="搜索员工姓名" style="width: 200px" />
      
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>
    
    <el-card>
      <el-table :data="employees" border>
        <el-table-column prop="name" label="员工姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="completionRate" label="计划完成率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="timeliness" label="及时性" width="100">
          <template #default="{ row }">
            <span :class="getScoreClass(row.timeliness)">{{ row.timeliness }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="quality" label="质量评分" width="100">
          <template #default="{ row }">
            <span :class="getScoreClass(row.quality)">{{ row.quality }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="initiative" label="主动性" width="100">
          <template #default="{ row }">
            <span :class="getScoreClass(row.initiative)">{{ row.initiative }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="cooperation" label="协作度" width="100">
          <template #default="{ row }">
            <span :class="getScoreClass(row.cooperation)">{{ row.cooperation }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总分" width="100">
          <template #default="{ row }">
            <span class="total-score">{{ row.total }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="100">
          <template #default="{ row }">
            <span :class="getLevelClass(row.level)">{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="scoreEmployee(row)">评分</el-button>
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
    
    <el-dialog v-model="showScoreModal" title="考核评分" width="600px">
      <el-form :model="scoreForm" label-width="100px">
        <el-form-item label="员工姓名">
          <el-input v-model="scoreForm.name" disabled />
        </el-form-item>
        <el-form-item label="计划完成率">
          <el-input-number v-model="scoreForm.completionRate" :min="0" :max="100" />
          <span style="margin-left: 8px">%</span>
          <span style="margin-left: 16px; color: #909399">权重30%</span>
        </el-form-item>
        <el-form-item label="及时性">
          <el-rate v-model="scoreForm.timeliness" :max="5" />
          <span style="margin-left: 8px; color: #909399">权重20%</span>
        </el-form-item>
        <el-form-item label="质量评分">
          <el-rate v-model="scoreForm.quality" :max="5" />
          <span style="margin-left: 8px; color: #909399">权重25%</span>
        </el-form-item>
        <el-form-item label="主动性">
          <el-rate v-model="scoreForm.initiative" :max="5" />
          <span style="margin-left: 8px; color: #909399">权重15%</span>
        </el-form-item>
        <el-form-item label="协作度">
          <el-rate v-model="scoreForm.cooperation" :max="5" />
          <span style="margin-left: 8px; color: #909399">权重10%</span>
        </el-form-item>
        <el-form-item label="考核评语">
          <el-input v-model="scoreForm.comment" type="textarea" :rows="3" placeholder="请输入考核评语" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showScoreModal = false">取消</el-button>
        <el-button type="primary" @click="confirmScore">确认评分</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface Employee {
  name: string
  department: string
  completionRate: number
  timeliness: number
  quality: number
  initiative: number
  cooperation: number
  total: number
  level: string
}

const filterPeriod = ref('month')
const filterDepartment = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showScoreModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

const scoreForm = reactive({
  name: '',
  completionRate: 0,
  timeliness: 4,
  quality: 4,
  initiative: 4,
  cooperation: 4,
  comment: ''
})

const employees = ref<Employee[]>([
  { name: '张三', department: '产品部', completionRate: 90, timeliness: 5, quality: 5, initiative: 4, cooperation: 4, total: 92, level: '优秀' },
  { name: '李四', department: '研发部', completionRate: 85, timeliness: 4, quality: 4, initiative: 3, cooperation: 4, total: 85, level: '良好' },
  { name: '王五', department: '研发部', completionRate: 75, timeliness: 3, quality: 4, initiative: 3, cooperation: 3, total: 78, level: '合格' },
  { name: '赵六', department: '市场部', completionRate: 60, timeliness: 3, quality: 3, initiative: 4, cooperation: 4, total: 70, level: '待改进' },
  { name: '孙七', department: '研发部', completionRate: 88, timeliness: 5, quality: 4, initiative: 5, cooperation: 3, total: 87, level: '良好' },
  { name: '周八', department: '产品部', completionRate: 95, timeliness: 5, quality: 5, initiative: 5, cooperation: 5, total: 96, level: '优秀' }
])

const total = computed(() => employees.value.length)

const getScoreClass = (score: number) => {
  if (score >= 80 || score >= 4) return 'score-high'
  if (score >= 60 || score >= 3) return 'score-medium'
  return 'score-low'
}

const getLevelClass = (level: string) => {
  const classes: Record<string, string> = {
    '优秀': 'level-excellent',
    '良好': 'level-good',
    '合格': 'level-pass',
    '待改进': 'level-improve'
  }
  return classes[level] || ''
}

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value, filterPeriod.value, filterDepartment.value)
}

const viewDetail = (employee: Employee) => {
  console.log('查看详情:', employee)
}

const scoreEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
  scoreForm.name = employee.name
  scoreForm.completionRate = employee.completionRate
  scoreForm.timeliness = employee.timeliness
  scoreForm.quality = employee.quality
  scoreForm.initiative = employee.initiative
  scoreForm.cooperation = employee.cooperation
  scoreForm.comment = ''
  showScoreModal.value = true
}

const confirmScore = () => {
  if (selectedEmployee.value) {
    const totalScore = Math.round(
      scoreForm.completionRate * 0.3 +
      scoreForm.timeliness * 20 +
      scoreForm.quality * 5 +
      scoreForm.initiative * 3 +
      scoreForm.cooperation * 2
    )
    selectedEmployee.value.completionRate = scoreForm.completionRate
    selectedEmployee.value.timeliness = scoreForm.timeliness
    selectedEmployee.value.quality = scoreForm.quality
    selectedEmployee.value.initiative = scoreForm.initiative
    selectedEmployee.value.cooperation = scoreForm.cooperation
    selectedEmployee.value.total = totalScore
    selectedEmployee.value.level = totalScore >= 90 ? '优秀' : totalScore >= 80 ? '良好' : totalScore >= 70 ? '合格' : '待改进'
    alert('评分成功')
  }
  showScoreModal.value = false
}
</script>

<style scoped>
.assessment {
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

.total-score {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

.score-high {
  color: #52c41a;
  font-weight: 500;
}

.score-medium {
  color: #fa8c16;
  font-weight: 500;
}

.score-low {
  color: #ff4d4f;
  font-weight: 500;
}

.level-excellent {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.level-good {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.level-pass {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.level-improve {
  background: #fff1f0;
  color: #ff4d4f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
